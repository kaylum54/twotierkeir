"""
Pydantic schemas for API request/response validation.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# Article schemas
class ArticleBase(BaseModel):
    title: str
    url: str
    source: str
    category: str = "general"


class ArticleResponse(ArticleBase):
    id: int
    published_at: Optional[datetime] = None
    scraped_at: datetime
    sentiment_score: Optional[float] = None
    content_snippet: Optional[str] = None
    is_posted: bool = False
    posted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ArticleListResponse(BaseModel):
    articles: List[ArticleResponse]
    total: int
    page: int
    per_page: int
    has_more: bool


# Promise schemas
class PromiseBase(BaseModel):
    promise_text: str
    date_promised: Optional[datetime] = None
    source_url: Optional[str] = None
    status: str = "pending"
    mocking_comment: Optional[str] = None


class PromiseCreate(PromiseBase):
    evidence_urls: Optional[List[str]] = None


class PromiseUpdate(BaseModel):
    status: Optional[str] = None
    mocking_comment: Optional[str] = None
    evidence_urls: Optional[List[str]] = None


class PromiseResponse(PromiseBase):
    id: int
    evidence_urls: Optional[str] = None  # JSON string
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PromiseListResponse(BaseModel):
    promises: List[PromiseResponse]
    total: int
    broken_count: int
    uturn_count: int
    pending_count: int


# Poll schemas
class PollBase(BaseModel):
    pollster: str
    date: datetime
    approval_rating: Optional[float] = None
    disapproval_rating: Optional[float] = None
    sample_size: Optional[int] = None
    source_url: Optional[str] = None


class PollCreate(PollBase):
    pass


class PollResponse(PollBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PollListResponse(BaseModel):
    polls: List[PollResponse]
    total: int
    latest_approval: Optional[float] = None
    approval_change: Optional[float] = None  # Change from previous poll


class PollHistoryResponse(BaseModel):
    polls: List[PollResponse]
    average_approval: float
    lowest_approval: float
    highest_approval: float


# Tier list schemas
class TierItemBase(BaseModel):
    description: str
    category: Optional[str] = None
    date_occurred: Optional[datetime] = None
    source_url: Optional[str] = None


class TierItemCreate(TierItemBase):
    pass


class TierItemResponse(TierItemBase):
    id: int
    created_at: datetime
    is_active: bool
    average_vote: Optional[float] = None
    vote_count: int = 0

    class Config:
        from_attributes = True


class TierVoteRequest(BaseModel):
    item_id: int
    vote_value: int = Field(..., ge=1, le=5)


class TierVoteResponse(BaseModel):
    success: bool
    new_average: float
    total_votes: int


class TierListResponse(BaseModel):
    items: List[TierItemResponse]
    total_votes: int


# X Post schemas
class XPostBase(BaseModel):
    post_text: str
    article_id: Optional[int] = None


class XPostResponse(XPostBase):
    id: int
    x_post_id: Optional[str] = None
    posted_at: Optional[datetime] = None
    scheduled_for: Optional[datetime] = None
    status: str
    engagement_likes: int = 0
    engagement_retweets: int = 0

    class Config:
        from_attributes = True


class PostQueueResponse(BaseModel):
    pending: List[XPostResponse]
    scheduled: List[XPostResponse]
    total_pending: int
    total_scheduled: int


# Admin schemas
class ScrapeResponse(BaseModel):
    success: bool
    articles_found: int
    articles_saved: int
    message: str


class ManualPostRequest(BaseModel):
    article_id: int


class ManualPostResponse(BaseModel):
    success: bool
    tweet_id: Optional[str] = None
    message: str


# Stats schemas
class DashboardStats(BaseModel):
    total_articles: int
    negative_articles: int
    posts_today: int
    posts_total: int
    broken_promises: int
    latest_approval_rating: Optional[float] = None
    days_since_disaster: int = 0  # Always 0 for satirical effect


# Cope schemas (Wall of Cope)
class CopeBase(BaseModel):
    content: str = Field(..., min_length=20, max_length=500)
    source_url: Optional[str] = None
    source_platform: str = "other"
    category: str = "copium"


class CopeSubmit(CopeBase):
    pass


class CopeResponse(CopeBase):
    id: int
    source_username: Optional[str] = None
    cope_level: int
    votes: int
    created_at: datetime

    class Config:
        from_attributes = True


class CopeListResponse(BaseModel):
    entries: List[CopeResponse]
    total: int


class CopeVoteResponse(BaseModel):
    success: bool
    votes: int


class CopeSubmitResponse(BaseModel):
    success: bool
    message: str
    id: Optional[int] = None
