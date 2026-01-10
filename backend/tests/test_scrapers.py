"""
Tests for scraper functionality.
"""

import pytest
from app.scrapers.base_scraper import ScrapedArticle
from app.scrapers.rss_scraper import RSSScraper
from app.scrapers.sources import STARMER_KEYWORDS
from app.processors.sentiment import SentimentAnalyzer, analyze_sentiment
from app.processors.content_filter import ContentFilter
from app.processors.formatter import PostFormatter


class TestScrapedArticle:
    """Tests for ScrapedArticle dataclass."""

    def test_url_hash(self):
        article = ScrapedArticle(
            title="Test Article",
            url="https://example.com/test",
            source="Test Source"
        )
        hash1 = article.get_url_hash()
        hash2 = article.get_url_hash()
        assert hash1 == hash2
        assert len(hash1) == 32  # MD5 hash length

    def test_contains_starmer_mention(self):
        article = ScrapedArticle(
            title="Keir Starmer announces new policy",
            url="https://example.com/test",
            source="Test Source"
        )
        assert article.contains_starmer_mention(STARMER_KEYWORDS)

    def test_no_starmer_mention(self):
        article = ScrapedArticle(
            title="Weather forecast for tomorrow",
            url="https://example.com/test",
            source="Test Source"
        )
        assert not article.contains_starmer_mention(STARMER_KEYWORDS)


class TestSentimentAnalyzer:
    """Tests for sentiment analysis."""

    def test_negative_sentiment(self):
        analyzer = SentimentAnalyzer()
        score = analyzer.analyze("This is a complete disaster and failure")
        assert score < 0

    def test_positive_sentiment(self):
        analyzer = SentimentAnalyzer()
        score = analyzer.analyze("This is wonderful and excellent news")
        assert score > 0

    def test_neutral_sentiment(self):
        analyzer = SentimentAnalyzer()
        score = analyzer.analyze("The meeting was held on Tuesday")
        assert -0.3 < score < 0.3

    def test_is_negative(self):
        analyzer = SentimentAnalyzer()
        assert analyzer.is_negative("Catastrophic failure and disaster", threshold=-0.2)
        assert not analyzer.is_negative("Wonderful success", threshold=-0.2)

    def test_keyword_boost(self):
        analyzer = SentimentAnalyzer(boost_keywords=["crisis", "disaster"])
        score_without = SentimentAnalyzer().analyze("The policy has issues")
        score_with = analyzer.analyze("The policy crisis is a disaster")
        assert score_with < score_without


class TestContentFilter:
    """Tests for content filtering."""

    def test_filter_starmer_mentions(self):
        filter = ContentFilter()
        articles = [
            ScrapedArticle(title="Starmer faces backlash", url="http://a.com", source="A"),
            ScrapedArticle(title="Weather update", url="http://b.com", source="B"),
            ScrapedArticle(title="PM in crisis", url="http://c.com", source="C"),
        ]
        filtered = filter.filter_articles(articles)
        assert len(filtered) >= 1

    def test_relevance_scoring(self):
        filter = ContentFilter()
        articles = [
            ScrapedArticle(
                title="Starmer disaster crisis scandal",
                url="http://a.com",
                source="BBC",
                content_snippet="Major crisis"
            ),
            ScrapedArticle(
                title="Starmer makes announcement",
                url="http://b.com",
                source="Blog",
                content_snippet="Policy update"
            ),
        ]
        filtered = filter.filter_articles(articles, require_negative=False)
        # More negative article should have higher relevance
        if len(filtered) >= 2:
            assert filtered[0].relevance_score >= filtered[1].relevance_score


class TestPostFormatter:
    """Tests for X post formatting."""

    def test_post_length(self):
        formatter = PostFormatter()
        article = ScrapedArticle(
            title="A" * 500,  # Very long title
            url="https://example.com/article",
            source="Test"
        )
        post = formatter.format(article)
        assert post.is_valid()
        assert post.character_count <= 280

    def test_post_includes_url(self):
        formatter = PostFormatter()
        article = ScrapedArticle(
            title="Test headline",
            url="https://example.com/article",
            source="Test"
        )
        post = formatter.format(article)
        assert "https://example.com/article" in post.text

    def test_custom_opener(self):
        formatter = PostFormatter()
        article = ScrapedArticle(
            title="Test headline",
            url="https://example.com",
            source="Test"
        )
        post = formatter.format(article, custom_opener="Custom opener:")
        assert "Custom opener:" in post.text


class TestRSSScraper:
    """Tests for RSS scraper (requires network)."""

    @pytest.mark.skip(reason="Requires network access")
    def test_scrape_sources(self):
        scraper = RSSScraper()
        articles = scraper.scrape()
        # Should get some articles
        assert isinstance(articles, list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
