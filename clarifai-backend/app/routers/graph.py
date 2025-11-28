from fastapi import APIRouter, HTTPException
from typing import List, Optional

from app.services.graph_service import graph_service

router = APIRouter(prefix="/graph", tags=["Knowledge Graph"])


@router.get("/stats")
async def get_graph_stats():
    """
    Get statistics about the knowledge graph
    """
    stats = graph_service.get_graph_stats()
    return stats


@router.get("/nodes")
async def get_graph_nodes(
    topic: Optional[str] = None,
    limit: int = 50
):
    """
    Get nodes and edges for visualization
    """
    try:
        keywords = None
        if topic:
            keywords = [w for w in topic.split() if len(w) > 3]

        data = graph_service.get_knowledge_graph_data(keywords, limit=limit)

        # Return the full graph data format
        return {
            "topic": data.get("topic", topic or "Breaking News"),
            "graph_type": data.get("graph_type", "Directed Acyclic Graph (DAG)"),
            "description": data.get("description", f"Timeline of events related to {topic or 'current news'}"),
            "nodes": data.get("nodes", []),
            "edges": data.get("edges", []),
            "total_nodes": len(data.get("nodes", [])),
            "total_edges": len(data.get("edges", []))
        }
    except Exception as e:
        print(f"Error: {e}")
        # Return mock graph on error
        mock_data = graph_service._get_mock_graph_data(topic or "Breaking News")
        return {
            "topic": mock_data.get("topic"),
            "graph_type": mock_data.get("graph_type"),
            "description": mock_data.get("description"),
            "nodes": mock_data.get("nodes", []),
            "edges": mock_data.get("edges", []),
            "total_nodes": len(mock_data.get("nodes", [])),
            "total_edges": len(mock_data.get("edges", []))
        }


@router.get("/events")
async def get_events(limit: int = 20):
    """
    Get recent events from the knowledge graph
    """
    events = graph_service.get_recent_events(limit=limit)
    return {"events": events, "total": len(events)}


@router.get("/entities")
async def get_entities(topic: Optional[str] = None):
    """
    Get entities related to a topic
    """
    keywords = None
    if topic:
        keywords = [w for w in topic.split() if len(w) > 3]

    data = graph_service.get_knowledge_graph_data(keywords, limit=100)

    entities = [
        node for node in data.get("nodes", [])
        if node.get("type") == "entity"
    ]

    return {"entities": entities, "total": len(entities)}
