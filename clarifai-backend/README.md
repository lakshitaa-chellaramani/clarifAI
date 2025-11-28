# ClarifAI Backend

FastAPI backend for the ClarifAI misinformation detection system.

## Features

- **Topic Detection**: AI-powered identification of high-risk misinformation topics
- **News Aggregation**: Multi-source news fetching (TOI, NDTV, HT, India Today, The Hindu)
- **Fact Checking**: Integration with Google Fact Check API and Alt News
- **Knowledge Graph**: Neo4j-based entity and relationship storage
- **Source Credibility**: Trust scoring based on verification consensus
- **Narrative Generation**: AI-generated news anchor scripts

## Tech Stack

- **Framework**: FastAPI
- **AI/LLM**: Google Gemini via LangChain
- **Database**: Neo4j Aura
- **News Sources**: RSS feeds, Google News API

## Getting Started

### Prerequisites

- Python 3.10+
- Neo4j Aura account (or local Neo4j instance)
- Google AI API key

### Installation

```bash
cd clarifai-backend
pip install -r requirements.txt
```

### Configuration

Create a `.env` file (or use the provided one):

```env
GOOGLE_API_KEY=your_google_api_key
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=neo4j
API_HOST=0.0.0.0
API_PORT=8000
```

### Running

```bash
python run.py
```

Or:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Topics
- `GET /topics` - Get all active misinformation topics
- `GET /topics/{id}` - Get topic details with timeline
- `POST /topics/analyze` - Force fresh analysis

### Sources
- `GET /sources` - Get sources with credibility scores
- `POST /sources/recalculate` - Recalculate trust scores

### Claims
- `GET /claims` - Get recent claims
- `POST /claims/verify` - Verify a specific claim
- `GET /claims/fact-checks` - Get fact-checks from external APIs

### Knowledge Graph
- `GET /graph/stats` - Get graph statistics
- `GET /graph/nodes` - Get nodes and edges for visualization
- `GET /graph/events` - Get recent events
- `GET /graph/entities` - Get entities

### AI Anchor
- `POST /anchor/generate` - Generate news anchor script
- `GET /anchor/timeline/{topic}` - Get cinematic timeline
- `GET /anchor/preview` - Get preview script

### System
- `GET /` - Health check
- `GET /health` - Detailed health status
- `GET /stats` - System statistics

## Project Structure

```
clarifai-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configuration
│   ├── models/
│   │   └── schemas.py       # Pydantic models
│   ├── routers/
│   │   ├── topics.py        # Topics endpoints
│   │   ├── sources.py       # Sources endpoints
│   │   ├── claims.py        # Claims endpoints
│   │   ├── graph.py         # Graph endpoints
│   │   └── anchor.py        # Anchor endpoints
│   └── services/
│       ├── news_service.py      # News fetching
│       ├── analysis_service.py  # AI analysis
│       ├── graph_service.py     # Neo4j operations
│       └── narrative_service.py # Script generation
├── requirements.txt
├── run.py
├── .env
└── README.md
```

## License

MIT
