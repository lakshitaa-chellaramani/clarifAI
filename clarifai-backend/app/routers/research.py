from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from typing import Optional
import json
import asyncio

from app.services.research_service import research_service

router = APIRouter(prefix="/research", tags=["research"])


class ResearchRequest(BaseModel):
    query: str
    depth: str = "comprehensive"  # "quick", "standard", "comprehensive"


@router.post("/analyze")
async def analyze_research_topic(request: ResearchRequest):
    """
    Generate a comprehensive research knowledge graph for a topic.
    Returns structured data with source citations for every finding.
    """
    try:
        result = research_service.generate_research_graph(
            query=request.query,
            depth=request.depth
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analyze")
async def analyze_research_topic_get(
    query: str = Query(..., description="Research query/topic"),
    depth: str = Query("comprehensive", description="Research depth: quick, standard, comprehensive")
):
    """
    Generate a comprehensive research knowledge graph for a topic (GET version).
    """
    try:
        result = research_service.generate_research_graph(query=query, depth=depth)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analyze/stream")
async def stream_research_analysis(
    query: str = Query(..., description="Research query/topic"),
    depth: str = Query("comprehensive", description="Research depth")
):
    """
    Stream research analysis node by node using Server-Sent Events.
    Provides real-time updates as the research graph is built.
    """

    async def generate():
        try:
            # Generate the full research
            result = research_service.generate_research_graph(query=query, depth=depth)

            nodes = result.get("nodes", [])
            edges = result.get("edges", [])

            # Send metadata first
            yield f"data: {json.dumps({'type': 'metadata', 'topic': result.get('topic'), 'summary': result.get('summary'), 'total_nodes': len(nodes), 'total_edges': len(edges)})}\n\n"
            await asyncio.sleep(0.1)

            # Stream nodes one by one
            sent_node_ids = set()
            for i, node in enumerate(nodes):
                sent_node_ids.add(node["id"])

                # Find edges that can now be sent
                relevant_edges = [
                    edge for edge in edges
                    if edge["source"] in sent_node_ids and edge["target"] in sent_node_ids
                ]
                new_edges = [e for e in relevant_edges if not e.get("_sent")]
                for e in new_edges:
                    e["_sent"] = True
                clean_edges = [{k: v for k, v in e.items() if k != "_sent"} for e in new_edges]

                yield f"data: {json.dumps({'type': 'node', 'node': node, 'edges': clean_edges, 'progress': ((i + 1) / len(nodes)) * 100})}\n\n"
                await asyncio.sleep(0.6)  # Slightly faster for research

            # Send sources
            sources = result.get("sources", [])
            if sources:
                yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"
                await asyncio.sleep(0.2)

            # Send completion
            yield f"data: {json.dumps({'type': 'complete', 'total_nodes': len(nodes), 'total_edges': len(edges), 'methodology': result.get('methodology', '')})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*"
        }
    )


@router.post("/report")
async def generate_report(request: ResearchRequest):
    """
    Generate a downloadable markdown report for a research topic.
    """
    try:
        # First generate the research
        research_data = research_service.generate_research_graph(
            query=request.query,
            depth=request.depth
        )

        # Generate markdown report
        markdown_report = research_service.generate_report_markdown(research_data)

        return {
            "report": markdown_report,
            "research_data": research_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/report/download")
async def download_report(
    query: str = Query(..., description="Research query/topic"),
    depth: str = Query("comprehensive", description="Research depth")
):
    """
    Generate and download a markdown report as a file.
    """
    try:
        # Generate research
        research_data = research_service.generate_research_graph(query=query, depth=depth)

        # Generate markdown
        markdown_report = research_service.generate_report_markdown(research_data)

        # Create filename
        safe_filename = "".join(c if c.isalnum() or c in " -_" else "_" for c in query[:50])
        filename = f"research_report_{safe_filename}.md"

        return Response(
            content=markdown_report,
            media_type="text/markdown",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
