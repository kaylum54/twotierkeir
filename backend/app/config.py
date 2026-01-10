"""
Configuration module for Starmer Watch.
Loads environment variables and provides application settings.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = "sqlite:///./starmer_watch.db"

    # X/Twitter API
    x_api_key: Optional[str] = None
    x_api_secret: Optional[str] = None
    x_access_token: Optional[str] = None
    x_access_token_secret: Optional[str] = None
    x_community_id: Optional[str] = None

    # Scraper Settings
    scrape_interval_minutes: int = 30
    sentiment_threshold: float = -0.2

    # App Settings
    debug: bool = True
    secret_key: str = "change-me-in-production"

    # API Settings
    api_prefix: str = "/api"

    # Rate Limiting
    max_posts_per_day: int = 50
    min_minutes_between_posts: int = 30

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
