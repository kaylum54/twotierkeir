"""
Formatter for X/Twitter posts.
"""

import random
from typing import Optional
from dataclasses import dataclass

from ..scrapers.base_scraper import ScrapedArticle
from .content_filter import FilteredArticle


# Snarky opening lines for posts
OPENERS = [
    "Another day, another Starmer disaster:",
    "You couldn't make it up:",
    "The gift that keeps on giving:",
    "Meanwhile, in Starmer's Britain:",
    "Tier One incompetence:",
    "Leadership? What leadership?",
    "The two-tier PM strikes again:",
    "Breaking: Starmer being Starmer again:",
    "Absolutely astonishing:",
    "And yet somehow he's surprised:",
    "The man who couldn't organise a press conference:",
    "Prime Ministerial prowess on full display:",
    "Another masterclass in mediocrity:",
    "Sir Flip-Flop delivers once more:",
    "Is anyone actually surprised?",
    "Forensic incompetence:",
    "Imagine defending this:",
]

# Category-specific openers
CATEGORY_OPENERS = {
    "international": [
        "Britain's finest moment on the world stage:",
        "Making us proud internationally:",
        "When diplomacy goes wrong:",
        "Britain's image abroad continues to flourish:",
    ],
    "polling": [
        "The numbers don't lie:",
        "Another day, another poll collapse:",
        "The British public has spoken:",
        "Democratic mandate? What mandate?",
    ],
    "promise": [
        "Remember when he promised this?",
        "Another promise, another U-turn:",
        "Consistency is clearly not his strength:",
        "Add it to the broken promises pile:",
    ],
}

# Hashtags to potentially include
HASHTAGS = [
    "#StarmerOut",
    "#TwoTierKeir",
    "#BrokenPromises",
    "#LabourFail",
]


@dataclass
class FormattedPost:
    """A formatted post ready for X."""
    text: str
    article_id: Optional[int] = None
    article_url: Optional[str] = None
    character_count: int = 0

    def is_valid(self) -> bool:
        """Check if post is within X character limit."""
        return self.character_count <= 280


class PostFormatter:
    """Formats articles for X/Twitter posts."""

    MAX_CHARS = 280
    URL_LENGTH = 23  # X counts all URLs as 23 characters

    def __init__(self, include_hashtags: bool = False):
        self.include_hashtags = include_hashtags

    def format(
        self,
        article: ScrapedArticle,
        category: Optional[str] = None,
        custom_opener: Optional[str] = None,
    ) -> FormattedPost:
        """
        Format an article for X posting.

        Args:
            article: The article to format
            category: Optional category for category-specific openers
            custom_opener: Optional custom opener to use

        Returns:
            FormattedPost object
        """
        # Select opener
        opener = custom_opener or self._select_opener(category or article.category)

        # Calculate available space for headline
        available = self.MAX_CHARS - len(opener) - self.URL_LENGTH - 4  # 4 for newlines

        # Truncate headline if needed
        headline = article.title
        if len(headline) > available:
            headline = headline[:available - 3] + "..."

        # Build the post
        post_text = f"{opener}\n\n{headline}\n\n{article.url}"

        # Add hashtag if space and enabled
        if self.include_hashtags:
            hashtag = random.choice(HASHTAGS)
            if len(post_text) + len(hashtag) + 1 <= self.MAX_CHARS:
                post_text = f"{post_text} {hashtag}"

        return FormattedPost(
            text=post_text,
            article_url=article.url,
            character_count=self._count_chars(post_text),
        )

    def format_filtered(
        self,
        filtered_article: FilteredArticle,
        custom_opener: Optional[str] = None,
    ) -> FormattedPost:
        """Format a filtered article with sentiment-aware opener selection."""
        article = filtered_article.article

        # Very negative articles get more dramatic openers
        if filtered_article.sentiment_score < -0.5:
            dramatic_openers = [
                "Absolutely catastrophic:",
                "Unbelievable scenes:",
                "This is genuinely astonishing:",
            ]
            opener = custom_opener or random.choice(dramatic_openers)
        else:
            opener = custom_opener or self._select_opener(article.category)

        return self.format(article, custom_opener=opener)

    def _select_opener(self, category: str) -> str:
        """Select an appropriate opener based on category."""
        if category in CATEGORY_OPENERS:
            openers = CATEGORY_OPENERS[category] + OPENERS
        else:
            openers = OPENERS

        return random.choice(openers)

    def _count_chars(self, text: str) -> int:
        """
        Count characters for X posting.
        URLs are counted as 23 characters.
        """
        import re
        # Find URLs and replace with placeholder
        url_pattern = r'https?://\S+'
        urls = re.findall(url_pattern, text)

        # Replace each URL with 23-char placeholder
        for url in urls:
            text = text.replace(url, 'X' * self.URL_LENGTH)

        return len(text)

    def create_thread(
        self,
        article: ScrapedArticle,
        commentary: str,
    ) -> list[FormattedPost]:
        """
        Create a thread with article and commentary.

        Returns list of posts forming the thread.
        """
        posts = []

        # First post: the article
        opener = self._select_opener(article.category)
        first_post = f"{opener}\n\n{article.title[:200]}\n\n{article.url}"
        posts.append(FormattedPost(
            text=first_post,
            article_url=article.url,
            character_count=self._count_chars(first_post),
        ))

        # Second post: commentary (if fits)
        if len(commentary) <= self.MAX_CHARS:
            posts.append(FormattedPost(
                text=commentary,
                character_count=len(commentary),
            ))
        else:
            # Split commentary into multiple posts
            chunks = self._split_text(commentary, self.MAX_CHARS)
            for chunk in chunks:
                posts.append(FormattedPost(
                    text=chunk,
                    character_count=len(chunk),
                ))

        return posts

    def _split_text(self, text: str, max_len: int) -> list[str]:
        """Split text into chunks that fit within max_len."""
        words = text.split()
        chunks = []
        current_chunk = []
        current_len = 0

        for word in words:
            if current_len + len(word) + 1 <= max_len - 3:  # -3 for "..."
                current_chunk.append(word)
                current_len += len(word) + 1
            else:
                if current_chunk:
                    chunks.append(' '.join(current_chunk) + "...")
                current_chunk = [word]
                current_len = len(word)

        if current_chunk:
            chunks.append(' '.join(current_chunk))

        return chunks
