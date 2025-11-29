import os
import json
import re
from typing import List, Dict, Optional
from datetime import datetime

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from app.config import settings
from app.services.news_service import news_service

os.environ["GOOGLE_API_KEY"] = settings.GOOGLE_API_KEY


class ResearchService:
    """Service for generating comprehensive research graphs with source citations"""

    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.2  # Lower temperature for factual research
        )

    def generate_research_graph(self, query: str, depth: str = "comprehensive") -> Dict:
        """
        Generate a research knowledge graph for a given query.
        Each node contains factual information linked to its source.
        """
        # Gather sources
        sources_data = self._gather_sources(query)

        system_prompt = """You are a Research Assistant AI specializing in creating comprehensive, well-sourced knowledge graphs. Your task is to analyze information about a topic and create a detailed research graph where EVERY piece of information is traceable to its source.

CRITICAL RULES:
1. Create 8-15 nodes representing key findings, facts, and insights
2. EVERY node MUST include source citations - never make unsourced claims
3. Node types:
   - CORE_CONCEPT: Central ideas or definitions
   - KEY_FINDING: Important research findings or facts
   - EVIDENCE: Supporting data, statistics, or proof
   - PERSPECTIVE: Expert opinions or stakeholder views
   - IMPLICATION: Consequences or future outlook
   - METHODOLOGY: How information was gathered/verified

4. Each node needs:
   - id: Unique identifier (node_1, node_2, etc.)
   - label: Clear, descriptive title (5-10 words)
   - type: One of the 6 types above
   - data object with:
     - summary: Detailed factual summary (2-4 sentences)
     - source_title: Title of the source article/document
     - source_url: URL of the source (use actual URLs from context)
     - confidence: HIGH, MEDIUM, or LOW based on source reliability
     - key_quote: A direct quote or key fact from the source (if available)

5. Create edges showing relationships:
   - Labels: "supports", "contradicts", "elaborates", "leads_to", "based_on", "relates_to"
   - Build a coherent knowledge network

6. Be thorough and academic - this is for researchers and students.

RESPOND WITH VALID JSON in this exact format:
{{
    "topic": "research topic",
    "summary": "Executive summary of findings (3-5 sentences)",
    "nodes": [
        {{
            "id": "node_1",
            "label": "Short Title",
            "type": "CORE_CONCEPT",
            "data": {{
                "summary": "Detailed factual information...",
                "source_title": "Article Title",
                "source_url": "https://...",
                "confidence": "HIGH",
                "key_quote": "Direct quote if available"
            }}
        }}
    ],
    "edges": [
        {{"source": "node_1", "target": "node_2", "label": "supports"}}
    ],
    "sources": [
        {{
            "title": "Source Title",
            "url": "https://...",
            "publisher": "Publisher Name",
            "date": "Publication date"
        }}
    ],
    "methodology": "Brief explanation of how this research was compiled"
}}"""

        human_prompt = """Research Query: {query}

Depth Level: {depth}

Source Materials:
{sources}

Create a comprehensive research knowledge graph. Ensure every claim is sourced and explainable. Include all relevant sources in the sources array."""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", human_prompt)
        ])

        try:
            chain = prompt | self.llm
            response = chain.invoke({
                "query": query,
                "depth": depth,
                "sources": sources_data
            })

            # Extract JSON from response
            content = response.content
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                result = json.loads(json_match.group())
                # Add metadata
                result["generated_at"] = datetime.now().isoformat()
                result["query"] = query
                result["depth"] = depth
                return result
            else:
                print(f"No JSON found in response: {content[:200]}")
                return self._get_fallback_research(query)

        except Exception as e:
            print(f"Error generating research graph: {e}")
            return self._get_fallback_research(query)

    def _gather_sources(self, query: str) -> str:
        """Gather information from multiple sources"""
        context_parts = []

        # 1. Google News search
        try:
            news_articles = news_service.google_news_search(query, num_results=10)
            if news_articles:
                context_parts.append("=== NEWS SOURCES ===")
                for i, article in enumerate(news_articles, 1):
                    context_parts.append(
                        f"{i}. Title: {article.get('title', 'No title')}\n"
                        f"   Source: {article.get('source', 'Unknown')}\n"
                        f"   URL: {article.get('link', 'No URL')}\n"
                        f"   Date: {article.get('published_date', 'Unknown')}"
                    )
        except Exception as e:
            print(f"Error fetching news: {e}")

        # 2. Fact-check sources
        try:
            fact_checks = news_service.get_fact_checks(query)
            if fact_checks:
                context_parts.append("\n=== FACT-CHECK SOURCES ===")
                for i, fc in enumerate(fact_checks[:5], 1):
                    context_parts.append(
                        f"{i}. Claim: {fc.get('text', 'No text')}\n"
                        f"   Rating: {fc.get('rating', 'Unknown')}\n"
                        f"   Publisher: {fc.get('publisher', 'Unknown')}\n"
                        f"   URL: {fc.get('url', 'No URL')}"
                    )
        except Exception as e:
            print(f"Error fetching fact checks: {e}")

        # 3. Alt News (for India-specific fact-checking)
        try:
            alt_news = news_service.get_alt_news_feed()
            relevant = [a for a in alt_news if query.lower() in a.get('title', '').lower()][:3]
            if relevant:
                context_parts.append("\n=== ALT NEWS FACT-CHECKS ===")
                for i, article in enumerate(relevant, 1):
                    context_parts.append(
                        f"{i}. Title: {article.get('title', 'No title')}\n"
                        f"   URL: {article.get('link', 'No URL')}\n"
                        f"   Date: {article.get('published', 'Unknown')}"
                    )
        except Exception as e:
            print(f"Error fetching alt news: {e}")

        if not context_parts:
            return f"Topic: {query}\nNote: Limited source data available. Please generate based on general knowledge and clearly indicate when sources are not directly available."

        return "\n\n".join(context_parts)

    def generate_report_markdown(self, research_data: Dict) -> str:
        """Generate a downloadable markdown report from research data"""
        report = []

        # Header
        report.append(f"# Research Report: {research_data.get('topic', 'Unknown Topic')}")
        report.append(f"\n**Generated:** {research_data.get('generated_at', datetime.now().isoformat())}")
        report.append(f"\n**Query:** {research_data.get('query', 'N/A')}")
        report.append(f"\n**Depth:** {research_data.get('depth', 'comprehensive')}")

        # Executive Summary
        report.append("\n\n## Executive Summary")
        report.append(f"\n{research_data.get('summary', 'No summary available.')}")

        # Methodology
        if research_data.get('methodology'):
            report.append("\n\n## Methodology")
            report.append(f"\n{research_data.get('methodology')}")

        # Key Findings (from nodes)
        report.append("\n\n## Key Findings")
        nodes = research_data.get('nodes', [])

        # Group by type
        node_types = {}
        for node in nodes:
            node_type = node.get('type', 'OTHER')
            if node_type not in node_types:
                node_types[node_type] = []
            node_types[node_type].append(node)

        type_titles = {
            'CORE_CONCEPT': 'Core Concepts',
            'KEY_FINDING': 'Key Findings',
            'EVIDENCE': 'Evidence & Data',
            'PERSPECTIVE': 'Perspectives & Opinions',
            'IMPLICATION': 'Implications & Outlook',
            'METHODOLOGY': 'Research Methods'
        }

        for node_type, type_nodes in node_types.items():
            report.append(f"\n\n### {type_titles.get(node_type, node_type)}")
            for node in type_nodes:
                data = node.get('data', {})
                report.append(f"\n\n#### {node.get('label', 'Untitled')}")
                report.append(f"\n{data.get('summary', 'No details available.')}")

                if data.get('key_quote'):
                    report.append(f"\n\n> \"{data.get('key_quote')}\"")

                confidence = data.get('confidence', 'UNKNOWN')
                confidence_emoji = {'HIGH': '🟢', 'MEDIUM': '🟡', 'LOW': '🔴'}.get(confidence, '⚪')
                report.append(f"\n\n**Confidence:** {confidence_emoji} {confidence}")

                if data.get('source_url'):
                    report.append(f"\n\n**Source:** [{data.get('source_title', 'Link')}]({data.get('source_url')})")

        # Knowledge Graph Description
        report.append("\n\n## Knowledge Graph Relationships")
        edges = research_data.get('edges', [])
        node_map = {n['id']: n.get('label', n['id']) for n in nodes}

        for edge in edges:
            source_label = node_map.get(edge.get('source'), edge.get('source'))
            target_label = node_map.get(edge.get('target'), edge.get('target'))
            relationship = edge.get('label', 'relates to')
            report.append(f"\n- **{source_label}** _{relationship}_ **{target_label}**")

        # Sources
        report.append("\n\n## Sources & References")
        sources = research_data.get('sources', [])
        if sources:
            for i, source in enumerate(sources, 1):
                report.append(f"\n{i}. [{source.get('title', 'Untitled')}]({source.get('url', '#')})")
                if source.get('publisher'):
                    report.append(f" - {source.get('publisher')}")
                if source.get('date'):
                    report.append(f" ({source.get('date')})")
        else:
            report.append("\n*Sources are cited inline with each finding.*")

        # Footer
        report.append("\n\n---")
        report.append("\n*This report was generated by ClarifAI Research Hub. All findings are sourced and verifiable.*")
        report.append("\n*Please verify critical information from primary sources before use.*")

        return "\n".join(report)

    def _get_fallback_research(self, query: str) -> Dict:
        """Return a fallback research structure when generation fails"""
        return {
            "topic": query,
            "query": query,
            "summary": f"Research on '{query}' is being compiled. Due to temporary limitations, a comprehensive analysis could not be generated at this time.",
            "generated_at": datetime.now().isoformat(),
            "depth": "basic",
            "nodes": [
                {
                    "id": "node_1",
                    "label": f"Overview: {query[:40]}",
                    "type": "CORE_CONCEPT",
                    "data": {
                        "summary": f"This is the central topic of research regarding {query}. Further investigation is recommended for comprehensive understanding.",
                        "source_title": "Research Query",
                        "source_url": "",
                        "confidence": "LOW",
                        "key_quote": ""
                    }
                },
                {
                    "id": "node_2",
                    "label": "Further Research Needed",
                    "type": "IMPLICATION",
                    "data": {
                        "summary": "Additional sources and verification are needed to provide comprehensive research findings. Please try again or refine your query.",
                        "source_title": "System Note",
                        "source_url": "",
                        "confidence": "LOW",
                        "key_quote": ""
                    }
                }
            ],
            "edges": [
                {"source": "node_1", "target": "node_2", "label": "requires"}
            ],
            "sources": [],
            "methodology": "Automated research compilation with source verification."
        }


# Singleton instance
research_service = ResearchService()
