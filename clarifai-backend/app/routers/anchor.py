from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

from app.services.narrative_service import narrative_service
from app.services.news_service import news_service

router = APIRouter(prefix="/anchor", tags=["AI Anchor"])


class GenerateScriptRequest(BaseModel):
    topic: str
    tone: str = "professional"
    duration: str = "short"
    verified_claims: Optional[List[str]] = None
    conflicting_claims: Optional[List[dict]] = None
    false_claims: Optional[List[str]] = None


@router.post("/generate")
async def generate_anchor_script(request: GenerateScriptRequest):
    """
    Generate an AI news anchor script for a topic
    """
    try:
        # If no claims provided, get from news
        verified_claims = request.verified_claims
        if not verified_claims:
            news_results = news_service.google_news_search(request.topic, num_results=10)
            verified_claims = [n.get("title", "") for n in news_results[:5]]

        script = narrative_service.generate_anchor_script(
            topic_title=request.topic,
            verified_claims=verified_claims,
            conflicting_claims=request.conflicting_claims,
            false_claims=request.false_claims,
            tone=request.tone,
            duration=request.duration
        )

        return script
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/timeline/{topic}")
async def get_cinematic_timeline(topic: str):
    """
    Generate a cinematic timeline for visualization
    """
    try:
        timeline = narrative_service.generate_cinematic_timeline(topic)

        if not timeline:
            return {
                "topic": topic,
                "narrative_arc": [],
                "message": "No data available for this topic"
            }

        return timeline
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/preview")
async def get_script_preview(topic: str):
    """
    Get a quick preview/template script for a topic
    """
    return {
        "topic": topic,
        "segments": [
            {
                "text": f"Good evening. Here's your verified briefing on {topic}.",
                "mood": "neutral",
                "view": "upper",
                "gesture": None,
                "voice": "af_bella",
                "speed": 1.0,
                "delay": 800
            },
            {
                "text": "Based on multiple verified sources, here's what we know so far.",
                "mood": "neutral",
                "view": "upper",
                "gesture": "nod",
                "voice": "af_bella",
                "speed": 1.0,
                "delay": 800
            },
            {
                "text": "We will continue to monitor this developing story and provide updates as more verified information becomes available.",
                "mood": "neutral",
                "view": "upper",
                "gesture": None,
                "voice": "af_bella",
                "speed": 1.0,
                "delay": 800
            },
            {
                "text": "This is ClarifAI, bringing you truth in the age of misinformation.",
                "mood": "neutral",
                "view": "upper",
                "gesture": "wave",
                "voice": "af_bella",
                "speed": 1.0,
                "delay": 500
            }
        ],
        "preview": True
    }
