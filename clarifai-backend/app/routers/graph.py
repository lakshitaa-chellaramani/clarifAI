from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import List, Optional
import json
import asyncio

from app.services.graph_service import graph_service
from app.services.narrative_graph_service import narrative_graph_service

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


@router.get("/narrative")
async def get_narrative_graph(topic: str):
    """
    Generate a narrative graph for a topic using AI.
    Returns nodes and edges in the narrative graph format.
    """
    try:
        result = narrative_graph_service.generate_narrative_graph(topic)
        return result
    except Exception as e:
        print(f"Error generating narrative graph: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/narrative/stream")
async def stream_narrative_graph(topic: str):
    """
    Stream narrative graph data node by node for real-time visualization.
    Uses Server-Sent Events (SSE) format.
    """
    async def generate():
        try:
            # Get the full narrative graph
            result = narrative_graph_service.generate_narrative_graph(topic)
            nodes = result.get("nodes", [])
            edges = result.get("edges", [])

            # Send metadata first
            yield f"data: {json.dumps({'type': 'metadata', 'topic': result.get('topic'), 'total_nodes': len(nodes), 'total_edges': len(edges)})}\n\n"
            await asyncio.sleep(0.1)

            # Stream nodes one by one with delay
            sent_node_ids = set()
            for i, node in enumerate(nodes):
                sent_node_ids.add(node["id"])

                # Find edges that can be sent (both source and target nodes have been sent)
                relevant_edges = [
                    edge for edge in edges
                    if edge["source"] in sent_node_ids and edge["target"] in sent_node_ids
                ]

                # Only send new edges
                new_edges = [e for e in relevant_edges if not e.get("_sent")]
                for e in new_edges:
                    e["_sent"] = True

                # Clean edges before sending
                clean_edges = [{k: v for k, v in e.items() if k != "_sent"} for e in new_edges]

                yield f"data: {json.dumps({'type': 'node', 'node': node, 'edges': clean_edges, 'progress': ((i + 1) / len(nodes)) * 100})}\n\n"
                await asyncio.sleep(0.8)  # Delay between nodes for animation effect

            # Send completion message
            yield f"data: {json.dumps({'type': 'complete', 'total_nodes': len(nodes), 'total_edges': len(edges)})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        }
    )
