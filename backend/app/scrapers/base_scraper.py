"""
Abstract base class for all scrapers.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
import hashlib


@dataclass
class ScrapedArticle:
    """Data class representing a scraped article."""
    title: str
    url: str
    source: str
    published_at: Optional[datetime] = None
    content_snippet: Optional[str] = None
    category: str = "general"
    sentiment_score: Optional[float] = None

    def get_url_hash(self) -> str:
        """Generate a hash of the URL for deduplication."""
        return hashlib.md5(self.url.encode()).hexdigest()

    def contains_starmer_mention(self, keywords: List[str]) -> bool:
        """Check if the article mentions Starmer."""
        text = f"{self.title} {self.content_snippet or ''}".lower()
        return any(keyword.lower() in text for keyword in keywords)


class BaseScraper(ABC):
    """Abstract base class for all scrapers."""

    def __init__(self, source_name: str):
        self.source_name = source_name
        self.last_scrape: Optional[datetime] = None

    @abstractmethod
    def scrape(self) -> List[ScrapedArticle]:
        """
        Scrape articles from the source.
        Returns a list of ScrapedArticle objects.
        """
        pass

    def filter_starmer_mentions(
        self,
        articles: List[ScrapedArticle],
        keywords: List[str]
    ) -> List[ScrapedArticle]:
        """Filter articles to only those mentioning Starmer."""
        return [a for a in articles if a.contains_starmer_mention(keywords)]

    def deduplicate(self, articles: List[ScrapedArticle]) -> List[ScrapedArticle]:
        """Remove duplicate articles based on URL."""
        seen_urls = set()
        unique = []
        for article in articles:
            url_hash = article.get_url_hash()
            if url_hash not in seen_urls:
                seen_urls.add(url_hash)
                unique.append(article)
        return unique

    def log_scrape(self):
        """Log the scrape timestamp."""
        self.last_scrape = datetime.utcnow()
