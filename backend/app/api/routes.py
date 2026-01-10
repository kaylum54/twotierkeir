"""
API routes for Starmer Watch.
"""

from datetime import datetime, timedelta
from typing import Optional, List
import hashlib
import json

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db, Article, Promise, Poll, TierItem, TierVote, XPost
from ..scrapers.rss_scraper import RSSScraper
from ..processors.content_filter import ContentFilter
from ..processors.formatter import PostFormatter
from ..bot.x_bot import XBot
from ..config import get_settings
from .schemas import (
    ArticleResponse,
    ArticleListResponse,
    PromiseResponse,
    PromiseListResponse,
    PromiseCreate,
    PromiseUpdate,
    PollResponse,
    PollListResponse,
    PollHistoryResponse,
    TierItemResponse,
    TierListResponse,
    TierVoteRequest,
    TierVoteResponse,
    XPostResponse,
    PostQueueResponse,
    ScrapeResponse,
    ManualPostRequest,
    ManualPostResponse,
    DashboardStats,
)

router = APIRouter()
settings = get_settings()


# === Article Endpoints ===

@router.get("/articles", response_model=ArticleListResponse)
def get_articles(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    category: Optional[str] = None,
    sort_by: str = Query("published_at", regex="^(published_at|sentiment_score|scraped_at)$"),
    db: Session = Depends(get_db),
):
    """Get paginated list of negative articles."""
    query = db.query(Article).filter(Article.sentiment_score < settings.sentiment_threshold)

    if category:
        query = query.filter(Article.category == category)

    # Sorting
    if sort_by == "sentiment_score":
        query = query.order_by(Article.sentiment_score)
    elif sort_by == "scraped_at":
        query = query.order_by(Article.scraped_at.desc())
    else:
        query = query.order_by(Article.published_at.desc())

    total = query.count()
    articles = query.offset(offset).limit(limit).all()

    return ArticleListResponse(
        articles=[ArticleResponse.model_validate(a) for a in articles],
        total=total,
        page=offset // limit + 1,
        per_page=limit,
        has_more=offset + limit < total,
    )


@router.get("/articles/{article_id}", response_model=ArticleResponse)
def get_article(article_id: int, db: Session = Depends(get_db)):
    """Get a single article by ID."""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return ArticleResponse.model_validate(article)


# === Promise Endpoints ===

@router.get("/promises", response_model=PromiseListResponse)
def get_promises(db: Session = Depends(get_db)):
    """Get all tracked promises."""
    promises = db.query(Promise).order_by(Promise.created_at.desc()).all()

    broken = sum(1 for p in promises if p.status == "broken")
    uturn = sum(1 for p in promises if p.status == "u-turn")
    pending = sum(1 for p in promises if p.status == "pending")

    return PromiseListResponse(
        promises=[PromiseResponse.model_validate(p) for p in promises],
        total=len(promises),
        broken_count=broken,
        uturn_count=uturn,
        pending_count=pending,
    )


@router.post("/promises", response_model=PromiseResponse)
def create_promise(promise: PromiseCreate, db: Session = Depends(get_db)):
    """Create a new promise to track."""
    db_promise = Promise(
        promise_text=promise.promise_text,
        date_promised=promise.date_promised,
        source_url=promise.source_url,
        status=promise.status,
        mocking_comment=promise.mocking_comment,
        evidence_urls=json.dumps(promise.evidence_urls) if promise.evidence_urls else None,
    )
    db.add(db_promise)
    db.commit()
    db.refresh(db_promise)
    return PromiseResponse.model_validate(db_promise)


