from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import random

from app.services.news_service import news_service

router = APIRouter(prefix="/daily", tags=["Daily News"])


class DailyNewsItem(BaseModel):
    id: str
    title: str
    summary: str
    source: str
    source_url: str
    category: str
    published_at: str
    thumbnail_gradient: str
    video_duration: int  # seconds
    views: int
    is_breaking: bool
    risk_score: int


class DailyNewsResponse(BaseModel):
    news: List[DailyNewsItem]
    total: int
    generated_at: str


# Category mappings for news
CATEGORIES = ["Politics", "Technology", "Business", "World", "Sports", "Entertainment", "Science", "Health"]

# Gradient colors for video thumbnails
GRADIENTS = [
    "from-red-600 to-orange-500",
    "from-blue-600 to-purple-500",
    "from-green-600 to-teal-500",
    "from-purple-600 to-pink-500",
    "from-indigo-600 to-blue-500",
    "from-orange-600 to-yellow-500",
    "from-pink-600 to-rose-500",
    "from-cyan-600 to-blue-500",
    "from-emerald-600 to-green-500",
    "from-violet-600 to-purple-500",
]


def generate_summary(title: str) -> str:
    """Generate a brief summary from the title"""
    # Simple summary generation - in production this would use AI
    words = title.split()
    if len(words) > 15:
        return " ".join(words[:15]) + "..."
    return title


def categorize_news(title: str) -> str:
    """Categorize news based on keywords"""
    title_lower = title.lower()

    if any(word in title_lower for word in ["politics", "election", "government", "minister", "parliament", "congress", "bjp", "modi"]):
        return "Politics"
    elif any(word in title_lower for word in ["tech", "ai", "software", "google", "apple", "microsoft", "startup"]):
        return "Technology"
    elif any(word in title_lower for word in ["market", "stock", "economy", "business", "company", "profit", "shares"]):
        return "Business"
    elif any(word in title_lower for word in ["war", "international", "us", "china", "russia", "europe", "global"]):
        return "World"
    elif any(word in title_lower for word in ["cricket", "football", "sports", "match", "player", "team", "ipl"]):
        return "Sports"
    elif any(word in title_lower for word in ["movie", "film", "actor", "actress", "bollywood", "hollywood", "music"]):
        return "Entertainment"
    elif any(word in title_lower for word in ["science", "research", "study", "discovery", "space", "nasa"]):
        return "Science"
    elif any(word in title_lower for word in ["health", "covid", "hospital", "doctor", "medical", "disease"]):
        return "Health"
    else:
        return random.choice(CATEGORIES)


@router.get("", response_model=DailyNewsResponse)
async def get_daily_news(limit: int = 20, category: Optional[str] = None):
    """
    Get today's top news formatted for reels and cards
    """
    try:
        # Fetch news from multiple sources
        all_news = []

        # Get from various sources
        sources_data = {
            "Times of India": news_service.get_toi_trending(),
            "NDTV": news_service.get_ndtv_trending(),
            "Hindustan Times": news_service.get_ht_latest(),
            "India Today": news_service.get_india_today_trending(),
        }

        news_id = 0
        for source_name, headlines in sources_data.items():
            for title, url in headlines[:5]:  # Top 5 from each source
                if not title:
                    continue

                news_category = categorize_news(title)

                # Filter by category if specified
                if category and news_category.lower() != category.lower():
                    continue

                news_id += 1
                all_news.append(DailyNewsItem(
                    id=f"daily-{news_id}",
                    title=title,
                    summary=generate_summary(title),
                    source=source_name,
                    source_url=url,
                    category=news_category,
                    published_at=datetime.now().isoformat(),
                    thumbnail_gradient=random.choice(GRADIENTS),
                    video_duration=random.randint(15, 60),
                    views=random.randint(1000, 50000),
                    is_breaking=random.random() < 0.15,  # 15% chance of breaking news
                    risk_score=random.randint(1, 10)
                ))

        # Shuffle and limit
        random.shuffle(all_news)
        all_news = all_news[:limit]

        return DailyNewsResponse(
            news=all_news,
            total=len(all_news),
            generated_at=datetime.now().isoformat()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories")
async def get_categories():
    """Get available news categories"""
    return {
        "categories": CATEGORIES,
        "total": len(CATEGORIES)
    }


@router.get("/{news_id}")
async def get_news_detail(news_id: str):
    """Get detailed information about a specific news item"""
    try:
        # In production, this would fetch from database
        # For now, return a mock response
        return {
            "id": news_id,
            "found": True,
            "message": "News detail endpoint - implement with database storage"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
