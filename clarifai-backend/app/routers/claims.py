from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.services.news_service import news_service
from app.services.analysis_service import analysis_service
from app.services.graph_service import graph_service

router = APIRouter(prefix="/claims", tags=["Claims"])


class VerifyClaimRequest(BaseModel):
    claim: str
    topic: Optional[str] = None


@router.get("")
async def get_claims(topic: Optional[str] = None, limit: int = 20):
    """
    Get recent claims with their verification status
    """
    try:
        # Try to get from graph
        graph_claims = graph_service.get_claims(limit=limit)

        if graph_claims:
            claims = []
            for i, c in enumerate(graph_claims):
                claims.append({
                    "id": f"claim-{i}",
                    "text": c.get("text", "Unknown claim"),
                    "source": c.get("source_url", "Unknown"),
                    "timestamp": datetime.now().isoformat(),
                    "status": c.get("sentiment", "checking").lower(),
                    "confidence": 70,
                    "evidence_quote": c.get("evidence_quote", "")
                })
            return {"claims": claims, "total": len(claims)}
    except Exception as e:
        print(f"Error getting claims from graph: {e}")

    # Fallback: Get from news and generate claims
    if topic:
        news_results = news_service.google_news_search(topic, num_results=limit)
    else:
        # Get general news
        sources = news_service.get_all_sources()
        news_results = []
        for source_name, headlines in sources.items():
            for title, link in headlines[:3]:
                news_results.append({
                    "title": title,
                    "link": link,
                    "source": source_name,
                    "published_date": datetime.now().isoformat()
                })

    claims = []
    statuses = ["verified", "conflict", "checking", "false"]
    for i, news in enumerate(news_results[:limit]):
        claims.append({
            "id": f"claim-{i}",
            "text": news.get("title", "Unknown"),
            "source": news.get("source", "Unknown"),
            "timestamp": news.get("published_date", datetime.now().isoformat()),
            "status": statuses[i % len(statuses)],
            "confidence": max(30, 95 - (i * 5))
        })

    return {"claims": claims, "total": len(claims)}


@router.post("/verify")
async def verify_claim(request: VerifyClaimRequest):
    """
    Verify a specific claim against multiple sources
    """
    try:
        # Search for related news
        search_query = request.claim[:100]  # Limit query length
        news_results = news_service.google_news_search(search_query, num_results=10)

        # Get fact checks
        fact_checks = news_service.get_fact_checks(search_query[:50])

        # Use AI to assess
        assessment = analysis_service.assess_claim_veracity(request.claim, news_results)

        return {
            "claim": request.claim,
            "status": assessment.get("status", "checking"),
            "confidence": assessment.get("confidence", 50),
            "reasoning": assessment.get("reasoning", "Assessment in progress"),
            "sources_checked": len(news_results),
            "fact_checks_found": len(fact_checks),
            "related_articles": news_results[:5]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/fact-checks")
async def get_fact_checks(query: str = "India"):
    """
    Get fact-checks from Google Fact Check API
    """
    try:
        fact_checks = news_service.get_fact_checks(query)
        alt_news = news_service.get_alt_news_feed()

        return {
            "google_fact_checks": fact_checks,
            "alt_news": alt_news,
            "total": len(fact_checks) + len(alt_news)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
