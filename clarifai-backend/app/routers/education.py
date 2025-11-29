from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from typing import Optional, List, Dict
import json
import asyncio

from app.services.education_service import education_service

router = APIRouter(prefix="/education", tags=["education"])


class FlashcardGenerateRequest(BaseModel):
    topic: str
    num_cards: int = 10
    difficulty: str = "intermediate"  # "beginner", "intermediate", "advanced"


class StudyGuideRequest(BaseModel):
    topic: str
    flashcards: Optional[List[Dict]] = None
    include_summary: bool = True


class ExportRequest(BaseModel):
    topic: str
    guide_data: Dict
    flashcards: Optional[List[Dict]] = None


@router.post("/flashcards/generate")
async def generate_flashcards(request: FlashcardGenerateRequest):
    """
    Generate fact-checked flashcards for a given topic.
    Each flashcard includes source citations for verification.
    """
    try:
        result = education_service.generate_flashcards(
            topic=request.topic,
            num_cards=request.num_cards,
            difficulty=request.difficulty
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/flashcards/generate")
async def generate_flashcards_get(
    topic: str = Query(..., description="Topic to generate flashcards for"),
    num_cards: int = Query(10, description="Number of flashcards to generate (5-25)"),
    difficulty: str = Query("intermediate", description="Difficulty level: beginner, intermediate, advanced")
):
    """
    Generate fact-checked flashcards for a given topic (GET version).
    """
    # Validate num_cards
    num_cards = max(5, min(25, num_cards))

    try:
        result = education_service.generate_flashcards(
            topic=topic,
            num_cards=num_cards,
            difficulty=difficulty
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/flashcards/stream")
async def stream_flashcard_generation(
    topic: str = Query(..., description="Topic to generate flashcards for"),
    num_cards: int = Query(10, description="Number of flashcards"),
    difficulty: str = Query("intermediate", description="Difficulty level")
):
    """
    Stream flashcard generation one card at a time using Server-Sent Events.
    Provides real-time feedback as cards are generated.
    """
    num_cards = max(5, min(25, num_cards))

    async def generate():
        try:
            # Generate all flashcards
            result = education_service.generate_flashcards(
                topic=topic,
                num_cards=num_cards,
                difficulty=difficulty
            )

            flashcards = result.get("flashcards", [])

            # Send metadata first
            yield f"data: {json.dumps({'type': 'metadata', 'topic': result.get('topic'), 'description': result.get('description'), 'total_cards': len(flashcards), 'difficulty': difficulty, 'deck_id': result.get('deck_id')})}\n\n"
            await asyncio.sleep(0.1)

            # Stream flashcards one by one
            for i, card in enumerate(flashcards):
                yield f"data: {json.dumps({'type': 'flashcard', 'card': card, 'progress': ((i + 1) / len(flashcards)) * 100, 'index': i})}\n\n"
                await asyncio.sleep(0.4)

            # Send study tips
            if result.get('study_tips'):
                yield f"data: {json.dumps({'type': 'tips', 'tips': result.get('study_tips')})}\n\n"
                await asyncio.sleep(0.1)

            # Send sources
            if result.get('sources'):
                yield f"data: {json.dumps({'type': 'sources', 'sources': result.get('sources')})}\n\n"
                await asyncio.sleep(0.1)

            # Send completion
            yield f"data: {json.dumps({'type': 'complete', 'total_cards': len(flashcards), 'deck_id': result.get('deck_id')})}\n\n"

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


@router.post("/study-guide/generate")
async def generate_study_guide(request: StudyGuideRequest):
    """
    Generate a comprehensive study guide for a topic.
    Can include existing flashcards for context.
    """
    try:
        result = education_service.generate_study_guide(
            topic=request.topic,
            flashcards=request.flashcards or [],
            include_summary=request.include_summary
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/study-guide/generate")
async def generate_study_guide_get(
    topic: str = Query(..., description="Topic for study guide"),
    include_summary: bool = Query(True, description="Include overview summary")
):
    """
    Generate a comprehensive study guide for a topic (GET version).
    """
    try:
        result = education_service.generate_study_guide(
            topic=topic,
            flashcards=[],
            include_summary=include_summary
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/study-guide/export")
async def export_study_guide(request: ExportRequest):
    """
    Export study guide and flashcards as markdown.
    """
    try:
        markdown = education_service.export_study_guide_markdown(
            guide_data=request.guide_data,
            flashcards=request.flashcards
        )
        return {"markdown": markdown, "topic": request.topic}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/study-guide/download")
async def download_study_guide(
    topic: str = Query(..., description="Topic for study guide")
):
    """
    Generate and download a complete study guide as a markdown file.
    Includes auto-generated flashcards.
    """
    try:
        # Generate flashcards first
        flashcard_data = education_service.generate_flashcards(
            topic=topic,
            num_cards=15,
            difficulty="intermediate"
        )

        # Generate study guide
        guide_data = education_service.generate_study_guide(
            topic=topic,
            flashcards=flashcard_data.get("flashcards", []),
            include_summary=True
        )

        # Export to markdown
        markdown = education_service.export_study_guide_markdown(
            guide_data=guide_data,
            flashcards=flashcard_data.get("flashcards", [])
        )

        # Create safe filename
        safe_filename = "".join(c if c.isalnum() or c in " -_" else "_" for c in topic[:50])
        filename = f"study_guide_{safe_filename}.md"

        return Response(
            content=markdown,
            media_type="text/markdown",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/complete-package")
async def generate_complete_package(request: FlashcardGenerateRequest):
    """
    Generate a complete education package: flashcards + study guide.
    Returns both in a single response.
    """
    try:
        # Generate flashcards
        flashcard_data = education_service.generate_flashcards(
            topic=request.topic,
            num_cards=request.num_cards,
            difficulty=request.difficulty
        )

        # Generate study guide with the flashcards
        guide_data = education_service.generate_study_guide(
            topic=request.topic,
            flashcards=flashcard_data.get("flashcards", []),
            include_summary=True
        )

        # Generate markdown export
        markdown = education_service.export_study_guide_markdown(
            guide_data=guide_data,
            flashcards=flashcard_data.get("flashcards", [])
        )

        return {
            "flashcards": flashcard_data,
            "study_guide": guide_data,
            "markdown_export": markdown,
            "topic": request.topic
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
