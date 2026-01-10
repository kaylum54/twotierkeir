# Starmer Watch

**Tracking Britain's Leadership Crisis**

A satirical platform that aggregates negative news coverage about UK Prime Minister Keir Starmer and automatically posts curated content to an X (Twitter) community.

## Features

- **News Scraper**: Automated scraping from major UK news RSS feeds
- **Sentiment Analysis**: VADER-based sentiment filtering for negative coverage
- **X Bot**: Automated posting to X/Twitter with snarky commentary
- **Public Website**: Satirical platform with multiple sections:
  - Latest Failures: Real-time negative news feed
  - Broken Promises: Tracker for political commitments
  - World Stage: International coverage
  - Poll Watch: Approval rating charts
  - Tier List: Community-voted worst decisions

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Python 3.11+, FastAPI |
| Frontend | Next.js 14, React, TailwindCSS |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Scraping | BeautifulSoup4, Feedparser |
| Sentiment | VADER Sentiment Analysis |
| X API | Tweepy |
| Scheduling | APScheduler |

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker (optional, for production)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Unix/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp ../.env.example .env
# Edit .env with your settings

# Run the server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Docker Setup

```bash
# Copy environment file
cp .env.example .env
# Edit .env with your settings

# Start all services
docker-compose up -d
```

## Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=sqlite:///./starmer_watch.db

# X/Twitter API (get from developer.twitter.com)
X_API_KEY=your_api_key
X_API_SECRET=your_api_secret
X_ACCESS_TOKEN=your_access_token
X_ACCESS_TOKEN_SECRET=your_access_token_secret
X_COMMUNITY_ID=your_community_id

# Scraper Settings
SCRAPE_INTERVAL_MINUTES=30
SENTIMENT_THRESHOLD=-0.2

# App Settings
DEBUG=true
SECRET_KEY=your_secure_key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles` | List negative articles |
| GET | `/api/articles/{id}` | Get article details |
| GET | `/api/promises` | List tracked promises |
| GET | `/api/polls/latest` | Get latest poll |
| GET | `/api/polls/history` | Get poll history |
| GET | `/api/tier-list` | Get tier list rankings |
| POST | `/api/tier-list/vote` | Submit a vote |
| GET | `/api/stats` | Get dashboard statistics |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/scrape` | Trigger manual scrape |
| POST | `/api/admin/post` | Post article to X |
| GET | `/api/admin/queue` | View post queue |

## Project Structure

```
starmer-watch/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── config.py         # Configuration
│   │   ├── database.py       # Database models
│   │   ├── scrapers/         # News scrapers
│   │   ├── processors/       # Sentiment & filtering
│   │   ├── bot/              # X bot & scheduler
│   │   ├── api/              # API routes
│   │   └── utils/            # Helpers
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js pages
│   │   ├── components/       # React components
│   │   ├── lib/              # API & utilities
│   │   └── styles/           # Global styles
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## Legal Disclaimer

This is a satirical website. All commentary represents opinion and satire. Content is aggregated and linked for commentary purposes under fair use principles.

- No fake quotes are attributed to real people
- All satirical content is clearly labelled
- Editorial-use images only
- Compliant with UK defamation law

## License

MIT License - See LICENSE file for details.
