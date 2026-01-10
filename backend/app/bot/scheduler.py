"""
Post scheduling system for automated posting.
"""

from datetime import datetime, timedelta, time
from typing import List, Optional, Callable
import logging
import random

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from ..database import SessionLocal, XPost, Article
from ..scrapers.rss_scraper import RSSScraper
from ..processors.content_filter import ContentFilter
from ..processors.formatter import PostFormatter
from .x_bot import XBot

logger = logging.getLogger(__name__)


# Peak UK posting hours
PEAK_HOURS = [
    (7, 9),   # Morning commute
    (12, 14), # Lunch break
    (18, 21), # Evening
]


class PostScheduler:
    """Manages scheduled scraping and posting."""

    def __init__(
        self,
        bot: XBot,
        scrape_interval_minutes: int = 30,
        posts_per_day: int = 6,
    ):
        self.bot = bot
        self.scrape_interval = scrape_interval_minutes
        self.posts_per_day = posts_per_day
        self.scheduler = AsyncIOScheduler()
        self.scraper = RSSScraper()
        self.content_filter = ContentFilter()
        self.formatter = PostFormatter()

    def start(self):
        """Start the scheduler."""
        # Schedule regular scraping
        self.scheduler.add_job(
            self.run_scrape,
            trigger=IntervalTrigger(minutes=self.scrape_interval),
            id="scrape_job",
            name="Scrape news sources",
            replace_existing=True,
        )

        # Schedule daily post planning
        self.scheduler.add_job(
            self.plan_daily_posts,
            trigger=CronTrigger(hour=6, minute=0),  # 6 AM UK
            id="plan_posts_job",
            name="Plan daily posts",
            replace_existing=True,
        )

        # Schedule post execution every 30 minutes
        self.scheduler.add_job(
            self.execute_scheduled_posts,
            trigger=IntervalTrigger(minutes=30),
            id="execute_posts_job",
            name="Execute scheduled posts",
            replace_existing=True,
        )

        self.scheduler.start()
        logger.info("Scheduler started")

    def stop(self):
        """Stop the scheduler."""
        self.scheduler.shutdown()
        logger.info("Scheduler stopped")

    async def run_scrape(self):
        """Run a scraping job."""
        logger.info("Starting scheduled scrape...")

        try:
            # Scrape RSS feeds
            articles = self.scraper.scrape()

            # Filter for negative Starmer content
            filtered = self.content_filter.filter_articles(articles)

            # Save to database
            db = SessionLocal()
            try:
                saved = 0
                for fa in filtered:
                    # Check if URL already exists
                    existing = db.query(Article).filter(
                        Article.url == fa.article.url
                    ).first()

                    if not existing:
                        article = Article(
                            title=fa.article.title,
                            url=fa.article.url,
                            source=fa.article.source,
                            published_at=fa.article.published_at,
                            sentiment_score=fa.sentiment_score,
                            content_snippet=fa.article.content_snippet,
                            category=fa.article.category,
                        )
                        db.add(article)
                        saved += 1

                db.commit()
                logger.info(f"Saved {saved} new articles")

            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error in scheduled scrape: {e}")

    async def plan_daily_posts(self):
        """Plan posts for the day based on peak hours."""
        logger.info("Planning daily posts...")

        db = SessionLocal()
        try:
            # Get unposted articles
            articles = db.query(Article).filter(
                Article.is_posted == False,
                Article.sentiment_score < -0.2
            ).order_by(Article.sentiment_score).limit(self.posts_per_day).all()

            if not articles:
                logger.warning("No unposted articles available")
                return

            # Generate posting times for today
            post_times = self._generate_post_times(len(articles))

            # Schedule each article
            for article, post_time in zip(articles, post_times):
                formatted = self.formatter.format(article)

                x_post = XPost(
                    article_id=article.id,
                    post_text=formatted.text,
                    scheduled_for=post_time,
                    status="scheduled",
                )
                db.add(x_post)

            db.commit()
            logger.info(f"Scheduled {len(articles)} posts for today")

        finally:
            db.close()

    async def execute_scheduled_posts(self):
        """Execute posts that are due."""
        if not self.bot.is_configured():
            logger.warning("Bot not configured. Skipping post execution.")
            return

        db = SessionLocal()
        try:
            # Get posts due for execution
            now = datetime.utcnow()
            due_posts = db.query(XPost).filter(
                XPost.status == "scheduled",
                XPost.scheduled_for <= now
            ).all()

            for x_post in due_posts:
                formatted = FormattedPost(
                    text=x_post.post_text,
                    article_id=x_post.article_id,
                )

                tweet_id = self.bot.post(formatted, x_post.article_id)

                if tweet_id:
                    x_post.x_post_id = tweet_id
                    x_post.posted_at = now
                    x_post.status = "posted"

                    # Mark article as posted
                    if x_post.article_id:
                        article = db.query(Article).get(x_post.article_id)
                        if article:
                            article.is_posted = True
                            article.posted_at = now
                else:
                    x_post.status = "failed"

            db.commit()

        finally:
            db.close()

    def _generate_post_times(self, count: int) -> List[datetime]:
        """Generate posting times distributed across peak hours."""
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        times = []

        # Flatten peak hours into available slots
        available_hours = []
        for start, end in PEAK_HOURS:
            available_hours.extend(range(start, end + 1))

        # Distribute posts across available hours
        if count > len(available_hours):
            # More posts than hours - double up on some hours
            hours_to_use = available_hours * 2
        else:
            hours_to_use = available_hours

        # Randomly select hours for posting
        selected_hours = sorted(random.sample(hours_to_use[:max(count, len(hours_to_use))], min(count, len(hours_to_use))))

        for hour in selected_hours:
            # Random minute within the hour
            minute = random.randint(0, 59)
            post_time = today.replace(hour=hour, minute=minute)

            # If time has passed today, schedule for tomorrow
            if post_time < datetime.utcnow():
                post_time += timedelta(days=1)

            times.append(post_time)

        return times

    def schedule_immediate_post(self, article_id: int) -> Optional[XPost]:
        """Schedule a post for immediate execution."""
        db = SessionLocal()
        try:
            article = db.query(Article).get(article_id)
            if not article:
                return None

            formatted = self.formatter.format(article)

            x_post = XPost(
                article_id=article.id,
                post_text=formatted.text,
                scheduled_for=datetime.utcnow(),
                status="scheduled",
            )
            db.add(x_post)
            db.commit()
            db.refresh(x_post)

            return x_post

        finally:
            db.close()

    def get_queue(self) -> List[XPost]:
        """Get the current post queue."""
        db = SessionLocal()
        try:
            return db.query(XPost).filter(
                XPost.status.in_(["pending", "scheduled"])
            ).order_by(XPost.scheduled_for).all()
        finally:
            db.close()
