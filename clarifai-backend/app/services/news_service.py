import feedparser
import requests
from bs4 import BeautifulSoup
import re
from typing import List, Dict, Tuple
from datetime import datetime


def clean_text(text: str) -> str:
    """Remove unwanted characters, newlines, and extra spaces"""
    text = re.sub(r'\s+', ' ', text)
    text = text.replace("&nbsp;", " ").replace("\xa0", " ").strip()
    return text


class NewsService:
    """Service for fetching news from multiple sources"""

    def __init__(self):
        self.fact_check_api_key = "AIzaSyBFciMHT8F8PJ3A9D4kCS_74wwD1LwtpEY"

    def get_toi_trending(self) -> List[Tuple[str, str]]:
        """Fetch headlines from Times of India"""
        try:
            feed = feedparser.parse("https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms")
            return [(clean_text(e.title), e.link.strip()) for e in feed.entries[:20]]
        except Exception as e:
            print(f"Error fetching TOI: {e}")
            return []

    def get_ndtv_trending(self) -> List[Tuple[str, str]]:
        """Fetch headlines from NDTV"""
        try:
            feed = feedparser.parse("https://feeds.feedburner.com/ndtvnews-top-stories")
            return [(clean_text(e.title), e.link.strip()) for e in feed.entries[:20]]
        except Exception as e:
            print(f"Error fetching NDTV: {e}")
            return []

    def get_ht_latest(self) -> List[Tuple[str, str]]:
        """Fetch headlines from Hindustan Times"""
        try:
            feed = feedparser.parse("https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml")
            if not feed.entries:
                feed = feedparser.parse("https://www.hindustantimes.com/feeds/rss/latest-news/rssfeed.xml")
            return [(clean_text(e.title), e.link.strip()) for e in feed.entries[:20]]
        except Exception as e:
            print(f"Error fetching HT: {e}")
            return []

    def get_india_today_trending(self) -> List[Tuple[str, str]]:
        """Fetch headlines from India Today"""
        try:
            feed = feedparser.parse("https://www.indiatoday.in/rss/home")
            if not feed.entries:
                feed = feedparser.parse("https://www.indiatoday.in/rss/1206578")
            return [(clean_text(e.title), e.link.strip()) for e in feed.entries[:20]]
        except Exception as e:
            print(f"Error fetching India Today: {e}")
            return []

    def get_hindu_topnews(self) -> List[Tuple[str, str]]:
        """Fetch headlines from The Hindu"""
        try:
            url = "https://www.thehindu.com/news/"
            r = requests.get(url, timeout=10)
            soup = BeautifulSoup(r.text, "html.parser")
            headlines = []
            for h3 in soup.select("h3 a")[:20]:
                text = clean_text(h3.get_text())
                link = h3.get("href", "")
                if text and len(text.split()) > 3:
                    headlines.append((text, link))
            return headlines[:20]
        except Exception as e:
            print(f"Error fetching The Hindu: {e}")
            return []

    def get_all_sources(self) -> Dict[str, List[Tuple[str, str]]]:
        """Get headlines from all sources"""
        return {
            "Times of India": self.get_toi_trending(),
            "NDTV": self.get_ndtv_trending(),
            "Hindustan Times": self.get_ht_latest(),
            "India Today": self.get_india_today_trending(),
            "The Hindu": self.get_hindu_topnews()
        }

    def get_fact_checks(self, query: str = "India") -> List[Dict]:
        """Fetch fact-checks from Google Fact Check API"""
        try:
            url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
            params = {
                "query": query,
                "languageCode": "en",
                "key": self.fact_check_api_key
            }
            response = requests.get(url, params=params, timeout=10)
            data = response.json()

            fact_checks = []
            for claim in data.get("claims", [])[:20]:
                claim_text = claim.get("text", claim.get("claim", "No claim text"))
                publisher = None
                review_url = None
                rating = None

                if "claimReview" in claim and claim["claimReview"]:
                    review = claim["claimReview"][0]
                    publisher = review.get("publisher", {}).get("name", "Unknown")
                    review_url = review.get("url", "")
                    rating = review.get("textualRating", "")

                fact_checks.append({
                    "text": claim_text,
                    "publisher": publisher,
                    "url": review_url,
                    "rating": rating
                })

            return fact_checks
        except Exception as e:
            print(f"Error fetching fact checks: {e}")
            return []

    def get_alt_news_feed(self) -> List[Dict]:
        """Fetch Alt News fact-checks from RSS"""
        try:
            feed = feedparser.parse("https://www.altnews.in/feed/")
            return [{
                "title": clean_text(e.get("title", "No title")),
                "link": e.get("link", ""),
                "published": e.get("published", "")
            } for e in feed.entries[:20]]
        except Exception as e:
            print(f"Error fetching Alt News: {e}")
            return []

    def google_news_search(self, query: str, num_results: int = 20) -> List[Dict]:
        """Search Google News RSS for a specific query"""
        try:
            query_encoded = query.replace(" ", "+")
            url = f"https://news.google.com/rss/search?q={query_encoded}&hl=en-IN&gl=IN&ceid=IN:en"
            feed = feedparser.parse(url)

            results = []
            for entry in feed.entries[:num_results]:
                raw_title = entry.title
                link = entry.link
                source = "Unknown"
                published_date = getattr(entry, 'published', 'Unknown')

                # Parse source from title
                parts = raw_title.rsplit(' - ', 1)
                if len(parts) > 1:
                    title = parts[0].strip()
                    source = parts[1].strip()
                else:
                    title = raw_title.strip()

                results.append({
                    "title": title,
                    "link": link,
                    "source": source,
                    "published_date": published_date
                })

            return results
        except Exception as e:
            print(f"Error searching Google News: {e}")
            return []


# Singleton instance
news_service = NewsService()
