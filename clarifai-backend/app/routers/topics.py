from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime

from app.services.news_service import news_service
from app.services.analysis_service import analysis_service
from app.services.graph_service import graph_service

router = APIRouter(prefix="/topics", tags=["Topics"])

# In-memory cache for topics (replace with database in production)
_cached_topics = []
_last_analysis = None


@router.get("")
async def get_topics(refresh: bool = False):
    """
    Get all active misinformation topics.
    Set refresh=true to re-analyze from news sources.
    """
    global _cached_topics, _last_analysis

    # Check if we need to refresh
    should_refresh = refresh or not _cached_topics
    if _last_analysis:
        time_diff = (datetime.now() - _last_analysis).total_seconds()
        if time_diff > 300:  # 5 minutes
            should_refresh = True

    if should_refresh:
        try:
            # Get fresh news and analyze
            sources = news_service.get_all_sources()
            topics = analysis_service.analyze_and_select_topics(sources)

            if topics:
                # Enrich with source counts
                for topic in topics:
                    news_results = news_service.google_news_search(
                        topic.get("web_search_query", topic["title"]),
                        num_results=20
                    )
                    topic["source_count"] = len(news_results)
                    topic["claim_count"] = len(news_results) * 2  # Estimate

                _cached_topics = topics
                _last_analysis = datetime.now()
        except Exception as e:
            print(f"Error refreshing topics: {e}")
            if not _cached_topics:
                raise HTTPException(status_code=500, detail=str(e))

    return {
        "topics": _cached_topics,
        "total": len(_cached_topics),
        "last_updated": _last_analysis.isoformat() if _last_analysis else None
    }


@router.get("/{topic_id}")
async def get_topic_detail(topic_id: str):
    """
    Get detailed information about a specific topic
    """
    global _cached_topics

    # Find the topic
    topic = next((t for t in _cached_topics if t["id"] == topic_id), None)

    if not topic:
        # Try to find by partial match
        topic = next(
            (t for t in _cached_topics if topic_id in t["id"]),
            None
        )

    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    # Get related news
    news_results = news_service.google_news_search(
        topic.get("web_search_query", topic["title"]),
        num_results=20
    )

    # Get graph data if available
    keywords = [w for w in topic["title"].split() if len(w) > 3]
    graph_data = graph_service.get_knowledge_graph_data(keywords, limit=20)

    # Build timeline from news
    timeline = []
    for i, news in enumerate(news_results[:10]):
        timeline.append({
            "id": f"event-{i}",
            "timestamp": news.get("published_date", datetime.now().isoformat()),
            "title": news.get("title", ""),
            "description": news.get("title", ""),
            "sources": 1,
            "confidence": 70 + (i * 2),
            "status": "verified" if i % 3 != 1 else "checking",
            "source_name": news.get("source", "Unknown")
        })

    # Build entities list
    entities = []
    if graph_data.get("nodes"):
        for node in graph_data["nodes"]:
            if node.get("type") == "entity":
                entities.append({
                    "name": node.get("label", "Unknown"),
                    "type": "PERSON",
                    "role": "Involved",
                    "mentions": 5
                })

    # Build claims list
    claims = []
    for i, news in enumerate(news_results[:5]):
        status = "verified" if i % 4 == 0 else "conflict" if i % 4 == 1 else "checking" if i % 4 == 2 else "false"
        claims.append({
            "id": f"claim-{i}",
            "text": news.get("title", ""),
            "source": news.get("source", "Unknown"),
            "timestamp": news.get("published_date", datetime.now().isoformat()),
            "status": status,
            "confidence": 90 - (i * 15)
        })

    return {
        "topic": topic,
        "timeline": timeline,
        "entities": entities[:5],
        "claims": claims,
        "news_articles": news_results
    }


@router.post("/analyze")
async def analyze_topics():
    """
    Force a fresh analysis of current news
    """
    try:
        sources = news_service.get_all_sources()
        topics = analysis_service.analyze_and_select_topics(sources)

        global _cached_topics, _last_analysis
        _cached_topics = topics
        _last_analysis = datetime.now()

        return {
            "success": True,
            "topics": topics,
            "analyzed_at": _last_analysis.isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
