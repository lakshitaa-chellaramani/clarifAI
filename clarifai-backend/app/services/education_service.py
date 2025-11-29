import os
import json
import re
from typing import List, Dict, Optional
from datetime import datetime
import uuid

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from app.config import settings
from app.services.news_service import news_service

os.environ["GOOGLE_API_KEY"] = settings.GOOGLE_API_KEY


class EducationService:
    """Service for generating educational flashcards and study guides with fact-checking"""

    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.3  # Balanced for educational content
        )

    def generate_flashcards(self, topic: str, num_cards: int = 10, difficulty: str = "intermediate") -> Dict:
        """
        Generate fact-checked flashcards for a given topic.
        Each flashcard includes the source of information for verification.
        """
        # Gather sources for fact-checking
        sources_data = self._gather_sources(topic)

        system_prompt = """You are an Educational Content AI specialized in creating accurate, fact-checked flashcards for students. Your task is to generate flashcards that help students learn and retain information effectively.

CRITICAL RULES:
1. Generate exactly {num_cards} flashcards on the topic
2. EVERY flashcard must contain factually accurate information
3. Include source citations where possible for fact verification
4. Match the difficulty level: {difficulty}
   - beginner: Simple concepts, basic definitions, fundamental facts
   - intermediate: Deeper understanding, connections between concepts, applications
   - advanced: Complex analysis, nuanced details, expert-level knowledge

5. Each flashcard needs:
   - id: Unique identifier (card_1, card_2, etc.)
   - front: The question or prompt (clear, specific, testable)
   - back: The answer (concise but complete)
   - category: Subject category (e.g., "Definition", "Date/Event", "Concept", "Process", "Comparison", "Application")
   - difficulty: 1-5 scale (1=easiest, 5=hardest)
   - source: Where this information comes from (if available)
   - fact_checked: true/false based on source availability
   - explanation: Brief additional context (optional but helpful)
   - tags: Array of relevant topic tags

6. Create varied question types:
   - Definitions: "What is...?"
   - Explanations: "Explain how/why...?"
   - Comparisons: "What is the difference between...?"
   - Applications: "How would you...?"
   - Dates/Events: "When did...?" / "What happened...?"

RESPOND WITH VALID JSON in this exact format:
{{
    "topic": "Main topic",
    "description": "Brief description of what these flashcards cover",
    "difficulty_level": "{difficulty}",
    "total_cards": {num_cards},
    "flashcards": [
        {{
            "id": "card_1",
            "front": "Question or prompt text",
            "back": "Answer text",
            "category": "Category name",
            "difficulty": 3,
            "source": "Source name or URL",
            "fact_checked": true,
            "explanation": "Additional context",
            "tags": ["tag1", "tag2"]
        }}
    ],
    "sources": [
        {{
            "title": "Source Title",
            "url": "https://...",
            "reliability": "HIGH/MEDIUM/LOW"
        }}
    ],
    "study_tips": ["Tip 1 for studying this topic", "Tip 2"],
    "generated_at": "ISO timestamp"
}}"""

        human_prompt = """Topic: {topic}

Number of Flashcards: {num_cards}
Difficulty Level: {difficulty}

Source Materials for Fact-Checking:
{sources}

Generate comprehensive, accurate flashcards for this topic. Ensure all information is factual and can be verified from the sources provided where possible."""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", human_prompt)
        ])

        try:
            chain = prompt | self.llm
            response = chain.invoke({
                "topic": topic,
                "num_cards": num_cards,
                "difficulty": difficulty,
                "sources": sources_data
            })

            content = response.content
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                result = json.loads(json_match.group())
                result["deck_id"] = str(uuid.uuid4())
                result["generated_at"] = datetime.now().isoformat()
                result["topic"] = topic
                return result
            else:
                return self._get_fallback_flashcards(topic, num_cards, difficulty)

        except Exception as e:
            print(f"Error generating flashcards: {e}")
            return self._get_fallback_flashcards(topic, num_cards, difficulty)

    def generate_study_guide(self, topic: str, flashcards: List[Dict], include_summary: bool = True) -> Dict:
        """
        Generate a comprehensive study guide from flashcards and topic research.
        Returns structured content ready for PDF/markdown export.
        """
        sources_data = self._gather_sources(topic)

        system_prompt = """You are an Educational Content AI specialized in creating comprehensive study guides for students. Your task is to create a well-structured study guide that helps students master the topic.

Create a study guide with the following structure:

1. OVERVIEW: Brief introduction to the topic (2-3 paragraphs)
2. KEY CONCEPTS: Core ideas students must understand
3. DETAILED SECTIONS: In-depth coverage of subtopics
4. IMPORTANT TERMS: Glossary of key vocabulary
5. COMMON MISCONCEPTIONS: What students often get wrong
6. PRACTICE QUESTIONS: Additional review questions
7. STUDY STRATEGIES: How to effectively study this material
8. ADDITIONAL RESOURCES: Recommendations for further learning

RESPOND WITH VALID JSON:
{{
    "title": "Study Guide: [Topic]",
    "topic": "Topic name",
    "overview": "Introduction paragraphs...",
    "key_concepts": [
        {{
            "concept": "Concept name",
            "explanation": "Clear explanation",
            "importance": "Why this matters"
        }}
    ],
    "sections": [
        {{
            "title": "Section Title",
            "content": "Detailed content...",
            "key_points": ["Point 1", "Point 2"],
            "examples": ["Example 1"]
        }}
    ],
    "glossary": [
        {{
            "term": "Term",
            "definition": "Definition"
        }}
    ],
    "misconceptions": [
        {{
            "misconception": "What people wrongly believe",
            "correction": "The actual fact"
        }}
    ],
    "practice_questions": [
        {{
            "question": "Question text",
            "answer": "Answer text",
            "difficulty": "easy/medium/hard"
        }}
    ],
    "study_strategies": ["Strategy 1", "Strategy 2"],
    "resources": [
        {{
            "title": "Resource name",
            "type": "book/website/video",
            "description": "Brief description"
        }}
    ],
    "generated_at": "ISO timestamp"
}}"""

        # Include flashcard content for context
        flashcard_context = ""
        if flashcards:
            flashcard_context = "\n\nExisting Flashcard Content:\n"
            for card in flashcards[:15]:  # Limit to prevent token overflow
                flashcard_context += f"Q: {card.get('front', '')}\nA: {card.get('back', '')}\n\n"

        human_prompt = """Topic: {topic}

Source Materials:
{sources}
{flashcard_context}

Create a comprehensive study guide for students studying this topic. Make it thorough, accurate, and helpful for exam preparation."""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", human_prompt)
        ])

        try:
            chain = prompt | self.llm
            response = chain.invoke({
                "topic": topic,
                "sources": sources_data,
                "flashcard_context": flashcard_context
            })

            content = response.content
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                result = json.loads(json_match.group())
                result["guide_id"] = str(uuid.uuid4())
                result["generated_at"] = datetime.now().isoformat()
                result["topic"] = topic
                return result
            else:
                return self._get_fallback_study_guide(topic)

        except Exception as e:
            print(f"Error generating study guide: {e}")
            return self._get_fallback_study_guide(topic)

    def export_study_guide_markdown(self, guide_data: Dict, flashcards: List[Dict] = None) -> str:
        """Convert study guide and flashcards to downloadable markdown format"""
        md = []

        # Title and header
        md.append(f"# {guide_data.get('title', 'Study Guide')}")
        md.append(f"\n**Generated:** {guide_data.get('generated_at', datetime.now().isoformat())}")
        md.append(f"\n**Topic:** {guide_data.get('topic', 'General')}")
        md.append("\n\n---\n")

        # Overview
        md.append("## Overview\n")
        md.append(guide_data.get('overview', 'No overview available.'))

        # Key Concepts
        if guide_data.get('key_concepts'):
            md.append("\n\n## Key Concepts\n")
            for concept in guide_data['key_concepts']:
                md.append(f"\n### {concept.get('concept', 'Concept')}")
                md.append(f"\n{concept.get('explanation', '')}")
                if concept.get('importance'):
                    md.append(f"\n\n**Why it matters:** {concept.get('importance')}")

        # Detailed Sections
        if guide_data.get('sections'):
            md.append("\n\n## Detailed Study Material\n")
            for section in guide_data['sections']:
                md.append(f"\n### {section.get('title', 'Section')}")
                md.append(f"\n{section.get('content', '')}")
                if section.get('key_points'):
                    md.append("\n\n**Key Points:**")
                    for point in section['key_points']:
                        md.append(f"\n- {point}")
                if section.get('examples'):
                    md.append("\n\n**Examples:**")
                    for example in section['examples']:
                        md.append(f"\n- {example}")

        # Flashcards Section
        if flashcards:
            md.append("\n\n## Flashcards\n")
            md.append("Use these flashcards for active recall practice.\n")
            for i, card in enumerate(flashcards, 1):
                md.append(f"\n### Card {i}")
                md.append(f"\n**Q:** {card.get('front', '')}")
                md.append(f"\n\n**A:** {card.get('back', '')}")
                if card.get('explanation'):
                    md.append(f"\n\n*Note: {card.get('explanation')}*")
                if card.get('source'):
                    md.append(f"\n\n*Source: {card.get('source')}*")
                md.append("\n")

        # Glossary
        if guide_data.get('glossary'):
            md.append("\n\n## Glossary\n")
            md.append("| Term | Definition |")
            md.append("|------|------------|")
            for item in guide_data['glossary']:
                term = item.get('term', '').replace('|', '\\|')
                definition = item.get('definition', '').replace('|', '\\|')
                md.append(f"| {term} | {definition} |")

        # Common Misconceptions
        if guide_data.get('misconceptions'):
            md.append("\n\n## Common Misconceptions\n")
            for misc in guide_data['misconceptions']:
                md.append(f"\n**Wrong:** {misc.get('misconception', '')}")
                md.append(f"\n\n**Correct:** {misc.get('correction', '')}")
                md.append("\n")

        # Practice Questions
        if guide_data.get('practice_questions'):
            md.append("\n\n## Practice Questions\n")
            for i, q in enumerate(guide_data['practice_questions'], 1):
                difficulty_badge = {'easy': '[Easy]', 'medium': '[Medium]', 'hard': '[Hard]'}.get(
                    q.get('difficulty', 'medium'), '[Medium]')
                md.append(f"\n**{i}. {difficulty_badge}** {q.get('question', '')}")
                md.append(f"\n\n<details><summary>Show Answer</summary>\n\n{q.get('answer', '')}\n\n</details>\n")

        # Study Strategies
        if guide_data.get('study_strategies'):
            md.append("\n\n## Study Strategies\n")
            for strategy in guide_data['study_strategies']:
                md.append(f"- {strategy}")

        # Additional Resources
        if guide_data.get('resources'):
            md.append("\n\n## Additional Resources\n")
            for resource in guide_data['resources']:
                resource_type = resource.get('type', 'resource').capitalize()
                md.append(f"\n- **{resource.get('title', 'Resource')}** ({resource_type})")
                if resource.get('description'):
                    md.append(f"\n  {resource.get('description')}")

        # Footer
        md.append("\n\n---")
        md.append("\n*This study guide was generated by ClarifAI Education Hub.*")
        md.append("\n*Content has been fact-checked against available sources.*")
        md.append("\n*Always verify critical information from primary sources.*")

        return "\n".join(md)

    def _gather_sources(self, topic: str) -> str:
        """Gather information from multiple sources for fact-checking"""
        context_parts = []

        # News sources for current/factual information
        try:
            news_articles = news_service.google_news_search(topic, num_results=8)
            if news_articles:
                context_parts.append("=== REFERENCE SOURCES ===")
                for i, article in enumerate(news_articles, 1):
                    context_parts.append(
                        f"{i}. Title: {article.get('title', 'No title')}\n"
                        f"   Source: {article.get('source', 'Unknown')}\n"
                        f"   URL: {article.get('link', 'No URL')}\n"
                        f"   Date: {article.get('published_date', 'Unknown')}"
                    )
        except Exception as e:
            print(f"Error fetching news sources: {e}")

        # Fact-check sources
        try:
            fact_checks = news_service.get_fact_checks(topic)
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

        if not context_parts:
            return f"Topic: {topic}\nNote: Generate educational content based on established knowledge. Mark any uncertain claims appropriately."

        return "\n\n".join(context_parts)

    def _get_fallback_flashcards(self, topic: str, num_cards: int, difficulty: str) -> Dict:
        """Return fallback flashcard structure when generation fails"""
        return {
            "deck_id": str(uuid.uuid4()),
            "topic": topic,
            "description": f"Flashcards about {topic}",
            "difficulty_level": difficulty,
            "total_cards": 2,
            "flashcards": [
                {
                    "id": "card_1",
                    "front": f"What is {topic}?",
                    "back": f"This is a placeholder card. The AI was unable to generate specific content for {topic}. Please try again.",
                    "category": "Overview",
                    "difficulty": 1,
                    "source": "System",
                    "fact_checked": False,
                    "explanation": "Placeholder card - retry generation",
                    "tags": [topic.lower()]
                },
                {
                    "id": "card_2",
                    "front": f"Why is {topic} important to study?",
                    "back": "Understanding this topic helps build foundational knowledge. Please regenerate for specific content.",
                    "category": "Importance",
                    "difficulty": 1,
                    "source": "System",
                    "fact_checked": False,
                    "explanation": "Placeholder card - retry generation",
                    "tags": [topic.lower()]
                }
            ],
            "sources": [],
            "study_tips": ["Try regenerating with a more specific topic", "Break complex topics into smaller parts"],
            "generated_at": datetime.now().isoformat()
        }

    def _get_fallback_study_guide(self, topic: str) -> Dict:
        """Return fallback study guide when generation fails"""
        return {
            "guide_id": str(uuid.uuid4()),
            "title": f"Study Guide: {topic}",
            "topic": topic,
            "overview": f"This is a placeholder study guide for {topic}. The system was unable to generate comprehensive content. Please try again with a more specific topic or check your connection.",
            "key_concepts": [
                {
                    "concept": "Topic Overview",
                    "explanation": f"A comprehensive understanding of {topic} requires further research.",
                    "importance": "Foundation for deeper learning"
                }
            ],
            "sections": [],
            "glossary": [],
            "misconceptions": [],
            "practice_questions": [],
            "study_strategies": [
                "Break the topic into smaller subtopics",
                "Use active recall by testing yourself",
                "Space out your study sessions"
            ],
            "resources": [],
            "generated_at": datetime.now().isoformat()
        }


# Singleton instance
education_service = EducationService()
