"""
Database models and connection for Starmer Watch.
Uses SQLAlchemy ORM with SQLite (dev) / PostgreSQL (prod).
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, CheckConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from .config import get_settings

settings = get_settings()

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Article(Base):
    """Scraped news articles about Starmer."""
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(Text, nullable=False)
    url = Column(Text, unique=True, nullable=False)
    source = Column(Text, nullable=False)
    published_at = Column(DateTime, nullable=True)
    scraped_at = Column(DateTime, default=datetime.utcnow)
    sentiment_score = Column(Float, nullable=True)
    content_snippet = Column(Text, nullable=True)
    is_posted = Column(Boolean, default=False)
    posted_at = Column(DateTime, nullable=True)
    category = Column(String(50), default="general")  # general, international, polling, promise

    # Relationship to X posts
    x_posts = relationship("XPost", back_populates="article")


class Promise(Base):
    """Tracked broken promises by Starmer."""
    __tablename__ = "promises"

    id = Column(Integer, primary_key=True, autoincrement=True)
    promise_text = Column(Text, nullable=False)
    date_promised = Column(DateTime, nullable=True)
    source_url = Column(Text, nullable=True)
    status = Column(String(20), default="pending")
    evidence_urls = Column(Text, nullable=True)  # JSON array stored as text
    mocking_comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

    __table_args__ = (
        CheckConstraint(
            status.in_(['broken', 'u-turn', 'pending', 'kept']),
            name='valid_status'
        ),
    )


class Poll(Base):
    """Polling data for approval ratings."""
    __tablename__ = "polls"

    id = Column(Integer, primary_key=True, autoincrement=True)
    pollster = Column(Text, nullable=False)
    date = Column(DateTime, nullable=False)
    approval_rating = Column(Float, nullable=True)
    disapproval_rating = Column(Float, nullable=True)
    sample_size = Column(Integer, nullable=True)
    source_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class XPost(Base):
    """X/Twitter posts made by the bot."""
    __tablename__ = "x_posts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=True)
    post_text = Column(Text, nullable=False)
    x_post_id = Column(String(100), nullable=True)  # ID returned from X API
    posted_at = Column(DateTime, nullable=True)
    scheduled_for = Column(DateTime, nullable=True)
    engagement_likes = Column(Integer, default=0)
    engagement_retweets = Column(Integer, default=0)
    status = Column(String(20), default="pending")

    # Relationship to article
    article = relationship("Article", back_populates="x_posts")

    __table_args__ = (
        CheckConstraint(
            status.in_(['pending', 'scheduled', 'posted', 'failed']),
            name='valid_post_status'
        ),
    )


class TierVote(Base):
    """Votes for the tier list of worst decisions."""
    __tablename__ = "tier_votes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    item_id = Column(Integer, nullable=False)
    item_description = Column(Text, nullable=False)
    vote_value = Column(Integer, nullable=True)  # 1-5 scale of how bad
    voter_ip_hash = Column(String(64), nullable=True)  # Anonymised for rate limiting
    created_at = Column(DateTime, default=datetime.utcnow)


class TierItem(Base):
    """Items that can be voted on in the tier list."""
    __tablename__ = "tier_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=True)
    date_occurred = Column(DateTime, nullable=True)
    source_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)


class CopeEntry(Base):
    """Wall of Cope entries - delusional defences of Starmer."""
    __tablename__ = "cope_entries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(Text, nullable=False)
    source_url = Column(String(500), nullable=True)
    source_platform = Column(String(50), default="other")  # 'x', 'reddit', 'facebook', 'other'
    source_username = Column(String(100), nullable=True)
    screenshot_url = Column(String(500), nullable=True)
    category = Column(String(50), default="copium")  # 'denial', 'deflection', 'whatabout', 'copium'
    cope_level = Column(Integer, default=5)  # 1-10 scale
    votes = Column(Integer, default=0)
    is_approved = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    submitted_by_ip_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)

    __table_args__ = (
        CheckConstraint(
            source_platform.in_(['x', 'reddit', 'facebook', 'other']),
            name='valid_cope_platform'
        ),
        CheckConstraint(
            category.in_(['denial', 'deflection', 'whatabout', 'copium']),
            name='valid_cope_category'
        ),
    )


def get_db():
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize the database tables."""
    Base.metadata.create_all(bind=engine)
