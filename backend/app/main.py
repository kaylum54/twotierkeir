"""
Starmer Watch - FastAPI Application Entry Point
A satirical platform tracking negative coverage of UK PM Keir Starmer.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import init_db
from .api.routes import router as api_router
from .bot.scheduler import PostScheduler
from .bot.x_bot import XBot

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

settings = get_settings()

# Global scheduler instance
scheduler: PostScheduler = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown."""
    global scheduler

    # Startup
    logger.info("Starting Starmer Watch...")

    # Initialize database
    init_db()
    logger.info("Database initialized")

    # Initialize X bot (if configured)
    bot = XBot(
        api_key=settings.x_api_key,
        api_secret=settings.x_api_secret,
        access_token=settings.x_access_token,
        access_token_secret=settings.x_access_token_secret,
        community_id=settings.x_community_id,
        max_posts_per_day=settings.max_posts_per_day,
        min_minutes_between_posts=settings.min_minutes_between_posts,
    )

    if bot.is_configured():
        logger.info("X bot configured and ready")
    else:
        logger.warning("X bot not configured - posting disabled")

    # Start scheduler
    scheduler = PostScheduler(
        bot=bot,
        scrape_interval_minutes=settings.scrape_interval_minutes,
    )

    if not settings.debug:
        scheduler.start()
        logger.info("Scheduler started")
    else:
        logger.info("Debug mode - scheduler not started automatically")

    yield

    # Shutdown
    if scheduler:
        scheduler.stop()
    logger.info("Starmer Watch shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="Starmer Watch",
    description="Tracking Britain's Leadership Crisis - A satirical news aggregator",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        # Add production domains here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "name": "Starmer Watch API",
        "tagline": "Tracking Britain's Leadership Crisis",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "scheduler_running": scheduler is not None and scheduler.scheduler.running if scheduler else False,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
