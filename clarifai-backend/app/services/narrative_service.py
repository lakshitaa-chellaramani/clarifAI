import os
import json
from typing import List, Dict, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from app.config import settings
from app.services.graph_service import graph_service

os.environ["GOOGLE_API_KEY"] = settings.GOOGLE_API_KEY


class NarrativeScene(BaseModel):
    sequence_id: int
    timestamp: str
    location: str = "Unknown"
    headline: str
    visual_description: str = Field(description="Scene description for visualization")
    entities_present: List[str] = []
    action_log: str
    conflicting_claims: Optional[str] = None


class CinematicReport(BaseModel):
    topic: str
    narrative_arc: List[NarrativeScene]


class AnchorSegment(BaseModel):
    text: str
    mood: str = "neutral"
    view: str = "upper"
    gesture: Optional[str] = None


class AnchorScript(BaseModel):
    segments: List[AnchorSegment]


class NarrativeService:
    """Service for generating narrative timelines and anchor scripts"""

    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.4  # Slightly creative for storytelling
        )

    def generate_cinematic_timeline(self, topic_title: str) -> Optional[Dict]:
        """
        Generate a cinematic timeline for a topic
        """
        # Get relevant events from graph
        keywords = [w for w in topic_title.split() if len(w) > 3]
        if not keywords:
            keywords = topic_title.split()

        graph_data = graph_service.get_knowledge_graph_data(keywords, limit=30)

        if not graph_data.get("nodes"):
            # Fallback to recent events
            events = graph_service.get_recent_events(limit=10)
            if not events:
                return None
            graph_data = {"events": events}

        system_prompt = """
        You are a Director of Information Visualization.
        I will give you a sequence of factual events extracted from a Knowledge Graph regarding the topic: "{topic}".

        Your Goal: Output a structured JSON that represents a 'Video Timeline'.

        INSTRUCTIONS:
        1. Sequence ID: Increment from 1.
        2. Visual Description: Vividly describe what the scene looks like.
        3. Action Log: A concise summary of the event.
        4. Conflicting Claims: If sources disagree, note it here.
        5. STRICT CHRONOLOGY: Ensure the output follows the time order.
        """

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "Raw Graph Data:\n{graph_data}")
        ])

        try:
            chain = prompt | self.llm.with_structured_output(CinematicReport)
            result = chain.invoke({
                "topic": topic_title,
                "graph_data": str(graph_data)
            })

            return {
                "topic": result.topic,
                "narrative_arc": [scene.model_dump() for scene in result.narrative_arc]
            }
        except Exception as e:
            print(f"Error generating timeline: {e}")
            return None

    def generate_anchor_script(
        self,
        topic_title: str,
        verified_claims: List[str],
        conflicting_claims: List[Dict] = None,
        false_claims: List[str] = None,
        tone: str = "professional",
        duration: str = "short"
    ) -> Dict:
        """
        Generate a news anchor script from verified information
        """
        # Build context
        verified_text = "\n".join([f"- {c}" for c in verified_claims]) if verified_claims else "No verified claims yet."

        conflicts_text = ""
        if conflicting_claims:
            conflicts_text = "\n".join([
                f"- {c.get('claim_a', '')} vs {c.get('claim_b', '')}"
                for c in conflicting_claims
            ])

        false_text = "\n".join([f"- {c}" for c in false_claims]) if false_claims else ""

        duration_guide = {
            "short": "2-3 segments, approximately 1-2 minutes",
            "medium": "4-5 segments, approximately 2-4 minutes",
            "detailed": "6-8 segments, approximately 4-6 minutes"
        }

        system_prompt = f"""
        You are a professional news anchor writer for ClarifAI.

        Topic: {topic_title}
        Tone: {tone}
        Duration: {duration_guide.get(duration, duration_guide['short'])}

        VERIFIED FACTS:
        {verified_text}

        CONFLICTING REPORTS:
        {conflicts_text or "None"}

        FALSE CLAIMS TO ADDRESS:
        {false_text or "None"}

        Write a news anchor script with the following structure:
        1. Opening greeting and topic introduction
        2. Present verified facts clearly
        3. Address any conflicts (mention both sides, state uncertainty)
        4. Debunk false claims if any
        5. Closing with commitment to updates

        Each segment should have:
        - text: What the anchor says
        - mood: neutral, happy, or serious
        - view: upper, mid, or head
        - gesture: null, nod, or wave (use sparingly)
        """

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "Generate the anchor script now.")
        ])

        try:
            chain = prompt | self.llm.with_structured_output(AnchorScript)
            result = chain.invoke({})

            return {
                "topic": topic_title,
                "segments": [
                    {
                        "text": seg.text,
                        "mood": seg.mood,
                        "view": seg.view,
                        "gesture": seg.gesture,
                        "voice": "af_bella",
                        "speed": 1.0,
                        "delay": 800
                    }
                    for seg in result.segments
                ],
                "sources_cited": [],
                "generated_at": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error generating anchor script: {e}")
            # Return a default script
            return {
                "topic": topic_title,
                "segments": [
                    {
                        "text": f"Good evening. Here's your verified briefing on {topic_title}.",
                        "mood": "neutral",
                        "view": "upper",
                        "gesture": None,
                        "voice": "af_bella",
                        "speed": 1.0,
                        "delay": 800
                    },
                    {
                        "text": "We are currently gathering and verifying information from multiple sources. Please stay tuned for updates.",
                        "mood": "neutral",
                        "view": "upper",
                        "gesture": "nod",
                        "voice": "af_bella",
                        "speed": 1.0,
                        "delay": 800
                    },
                    {
                        "text": "This is ClarifAI, bringing you truth in the age of misinformation.",
                        "mood": "neutral",
                        "view": "upper",
                        "gesture": None,
                        "voice": "af_bella",
                        "speed": 1.0,
                        "delay": 500
                    }
                ],
                "sources_cited": [],
                "generated_at": datetime.now().isoformat()
            }


# Singleton instance
narrative_service = NarrativeService()
