"""
RSS feed scraper for news sources.
"""

import feedparser
from datetime import datetime
from typing import List, Optional
from time import mktime
import logging

from .base_scraper import BaseScraper, ScrapedArticle
from .sources import RSS_SOURCES, INTERNATIONAL_RSS_SOURCES, STARMER_KEYWORDS

logger = logging.getLogger(__name__)


class RSSScraper(BaseScraper):
    """Scraper for RSS feeds."""

    def __init__(self, include_international: bool = True):
        super().__init__("RSS")
        self.sources = RSS_SOURCES.copy()
        if include_international:
            self.sources.extend(INTERNATIONAL_RSS_SOURCES)

    def scrape(self) -> List[ScrapedArticle]:
        """Scrape all configured RSS feeds."""
        all_articles = []

        for source in self.sources:
            try:
                articles = self._scrape_feed(source)
                all_articles.extend(articles)
                logger.info(f"Scraped {len(articles)} articles from {source['name']}")
            except Exception as e:
                logger.error(f"Error scraping {source['name']}: {e}")

        self.log_scrape()

        # Filter for Starmer mentions
        starmer_articles = self.filter_starmer_mentions(all_articles, STARMER_KEYWORDS)

        # Deduplicate
        unique_articles = self.deduplicate(starmer_articles)

        logger.info(f"Total unique Starmer articles: {len(unique_articles)}")
        return unique_articles

    def _scrape_feed(self, source: dict) -> List[ScrapedArticle]:
        """Scrape a single RSS feed."""
        feed = feedparser.parse(source["url"])
        articles = []

        for entry in feed.entries:
            article = self._parse_entry(entry, source)
            if article:
                articles.append(article)

        return articles

    def _parse_entry(self, entry: dict, source: dict) -> Optional[ScrapedArticle]:
        """Parse a single RSS entry into a ScrapedArticle."""
        try:
            # Get title
            title = entry.get("title", "").strip()
            if not title:
                return None

            # Get URL
            url = entry.get("link", "")
            if not url:
                return None

            # Get published date
            published_at = None
            if hasattr(entry, "published_parsed") and entry.published_parsed:
                published_at = datetime.fromtimestamp(mktime(entry.published_parsed))
            elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
                published_at = datetime.fromtimestamp(mktime(entry.updated_parsed))

            # Get content snippet
            content_snippet = ""
            if hasattr(entry, "summary"):
                content_snippet = entry.summary[:500]
            elif hasattr(entry, "description"):
                content_snippet = entry.description[:500]

            # Clean HTML from snippet
            content_snippet = self._strip_html(content_snippet)

            return ScrapedArticle(
                title=title,
                url=url,
                source=source["name"],
                published_at=published_at,
                content_snippet=content_snippet,
                category=source.get("category", "general"),
            )

        except Exception as e:
            logger.error(f"Error parsing entry: {e}")
            return None

    def _strip_html(self, text: str) -> str:
        """Remove HTML tags from text."""
        import re
        clean = re.compile('<.*?>')
        return re.sub(clean, '', text).strip()

    def scrape_single_source(self, source_name: str) -> List[ScrapedArticle]:
        """Scrape a single source by name."""
        for source in self.sources:
            if source["name"].lower() == source_name.lower():
                return self._scrape_feed(source)
        return []
