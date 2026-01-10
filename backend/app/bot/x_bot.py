"""
X/Twitter bot for posting curated content.
"""

from datetime import datetime, timedelta
from typing import Optional, List
import logging

from ..database import XPost, Article, SessionLocal
from ..processors.formatter import FormattedPost

logger = logging.getLogger(__name__)


class XBot:
    """Bot for posting to X/Twitter."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        api_secret: Optional[str] = None,
        access_token: Optional[str] = None,
        access_token_secret: Optional[str] = None,
        community_id: Optional[str] = None,
        max_posts_per_day: int = 50,
        min_minutes_between_posts: int = 30,
    ):
        self.client = None
        self.community_id = community_id
        self.max_posts_per_day = max_posts_per_day
        self.min_minutes_between_posts = min_minutes_between_posts

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
            logger.info("X bot client initialized successfully")
        except ImportError:
            logger.warning("Tweepy not installed. X posting disabled.")
        except Exception as e:
            logger.error(f"Error initializing X client: {e}")

    def post(self, formatted_post: FormattedPost, article_id: Optional[int] = None) -> Optional[str]:
        """
        Post to X/Twitter.

        Args:
            formatted_post: The formatted post to send
            article_id: Optional ID of the associated article

        Returns:
            The tweet ID if successful, None otherwise
        """
        if not self.client:
            logger.warning("X client not initialized. Cannot post.")
            return None

        if not self._can_post():
            logger.warning("Rate limit reached. Cannot post.")
            return None

        try:
            # Create the tweet
            response = self.client.create_tweet(text=formatted_post.text)

            if response.data:
                tweet_id = response.data["id"]
                logger.info(f"Successfully posted tweet: {tweet_id}")

                # Save to database
                self._save_post(formatted_post, tweet_id, article_id)

                return tweet_id

        except Exception as e:
            logger.error(f"Error posting to X: {e}")
            self._save_failed_post(formatted_post, str(e), article_id)

        return None

    def post_thread(self, posts: List[FormattedPost], article_id: Optional[int] = None) -> List[str]:
        """
        Post a thread to X/Twitter.

        Returns:
            List of tweet IDs
        """
        if not self.client:
            logger.warning("X client not initialized. Cannot post thread.")
            return []

        tweet_ids = []
        reply_to_id = None

        for post in posts:
            try:
                if reply_to_id:
                    response = self.client.create_tweet(
                        text=post.text,
                        in_reply_to_tweet_id=reply_to_id
                    )
                else:
                    response = self.client.create_tweet(text=post.text)

                if response.data:
                    tweet_id = response.data["id"]
                    tweet_ids.append(tweet_id)
                    reply_to_id = tweet_id
                    logger.info(f"Posted thread tweet: {tweet_id}")

            except Exception as e:
                logger.error(f"Error posting thread tweet: {e}")
                break

        return tweet_ids

    def _can_post(self) -> bool:
        """Check if we can post based on rate limits."""
        db = SessionLocal()
        try:
            # Check posts in last 24 hours
            since = datetime.utcnow() - timedelta(hours=24)
            recent_posts = db.query(XPost).filter(
                XPost.posted_at >= since,
                XPost.status == "posted"
            ).count()

            if recent_posts >= self.max_posts_per_day:
                logger.warning(f"Daily limit reached: {recent_posts}/{self.max_posts_per_day}")
                return False

            # Check time since last post
            last_post = db.query(XPost).filter(
                XPost.status == "posted"
            ).order_by(XPost.posted_at.desc()).first()

            if last_post and last_post.posted_at:
                time_since = datetime.utcnow() - last_post.posted_at
                if time_since < timedelta(minutes=self.min_minutes_between_posts):
                    logger.warning(f"Too soon since last post: {time_since}")
                    return False

            return True

        finally:
            db.close()

    def _save_post(
        self,
        formatted_post: FormattedPost,
        tweet_id: str,
        article_id: Optional[int],
    ):
        """Save successful post to database."""
        db = SessionLocal()
        try:
            x_post = XPost(
                article_id=article_id,
                post_text=formatted_post.text,
                x_post_id=tweet_id,
                posted_at=datetime.utcnow(),
                status="posted",
            )
            db.add(x_post)
            db.commit()
        finally:
            db.close()

    def _save_failed_post(
        self,
        formatted_post: FormattedPost,
        error: str,
        article_id: Optional[int],
    ):
        """Save failed post attempt to database."""
        db = SessionLocal()
        try:
            x_post = XPost(
                article_id=article_id,
                post_text=formatted_post.text,
                status="failed",
            )
            db.add(x_post)
            db.commit()
            logger.error(f"Post failed and saved: {error}")
        finally:
            db.close()

    def get_pending_posts(self) -> List[XPost]:
        """Get posts waiting to be sent."""
        db = SessionLocal()
        try:
            return db.query(XPost).filter(XPost.status == "pending").all()
        finally:
            db.close()

    def get_scheduled_posts(self) -> List[XPost]:
        """Get posts scheduled for future."""
        db = SessionLocal()
        try:
            return db.query(XPost).filter(
                XPost.status == "scheduled",
                XPost.scheduled_for > datetime.utcnow()
            ).order_by(XPost.scheduled_for).all()
        finally:
            db.close()

    def is_configured(self) -> bool:
        """Check if the bot is properly configured."""
        return self.client is not None

    def get_daily_post_count(self) -> int:
        """Get number of posts in the last 24 hours."""
        db = SessionLocal()
        try:
            since = datetime.utcnow() - timedelta(hours=24)
            return db.query(XPost).filter(
                XPost.posted_at >= since,
                XPost.status == "posted"
            ).count()
        finally:
            db.close()
