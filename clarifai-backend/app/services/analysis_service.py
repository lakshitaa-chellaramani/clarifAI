import os
import json
import re
from typing import List, Dict, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from app.config import settings
from app.services.news_service import news_service

# Set API key
os.environ["GOOGLE_API_KEY"] = settings.GOOGLE_API_KEY


# --- Pydantic Models for LLM Output ---
class TopicAnalysisModel(BaseModel):
    topic_title: str = Field(..., description="A neutral, factual title of the event")
    risk_score: int = Field(..., description="1-10 Score. 10 = High misinformation potential")
    reasoning: str = Field(..., description="Why is this high risk?")
    web_search_query: str = Field(..., description="Query to find more news sources")


class DailyIntelligenceBrief(BaseModel):
    selected_topics: List[TopicAnalysisModel] = Field(..., description="Select exactly 3 most critical topics")


class ClaimExtraction(BaseModel):
    claims: List[str] = Field(..., description="List of factual claims that can be verified")


class AnalysisService:
    """Service for AI-powered analysis of news topics"""

    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-lite",
            temperature=0.1
        )

    def analyze_and_select_topics(self, sources_dict: Optional[Dict] = None) -> List[Dict]:
        """
        Analyze headlines and identify high-risk misinformation topics
        """
        if sources_dict is None:
            sources_dict = news_service.get_all_sources()

        # Build news text
        news_text = ""
        for source, headlines in sources_dict.items():
            news_text += f"\n## {source}\n"
            for title, link in headlines[:5]:
                news_text += f"- {title}\n"

        system_prompt = """
        You are the Chief Information Security Officer for a News Intelligence Agency.

        Your Goal: Scan the raw headlines from multiple outlets and identify 3 events that have the HIGHEST PROBABILITY of generating misinformation, rumors, or polarized narratives.

        Criteria for Selection:
        1. **Conflict:** Stories with opposing political statements.
        2. **Ambiguity:** Events where details are scarce (e.g., "Explosion," "Crash").
        3. **Viral Potential:** Topics involving religion, identity, or famous figures.

        Output Format:
        Return a structured JSON with exactly 3 selected topics.
        """

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "Here are the trending headlines:\n{news_data}")
        ])

        try:
            chain = prompt | self.llm.with_structured_output(DailyIntelligenceBrief)
            result = chain.invoke({"news_data": news_text})

            topics = []
            for i, topic in enumerate(result.selected_topics):
                topics.append({
                    "id": f"topic-{i+1}-{re.sub(r'[^a-z0-9]', '-', topic.topic_title.lower())[:20]}",
                    "title": topic.topic_title,
                    "risk_score": topic.risk_score,
                    "reasoning": topic.reasoning,
                    "web_search_query": topic.web_search_query,
                    "source_count": 0,
                    "claim_count": 0,
                    "is_new": True,
                    "first_detected": datetime.now().isoformat()
                })

            return topics
        except Exception as e:
            print(f"Error analyzing topics: {e}")
            return []

    def extract_claims_from_text(self, text: str) -> List[str]:
        """Extract verifiable claims from article text"""
        system_prompt = """
        You are a Fact-Check Analyst. Extract all factual claims from the given text that can be independently verified.

        Rules:
        1. Each claim should be a single, verifiable statement
        2. Remove opinions and subjective statements
        3. Keep claims concise and specific
        4. Include numbers, dates, and names when present

        Return a JSON list of claims.
        """

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "Text to analyze:\n{text}")
        ])

        try:
            chain = prompt | self.llm.with_structured_output(ClaimExtraction)
            result = chain.invoke({"text": text})
            return result.claims
        except Exception as e:
            print(f"Error extracting claims: {e}")
            return []

    def assess_claim_veracity(self, claim: str, sources: List[Dict]) -> Dict:
        """
        Assess the veracity of a claim based on multiple sources
        """
        sources_text = "\n".join([
            f"- {s.get('source', 'Unknown')}: {s.get('title', '')}"
            for s in sources[:10]
        ])

        system_prompt = """
        You are a Fact-Check Analyst. Assess the veracity of the given claim based on the provided sources.

        Provide:
        1. status: "verified", "conflict", "false", or "checking"
        2. confidence: 0-100 score
        3. reasoning: Brief explanation

        Return as JSON.
        """

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "Claim: {claim}\n\nSources:\n{sources}")
        ])

        try:
            chain = prompt | self.llm
            result = chain.invoke({"claim": claim, "sources": sources_text})

            # Parse the response
            content = result.content
            # Try to extract JSON from response
            json_match = re.search(r'\{[^}]+\}', content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return {"status": "checking", "confidence": 50, "reasoning": "Unable to assess"}
        except Exception as e:
            print(f"Error assessing claim: {e}")
            return {"status": "checking", "confidence": 50, "reasoning": str(e)}


# Singleton instance
analysis_service = AnalysisService()