@router.put("/admin/promises/{promise_id}", response_model=PromiseResponse)
def update_promise(
    promise_id: int,
    update: PromiseUpdate,
    db: Session = Depends(get_db),
):
    """Update a promise's status (admin only)."""
    promise = db.query(Promise).filter(Promise.id == promise_id).first()
    if not promise:
        raise HTTPException(status_code=404, detail="Promise not found")

    if update.status:
        promise.status = update.status
    if update.mocking_comment:
        promise.mocking_comment = update.mocking_comment
    if update.evidence_urls:
        promise.evidence_urls = json.dumps(update.evidence_urls)

    promise.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(promise)
    return PromiseResponse.model_validate(promise)


# === Poll Endpoints ===

@router.get("/polls/latest", response_model=PollResponse)
def get_latest_poll(db: Session = Depends(get_db)):
    """Get the most recent polling data."""
    poll = db.query(Poll).order_by(Poll.date.desc()).first()
    if not poll:
        raise HTTPException(status_code=404, detail="No polling data available")
    return PollResponse.model_validate(poll)


@router.get("/polls/history", response_model=PollHistoryResponse)
def get_poll_history(
    days: int = Query(90, ge=7, le=365),
    db: Session = Depends(get_db),
):
    """Get historical polling data for charts."""
    since = datetime.utcnow() - timedelta(days=days)
    polls = db.query(Poll).filter(Poll.date >= since).order_by(Poll.date).all()

    if not polls:
        return PollHistoryResponse(
            polls=[],
            average_approval=0,
            lowest_approval=0,
            highest_approval=0,
        )

    approval_ratings = [p.approval_rating for p in polls if p.approval_rating is not None]

    return PollHistoryResponse(
        polls=[PollResponse.model_validate(p) for p in polls],
        average_approval=sum(approval_ratings) / len(approval_ratings) if approval_ratings else 0,
        lowest_approval=min(approval_ratings) if approval_ratings else 0,
        highest_approval=max(approval_ratings) if approval_ratings else 0,
    )


# === Tier List Endpoints ===

@router.get("/tier-list", response_model=TierListResponse)
def get_tier_list(db: Session = Depends(get_db)):
    """Get the tier list with vote averages."""
    items = db.query(TierItem).filter(TierItem.is_active == True).all()

    items_with_votes = []
    total_votes = 0

    for item in items:
        votes = db.query(TierVote).filter(TierVote.item_id == item.id).all()
        vote_count = len(votes)
        total_votes += vote_count

        avg_vote = None
        if votes:
            avg_vote = sum(v.vote_value for v in votes if v.vote_value) / vote_count

        item_response = TierItemResponse(
            id=item.id,
            description=item.description,
            category=item.category,
            date_occurred=item.date_occurred,
            source_url=item.source_url,
            created_at=item.created_at,
            is_active=item.is_active,
            average_vote=avg_vote,
            vote_count=vote_count,
        )
        items_with_votes.append(item_response)

    # Sort by average vote (worst first)
    items_with_votes.sort(key=lambda x: x.average_vote or 0, reverse=True)

    return TierListResponse(items=items_with_votes, total_votes=total_votes)


