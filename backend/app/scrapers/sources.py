"""
News sources and search configurations for Starmer Watch.
"""

from typing import List, Dict

# RSS Feed Sources
RSS_SOURCES: List[Dict[str, str]] = [
    {
        "name": "The Guardian Politics",
        "url": "https://www.theguardian.com/politics/rss",
        "category": "general"
    },
    {
        "name": "The Telegraph Politics",
        "url": "https://www.telegraph.co.uk/politics/rss.xml",
        "category": "general"
    },
    {
        "name": "Daily Mail Politics",
        "url": "https://www.dailymail.co.uk/news/politics/index.rss",
        "category": "general"
    },
    {
        "name": "GB News",
        "url": "https://www.gbnews.com/feeds/rss",
        "category": "general"
    },
    {
        "name": "The Sun Politics",
        "url": "https://www.thesun.co.uk/news/politics/feed/",
        "category": "general"
    },
    {
        "name": "Sky News Politics",
        "url": "https://feeds.skynews.com/feeds/rss/politics.xml",
        "category": "general"
    },
    {
        "name": "BBC Politics",
        "url": "https://feeds.bbci.co.uk/news/politics/rss.xml",
        "category": "general"
    },
    {
        "name": "The Independent Politics",
        "url": "https://www.independent.co.uk/news/uk/politics/rss",
        "category": "general"
    },
    {
        "name": "Express Politics",
        "url": "https://www.express.co.uk/posts/rss/139/politics",
        "category": "general"
    },
]

# International sources for "World Stage" section
INTERNATIONAL_RSS_SOURCES: List[Dict[str, str]] = [
    {
        "name": "Reuters UK",
        "url": "https://www.reuters.com/world/uk/rss",
        "category": "international"
    },
    {
        "name": "AP News UK",
        "url": "https://apnews.com/hub/united-kingdom?format=rss",
        "category": "international"
    },
]

# X/Twitter search queries
TWITTER_SEARCH_QUERIES: List[str] = [
    '"Keir Starmer" -filter:retweets',
    'Starmer fail OR disaster OR crisis -filter:retweets',
    'Starmer "two tier" -filter:retweets',
    'Starmer broken promise -filter:retweets',
    'Starmer U-turn -filter:retweets',
    'Starmer approval rating -filter:retweets',
]

# Notable X/Twitter accounts to monitor
TWITTER_ACCOUNTS: List[str] = [
    "GuidoFawkes",
    "BrescianiCarla",
    "TomHarwood",
    "DarrenGrimes_",
    "MrHarryCole",
    "Nigel_Farage",
]

# Keywords that boost negativity detection
NEGATIVE_BOOST_KEYWORDS: List[str] = [
    "crisis",
    "disaster",
    "failure",
    "scandal",
    "backlash",
    "u-turn",
    "gaffe",
    "two-tier",
    "two tier",
    "broken promise",
    "out of touch",
    "incompetent",
    "approval rating",
    "poll collapse",
    "resign",
    "sack",
    "shambles",
    "chaos",
    "embarrassment",
    "humiliation",
    "catastrophe",
]

# Keywords to filter for Starmer-related content
STARMER_KEYWORDS: List[str] = [
    "starmer",
    "keir",
    "prime minister",
    "pm",
    "labour leader",
    "downing street",
    "no 10",
    "number 10",
]
