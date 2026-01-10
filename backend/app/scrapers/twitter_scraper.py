"""
X/Twitter scraper for social media content.
"""

from datetime import datetime
from typing import List, Optional
import logging

from .base_scraper import BaseScraper, ScrapedArticle
from .sources import TWITTER_SEARCH_QUERIES, TWITTER_ACCOUNTS

logger = logging.getLogger(__name__)


class TwitterScraper(BaseScraper):
    """Scraper for X/Twitter content using Tweepy."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        api_secret: Optional[str] = None,
        access_token: Optional[str] = None,
        access_token_secret: Optional[str] = None,
    ):
        super().__init__("Twitter/X")
        self.client = None

        if all([api_key, api_secret, access_token, access_token_secret]):
            self._init_client(api_key, api_secret, access_token, access_token_secret)

    def _init_client(
        self,
        api_key: str,
        api_secret: str,
        access_token: str,
        access_token_secret: str,
    ):
        """Initialize the Tweepy client."""
        try:
            import tweepy

            self.client = tweepy.Client(
                consumer_key=api_key,
                consumer_secret=api_secret,
                access_token=access_token,
                access_token_secret=access_token_secret,
                wait_on_rate_limit=True,
            )
            logger.info("Twitter client initialized successfully")
        except ImportError:
            logger.warning("Tweepy not installed. Twitter scraping disabled.")
        except Exception as e:
            logger.error(f"Error initializing Twitter client: {e}")

    def scrape(self) -> List[ScrapedArticle]:
        """Scrape tweets from search queries and monitored accounts."""
        if not self.client:
            logger.warning("Twitter client not initialized. Skipping scrape.")
            return []

        all_articles = []

        # Search queries
        for query in TWITTER_SEARCH_QUERIES:
            try:
                articles = self._search_tweets(query)
                all_articles.extend(articles)
            except Exception as e:
                logger.error(f"Error searching tweets for '{query}': {e}")

        # Monitored accounts
        for account in TWITTER_ACCOUNTS:
            try:
                articles = self._get_user_tweets(account)
                all_articles.extend(articles)
            except Exception as e:
                logger.error(f"Error getting tweets from @{account}: {e}")

        self.log_scrape()
        return self.deduplicate(all_articles)

    def _search_tweets(self, query: str, max_results: int = 50) -> List[ScrapedArticle]:
        """Search for tweets matching a query."""
        articles = []

        try:
            response = self.client.search_recent_tweets(
                query=query,
                max_results=max_results,
                tweet_fields=["created_at", "text", "author_id"],
            )

            if response.data:
                for tweet in response.data:
                    article = self._tweet_to_article(tweet)
                    if article:
                        articles.append(article)

        except Exception as e:
            logger.error(f"Error in tweet search: {e}")

        return articles

    def _get_user_tweets(self, username: str, max_results: int = 20) -> List[ScrapedArticle]:
        """Get recent tweets from a specific user."""
        articles = []

        try:
            # First get user ID
            user = self.client.get_user(username=username)
            if not user.data:
                return articles

            user_id = user.data.id

            # Get user's tweets
            response = self.client.get_users_tweets(
                id=user_id,
                max_results=max_results,
                tweet_fields=["created_at", "text"],
            )

            if response.data:
                for tweet in response.data:
                    article = self._tweet_to_article(tweet, username)
                    if article:
                        articles.append(article)

        except Exception as e:
            logger.error(f"Error getting user tweets: {e}")

        return articles

    def _tweet_to_article(self, tweet, username: str = None) -> Optional[ScrapedArticle]:
        """Convert a tweet to a ScrapedArticle."""
        try:
            tweet_id = tweet.id
            text = tweet.text
            created_at = getattr(tweet, "created_at", None)

            # Create URL to the tweet
            url = f"https://twitter.com/i/status/{tweet_id}"

            source = f"@{username}" if username else "Twitter/X"

            return ScrapedArticle(
                title=text[:100] + "..." if len(text) > 100 else text,
                url=url,
                source=source,
                published_at=created_at,
                content_snippet=text,
                category="social",
            )

        except Exception as e:
            logger.error(f"Error converting tweet to article: {e}")
            return None

    def is_configured(self) -> bool:
        """Check if the Twitter client is properly configured."""
        return self.client is not None