@router.post("/tier-list/vote", response_model=TierVoteResponse)
def vote_on_tier_item(
    vote: TierVoteRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Submit a vote for a tier list item."""
    # Check item exists
    item = db.query(TierItem).filter(TierItem.id == vote.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Get anonymised IP hash for rate limiting
    client_ip = request.client.host if request.client else "unknown"
    ip_hash = hashlib.sha256(client_ip.encode()).hexdigest()

    # Check for existing vote from this IP in last 24 hours
    since = datetime.utcnow() - timedelta(hours=24)
    existing = db.query(TierVote).filter(
        TierVote.item_id == vote.item_id,
        TierVote.voter_ip_hash == ip_hash,
        TierVote.created_at >= since,
    ).first()

    if existing:
        raise HTTPException(status_code=429, detail="Already voted on this item recently")

    # Create vote
    db_vote = TierVote(
        item_id=vote.item_id,
        item_description=item.description,
        vote_value=vote.vote_value,
        voter_ip_hash=ip_hash,
    )
    db.add(db_vote)
    db.commit()

    # Calculate new average
    votes = db.query(TierVote).filter(TierVote.item_id == vote.item_id).all()
    total = len(votes)
    avg = sum(v.vote_value for v in votes if v.vote_value) / total

    return TierVoteResponse(success=True, new_average=avg, total_votes=total)


# === Admin Endpoints ===

@router.post("/admin/scrape", response_model=ScrapeResponse)
def trigger_scrape(db: Session = Depends(get_db)):
    """Manually trigger a scrape run."""
    scraper = RSSScraper()
    content_filter = ContentFilter()

    try:
        articles = scraper.scrape()
        filtered = content_filter.filter_articles(articles)

        saved = 0
        for fa in filtered:
            existing = db.query(Article).filter(Article.url == fa.article.url).first()
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

        return ScrapeResponse(
            success=True,
            articles_found=len(filtered),
            articles_saved=saved,
            message=f"Scrape completed. Found {len(filtered)} negative articles, saved {saved} new.",
        )

    except Exception as e:
        return ScrapeResponse(
            success=False,
            articles_found=0,
            articles_saved=0,
            message=f"Scrape failed: {str(e)}",
        )


@router.post("/admin/post", response_model=ManualPostResponse)
def manual_post(
    request: ManualPostRequest,
    db: Session = Depends(get_db),
):
    """Manually post an article to X."""
    article = db.query(Article).filter(Article.id == request.article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    formatter = PostFormatter()
    formatted = formatter.format(article)

    bot = XBot(
        api_key=settings.x_api_key,
        api_secret=settings.x_api_secret,
        access_token=settings.x_access_token,
        access_token_secret=settings.x_access_token_secret,
    )

    if not bot.is_configured():
        return ManualPostResponse(
            success=False,
            message="X bot is not configured. Check API credentials.",
        )

    tweet_id = bot.post(formatted, article.id)

    if tweet_id:
        article.is_posted = True
        article.posted_at = datetime.utcnow()
        db.commit()

        return ManualPostResponse(
            success=True,
            tweet_id=tweet_id,
            message="Successfully posted to X.",
        )
    else:
        return ManualPostResponse(
            success=False,
            message="Failed to post to X. Check logs for details.",
        )


@router.get("/admin/queue", response_model=PostQueueResponse)
def get_post_queue(db: Session = Depends(get_db)):
    """Get the current post queue."""
    pending = db.query(XPost).filter(XPost.status == "pending").all()
    scheduled = db.query(XPost).filter(
        XPost.status == "scheduled",
        XPost.scheduled_for > datetime.utcnow()
    ).order_by(XPost.scheduled_for).all()

    return PostQueueResponse(
        pending=[XPostResponse.model_validate(p) for p in pending],
        scheduled=[XPostResponse.model_validate(s) for s in scheduled],
        total_pending=len(pending),
        total_scheduled=len(scheduled),
    )


# === Dashboard Stats ===

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics."""
    total_articles = db.query(Article).count()
    negative_articles = db.query(Article).filter(
        Article.sentiment_score < settings.sentiment_threshold
    ).count()

    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    posts_today = db.query(XPost).filter(
        XPost.posted_at >= today,
        XPost.status == "posted"
    ).count()
    posts_total = db.query(XPost).filter(XPost.status == "posted").count()

    broken_promises = db.query(Promise).filter(
        Promise.status.in_(["broken", "u-turn"])
    ).count()

    latest_poll = db.query(Poll).order_by(Poll.date.desc()).first()
    latest_approval = latest_poll.approval_rating if latest_poll else None

    return DashboardStats(
        total_articles=total_articles,
        negative_articles=negative_articles,
        posts_today=posts_today,
        posts_total=posts_total,
        broken_promises=broken_promises,
        latest_approval_rating=latest_approval,
        days_since_disaster=0,  # Always 0 for satirical effect
    )
