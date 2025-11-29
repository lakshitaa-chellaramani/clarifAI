import os
import json
import re
from typing import List, Dict, Optional

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from app.config import settings
from app.services.news_service import news_service

os.environ["GOOGLE_API_KEY"] = settings.GOOGLE_API_KEY


class NarrativeGraphService:
    """Service for generating narrative graphs using AI"""

    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.3
        )

    def generate_narrative_graph(self, topic: str) -> Dict:
        """
        Generate a narrative graph for a given topic.
        Uses Google News to find relevant articles and then generates a story graph.
        """
        # First, search for news about this topic
        news_data = self._fetch_news_context(topic)

        system_prompt = """You are a News Narrative Analyst AI. Your task is to analyze news about a topic and create a structured narrative graph that tells the story of events.

IMPORTANT RULES:
1. Create 5-8 nodes that represent key events in the story
2. The FIRST node MUST be type "ROOT_INCIDENT" - this is where the story begins
3. Subsequent nodes should be typed based on their role:
   - DEVELOPMENT: New information, updates, or escalation of the situation
   - REACTION: Responses from officials, public, or stakeholders
   - INVESTIGATION: Inquiries, probes, or fact-finding efforts
   - OUTCOME: Results, resolutions, or current status

4. Each node needs:
   - A unique id (node_1, node_2, etc.)
   - A short label (5-10 words describing the event)
   - A type (one of the 5 types above)
   - A data object with a summary (1-2 sentences with key details)

5. Create edges that connect the narrative flow:
   - Use descriptive labels: "triggered", "caused", "led_to", "resulted_in", "prompted", "followed_by"
   - Ensure the graph tells a coherent story from ROOT_INCIDENT to outcomes

6. Make the narrative engaging and informative, suitable for news visualization.

RESPOND ONLY WITH A VALID JSON OBJECT in this exact format:
{{
    "topic": "the main topic",
    "nodes": [
        {{"id": "node_1", "label": "Short Title", "type": "ROOT_INCIDENT", "data": {{"summary": "1-2 sentence summary"}}}}
    ],
    "edges": [
        {{"source": "node_1", "target": "node_2", "label": "triggered"}}
    ]
}}"""

        human_prompt = """Topic: {topic}

News Context:
{news_context}

Generate a narrative graph JSON that tells the story of this topic."""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", human_prompt)
        ])

        try:
            chain = prompt | self.llm
            response = chain.invoke({
                "topic": topic,
                "news_context": news_data
            })

            # Extract JSON from response
            content = response.content
            # Try to find JSON in the response
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                result = json.loads(json_match.group())
                return {
                    "topic": result.get("topic", topic),
                    "nodes": result.get("nodes", []),
                    "edges": result.get("edges", [])
                }
            else:
                print(f"No JSON found in response: {content[:200]}")
                return self._get_fallback_graph(topic)

        except Exception as e:
            print(f"Error generating narrative graph: {e}")
            # Return a fallback graph
            return self._get_fallback_graph(topic)

    def _fetch_news_context(self, topic: str) -> str:
        """Fetch news context for a topic"""
        try:
            # Try to get news from Google News
            articles = news_service.google_news_search(topic, num_results=5)
            if articles:
                context_parts = []
                for i, article in enumerate(articles[:5], 1):
                    context_parts.append(
                        f"{i}. {article.get('title', 'No title')}\n"
                        f"   Source: {article.get('source', 'Unknown')}\n"
                        f"   Published: {article.get('published_date', 'Unknown')}"
                    )
                return "\n\n".join(context_parts)
        except Exception as e:
            print(f"Error fetching news: {e}")

        # Fallback context
        return f"Topic: {topic}\nPlease generate a narrative based on general knowledge about this topic."

    def _get_fallback_graph(self, topic: str) -> Dict:
        """Return a fallback graph structure when AI generation fails"""
        return {
            "topic": topic,
            "nodes": [
                {
                    "id": "node_1",
                    "label": f"Breaking: {topic[:50]}",
                    "type": "ROOT_INCIDENT",
                    "data": {"summary": f"Initial reports emerge regarding {topic}. Details are still developing as authorities respond to the situation."}
                },
                {
                    "id": "node_2",
                    "label": "Authorities Issue First Response",
                    "type": "REACTION",
                    "data": {"summary": "Officials have acknowledged the situation and are coordinating response efforts. A formal statement is expected soon."}
                },
                {
                    "id": "node_3",
                    "label": "Investigation Underway",
                    "type": "INVESTIGATION",
                    "data": {"summary": "An investigation has been launched to determine the full scope and impact of the incident."}
                },
                {
                    "id": "node_4",
                    "label": "New Details Emerge",
                    "type": "DEVELOPMENT",
                    "data": {"summary": "Additional information has come to light as the situation continues to unfold."}
                },
                {
                    "id": "node_5",
                    "label": "Current Status Update",
                    "type": "OUTCOME",
                    "data": {"summary": "The situation remains under monitoring. Updates will be provided as more information becomes available."}
                }
            ],
            "edges": [
                {"source": "node_1", "target": "node_2", "label": "triggered"},
                {"source": "node_1", "target": "node_3", "label": "prompted"},
                {"source": "node_2", "target": "node_4", "label": "led_to"},
                {"source": "node_3", "target": "node_4", "label": "revealed"},
                {"source": "node_4", "target": "node_5", "label": "resulted_in"}
            ]
        }


# Singleton instance
narrative_graph_service = NarrativeGraphService()
