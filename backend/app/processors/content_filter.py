"""
Content filtering to identify negative Starmer coverage.
"""

from typing import List, Optional
from dataclasses import dataclass
import logging

from ..scrapers.base_scraper import ScrapedArticle
from ..scrapers.sources import STARMER_KEYWORDS, NEGATIVE_BOOST_KEYWORDS
from .sentiment import SentimentAnalyzer

logger = logging.getLogger(__name__)


@dataclass
class FilteredArticle:
    """An article that has passed through the content filter."""
    article: ScrapedArticle
    sentiment_score: float
    keyword_matches: List[str]
    relevance_score: float


class ContentFilter:
    """Filters articles for negative Starmer coverage."""

    def __init__(
        self,
        sentiment_threshold: float = -0.2,
        starmer_keywords: Optional[List[str]] = None,
        boost_keywords: Optional[List[str]] = None,
    ):
        self.sentiment_threshold = sentiment_threshold
        self.starmer_keywords = starmer_keywords or STARMER_KEYWORDS
        self.boost_keywords = boost_keywords or NEGATIVE_BOOST_KEYWORDS
        self.analyzer = SentimentAnalyzer(boost_keywords=self.boost_keywords)

    def filter_articles(
        self,
        articles: List[ScrapedArticle],
        require_negative: bool = True,
    ) -> List[FilteredArticle]:
        """
        Filter articles for Starmer mentions and negative sentiment.

        Args:
            articles: List of scraped articles
            require_negative: Only include articles with negative sentiment

        Returns:
            List of FilteredArticle objects
        """
        filtered = []

        for article in articles:
            # Check for Starmer mention
            if not self._mentions_starmer(article):
                continue

            # Analyze sentiment
            text = f"{article.title} {article.content_snippet or ''}"
            sentiment_score = self.analyzer.analyze(text)

            # Skip if requiring negative and not negative enough
            if require_negative and sentiment_score >= self.sentiment_threshold:
                continue

            # Find keyword matches
            keyword_matches = self._find_keyword_matches(text)

            # Calculate relevance score
            relevance = self._calculate_relevance(
                sentiment_score,
                keyword_matches,
                article
            )

            filtered.append(FilteredArticle(
                article=article,
                sentiment_score=sentiment_score,
                keyword_matches=keyword_matches,
                relevance_score=relevance,
            ))

        # Sort by relevance (most relevant first)
        filtered.sort(key=lambda x: x.relevance_score, reverse=True)

        logger.info(f"Filtered {len(filtered)} negative articles from {len(articles)} total")
        return filtered

    def _mentions_starmer(self, article: ScrapedArticle) -> bool:
        """Check if article mentions Starmer."""
        text = f"{article.title} {article.content_snippet or ''}".lower()
        return any(kw.lower() in text for kw in self.starmer_keywords)

    def _find_keyword_matches(self, text: str) -> List[str]:
        """Find which negative keywords appear in the text."""
        text_lower = text.lower()
        return [kw for kw in self.boost_keywords if kw.lower() in text_lower]

    def _calculate_relevance(
        self,
        sentiment_score: float,
        keyword_matches: List[str],
        article: ScrapedArticle,
    ) -> float:
        """
        Calculate a relevance score for ranking articles.

        Higher score = more relevant for posting.
        """
        # Base: inverse of sentiment (more negative = higher score)
        relevance = -sentiment_score

        # Bonus for keyword matches (up to 0.3)
        keyword_bonus = min(0.3, len(keyword_matches) * 0.1)
        relevance += keyword_bonus

        # Bonus for certain sources (higher credibility)
        credible_sources = ["BBC", "Guardian", "Sky News", "Reuters"]
        if any(src.lower() in article.source.lower() for src in credible_sources):
            relevance += 0.1

        # Bonus for recency (if published_at is available)
        if article.published_at:
            from datetime import datetime, timedelta
            age = datetime.utcnow() - article.published_at
            if age < timedelta(hours=6):
                relevance += 0.2
            elif age < timedelta(hours=24):
                relevance += 0.1

        return relevance

    def get_top_articles(
        self,
        articles: List[ScrapedArticle],
        limit: int = 10,
    ) -> List[FilteredArticle]:
        """Get the top N most relevant negative articles."""
        filtered = self.filter_articles(articles)
        return filtered[:limit]
