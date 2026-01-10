"""
Sentiment analysis for article content.
Uses VADER (Valence Aware Dictionary and sEntiment Reasoner).
"""

from typing import Optional, List
import logging

logger = logging.getLogger(__name__)


class SentimentAnalyzer:
    """Analyzes sentiment of text using VADER."""

    def __init__(self, boost_keywords: Optional[List[str]] = None):
        self.analyzer = None
        self.boost_keywords = boost_keywords or []
        self._init_analyzer()

    def _init_analyzer(self):
        """Initialize the VADER analyzer."""
        try:
            from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
            self.analyzer = SentimentIntensityAnalyzer()
            logger.info("VADER sentiment analyzer initialized")
        except ImportError:
            logger.warning(
                "vaderSentiment not installed. "
                "Install with: pip install vaderSentiment"
            )

    def analyze(self, text: str) -> float:
        """
        Analyze the sentiment of text.

        Returns:
            float: Compound score from -1 (most negative) to +1 (most positive)
        """
        if not self.analyzer:
            return 0.0

        if not text:
            return 0.0

        try:
            scores = self.analyzer.polarity_scores(text)
            compound = scores["compound"]

            # Apply boost for negative keywords
            boost = self._calculate_boost(text)
            adjusted = compound - boost

            # Clamp to [-1, 1]
            return max(-1.0, min(1.0, adjusted))

        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            return 0.0

    def _calculate_boost(self, text: str) -> float:
        """
        Calculate boost based on presence of negative keywords.

        Returns:
            float: Boost value to subtract from sentiment score
        """
        if not self.boost_keywords:
            return 0.0

        text_lower = text.lower()
        matches = sum(1 for kw in self.boost_keywords if kw.lower() in text_lower)

        # Each keyword match adds 0.05 to negativity (max 0.3)
        return min(0.3, matches * 0.05)

    def is_negative(self, text: str, threshold: float = -0.2) -> bool:
        """Check if text sentiment is below the negative threshold."""
        score = self.analyze(text)
        return score < threshold

    def get_detailed_scores(self, text: str) -> dict:
        """
        Get detailed sentiment scores.

        Returns:
            dict with 'neg', 'neu', 'pos', 'compound' scores
        """
        if not self.analyzer:
            return {"neg": 0, "neu": 1, "pos": 0, "compound": 0}

        try:
            return self.analyzer.polarity_scores(text)
        except Exception as e:
            logger.error(f"Error getting detailed scores: {e}")
            return {"neg": 0, "neu": 1, "pos": 0, "compound": 0}

    def is_ready(self) -> bool:
        """Check if the analyzer is ready to use."""
        return self.analyzer is not None


# Default instance with boost keywords
from ..scrapers.sources import NEGATIVE_BOOST_KEYWORDS

default_analyzer = SentimentAnalyzer(boost_keywords=NEGATIVE_BOOST_KEYWORDS)


def analyze_sentiment(text: str) -> float:
    """Convenience function using default analyzer."""
    return default_analyzer.analyze(text)


def is_negative(text: str, threshold: float = -0.2) -> bool:
    """Convenience function to check if text is negative."""
    return default_analyzer.is_negative(text, threshold)
