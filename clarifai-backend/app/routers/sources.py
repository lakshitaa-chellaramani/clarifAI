from fastapi import APIRouter, HTTPException
from typing import List

from app.services.graph_service import graph_service

router = APIRouter(prefix="/sources", tags=["Sources"])

# Default sources with trust scores (fallback)
DEFAULT_SOURCES = [
    {
        "id": "timesofindia",
        "name": "Times of India",
        "domain": "timesofindia.com",
        "trust_score": 85,
        "change": 2,
        "verified_claims": 12,
        "contradictions": 1
    },
    {
        "id": "ndtv",
        "name": "NDTV",
        "domain": "ndtv.com",
        "trust_score": 82,
        "change": -1,
        "verified_claims": 9,
        "contradictions": 2
    },
    {
        "id": "hindustantimes",
        "name": "Hindustan Times",
        "domain": "hindustantimes.com",
        "trust_score": 80,
        "change": 0,
        "verified_claims": 7,
        "contradictions": 1
    },
    {
        "id": "indiatoday",
        "name": "India Today",
        "domain": "indiatoday.in",
        "trust_score": 78,
        "change": 1,
        "verified_claims": 8,
        "contradictions": 2
    },
    {
        "id": "thehindu",
        "name": "The Hindu",
        "domain": "thehindu.com",
        "trust_score": 88,
        "change": 3,
        "verified_claims": 15,
        "contradictions": 0
    }
]


@router.get("")
async def get_sources():
    """
    Get all tracked sources with their credibility scores
    """
    try:
        # Try to get from Neo4j first
        sources = graph_service.get_sources_with_trust()

        if sources:
            return {
                "sources": sources,
                "total": len(sources)
            }
    except Exception as e:
        print(f"Error getting sources from graph: {e}")

    # Fallback to defaults
    return {
        "sources": DEFAULT_SOURCES,
        "total": len(DEFAULT_SOURCES)
    }


@router.get("/{source_id}")
async def get_source_detail(source_id: str):
    """
    Get detailed information about a specific source
    """
    # Find in defaults
    source = next(
        (s for s in DEFAULT_SOURCES if s["id"] == source_id or s["domain"] == source_id),
        None
    )

    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    return source


@router.post("/recalculate")
async def recalculate_trust_scores():
    """
    Recalculate trust scores based on verification history
    """
    try:
        sources = graph_service.calculate_source_trust()

        if sources:
            return {
                "success": True,
                "sources": sources
            }
        else:
            return {
                "success": True,
                "sources": DEFAULT_SOURCES,
                "message": "Using default scores (no graph data available)"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
