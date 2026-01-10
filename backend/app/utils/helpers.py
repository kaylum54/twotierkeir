"""
Utility helper functions.
"""

import re
import hashlib
from datetime import datetime, timezone
from typing import Optional


def hash_string(text: str) -> str:
    """Generate SHA256 hash of a string."""
    return hashlib.sha256(text.encode()).hexdigest()


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """Truncate text to max length, adding suffix if truncated."""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix


def clean_html(html: str) -> str:
    """Remove HTML tags from text."""
    clean = re.compile('<.*?>')
    return re.sub(clean, '', html).strip()


def format_datetime(dt: Optional[datetime], format_str: str = "%d %b %Y %H:%M") -> str:
    """Format datetime for display."""
    if not dt:
        return "Unknown"
    return dt.strftime(format_str)


def get_uk_time(dt: Optional[datetime] = None) -> datetime:
    """Get current UK time or convert datetime to UK timezone."""
    from zoneinfo import ZoneInfo

    uk_tz = ZoneInfo("Europe/London")

    if dt is None:
        return datetime.now(uk_tz)

    if dt.tzinfo is None:
        # Assume UTC if no timezone
        dt = dt.replace(tzinfo=timezone.utc)

    return dt.astimezone(uk_tz)


def is_peak_hour() -> bool:
    """Check if current UK time is during peak posting hours."""
    uk_time = get_uk_time()
    hour = uk_time.hour

    peak_hours = [
        (7, 9),   # Morning
        (12, 14), # Lunch
        (18, 21), # Evening
    ]

    return any(start <= hour <= end for start, end in peak_hours)


def calculate_days_until_election(election_date: datetime) -> int:
    """Calculate days until the next general election."""
    today = datetime.now().date()
    delta = election_date.date() - today
    return max(0, delta.days)


def slugify(text: str) -> str:
    """Convert text to URL-safe slug."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')
