# ClarifAI

**AI-Powered Fact-Checking & Misinformation Detection Platform**

ClarifAI is a comprehensive news verification platform that combines real-time fact-checking, source analysis, and AI-powered explanations to combat misinformation. It delivers transparent, evidence-backed news with confidence scoring, dynamic visualizations, and educational tools.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.10+-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)

---

## Demo


[Watch the demo video](https://drive.google.com/file/d/1Nu7_vjWl9rL7-LUKseB-vKBKcQpN2PT1/view?usp=sharing)


![ClarifAI - Problem vs Solution](./clarifai-sol.png)

---

## Solution Architecture

![ClarifAI Solution Architecture](./sol-architecture.png)

---

## Features

### A. Core News Experience

#### 1. Daily Fact-Checked News Feed
- Top global and local stories presented without opinions or exaggeration
- Each article shows a **transparency index** and **confidence score**
- Breaking news indicators and risk assessment scoring

#### 2. Source-Backed Evidence Layer
- All statements include citations from verified sources
- One-tap view of supporting articles, datasets, and reports
- Source credibility scoring with historical tracking

#### 3. Claim Comparison View
- Side-by-side analysis of contradictory claims
- Evidence breakdown showing which claim is better supported and why
- Visual indicators for verified, conflicting, or false claims

#### 4. Dynamic Data Visualization
- Automatically generated graphs showing how events evolved over time
- Visual storylines connecting entities, events, and sources
- Interactive **Narrative Graph** with real-time streaming updates

#### 5. Context Cards (Who, What, When, Why)
- Short context summaries for every major event
- Perfect for quick understanding of complex topics
- Risk score assessment for misinformation potential

---

### B. Search & Deep Dive Engine

#### 6. Intelligent Topic Search
- Any topic can be explored with automatically aggregated, ranked, and verified information
- Topic pages persist for public discovery and contribute to collective knowledge
- Advanced filtering and categorization

#### 7. RAG-powered Chat Assistant
- Conversational fact lookup with source citations
- Users can ask follow-up questions for deeper clarification
- **Confidence scoring** for every answer
- Context-aware responses based on verified data

#### 8. Custom AI-Generated Video Explainers
- **3D Avatar News Anchor** with real-time lip-sync
- Professional broadcast-quality presentations
- Multiple voices (male/female, US/UK accents)
- Downloadable and shareable for social platforms
- JSON-based script control with mood, gestures, and camera views

---

### C. Learning & Research Tools

#### 9. Researcher Mode
- **Interactive Research Knowledge Graph** visualization
- Real-time streaming graph generation
- Downloadable detailed reports with graphs, timelines, citations, and source networks
- Exportable in Markdown and PDF-ready formats
- Configurable research depth (quick, standard, comprehensive)

#### 10. Academic Citation Styles
- Auto-formatted sources (APA, MLA, etc.)
- Full bibliography generation
- Source reliability ratings (HIGH, MEDIUM, LOW)

#### 11. Flashcard Learning System
- AI-generated flashcards on any topic
- Summarized current affairs lessons with fact-checking
- Personalized recall and revision history
- Difficulty levels: Beginner, Intermediate, Advanced
- **Complete Study Guides** with:
  - Key concepts and explanations
  - Glossary of terms
  - Common misconceptions and corrections
  - Practice questions
  - Study strategies and resources

---

### D. Community and Personalization

#### 12. Custom News Feed
- Topic or domain-focused personalized news
- Interest tracking without bias injection
- Category filtering (Politics, Technology, Science, Sports, etc.)

#### 13. Public Topic Repository
- Crowd-requested topics remain publicly accessible
- Contribution score for community engagement
- Trending topics identification

---

### E. API Platform for Businesses

#### 14. Fact-Verification API
- Third-party sites can call ClarifAI to validate claims in real-time
- RESTful endpoints with comprehensive documentation
- Health checks and system statistics

#### 15. Data & Graph Generation API
- Provide structured data, source networks, and confidence scoring
- Narrative graph streaming via Server-Sent Events (SSE)
- Research graph generation with citation tracking

#### 16. AI-Video and Summary API
- Apps and publishers generate videos or text summaries via API
- Customizable tone, duration, and presentation style
- Script generation with source citations

---

## Tech Stack

### Backend
- **FastAPI** - High-performance Python API framework
- **Neo4j** - Graph database for relationship mapping
- **Gemini AI** - Advanced language model for analysis
- **Google News API** - Real-time news aggregation
- **Google Fact Check API** - Verified fact-checking integration

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **React Flow** - Interactive graph rendering
- **Three.js** - 3D avatar rendering
- **Force Graph** - Knowledge graph visualization

### AI News Anchor
- **TalkingHead** - 3D avatar lip-sync
- **HeadTTS** - Neural text-to-speech with visemes
- **Ready Player Me** - Avatar creation and customization
- **WebGPU** - Hardware-accelerated rendering

---

## Project Structure

```
clarifai/
├── clarifai-backend/           # FastAPI Backend
│   ├── app/
│   │   ├── main.py            # Application entry point
│   │   ├── config.py          # Configuration settings
│   │   ├── routers/           # API endpoints
│   │   │   ├── topics.py      # Topic management
│   │   │   ├── claims.py      # Claim verification
│   │   │   ├── sources.py     # Source tracking
│   │   │   ├── graph.py       # Knowledge graph
│   │   │   ├── anchor.py      # AI anchor scripts
│   │   │   ├── research.py    # Research tools
│   │   │   ├── daily.py       # Daily digest
│   │   │   └── education.py   # Learning tools
│   │   └── services/          # Business logic
│   │       ├── news_service.py
│   │       ├── analysis_service.py
│   │       ├── graph_service.py
│   │       ├── narrative_service.py
│   │       ├── research_service.py
│   │       └── education_service.py
│   └── requirements.txt
│
├── clarifai-frontend/          # Next.js Frontend
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   └── (app)/
│   │   │       ├── dashboard/ # Main dashboard
│   │   │       ├── news/      # News feed
│   │   │       ├── daily/     # Daily digest
│   │   │       ├── search/    # Topic search
│   │   │       ├── chat/      # AI chat
│   │   │       ├── anchor/    # AI news anchor
│   │   │       ├── narrative/ # Narrative graph
│   │   │       ├── research/  # Research hub
│   │   │       ├── education/ # Learning tools
│   │   │       └── analytics/ # Analytics
│   │   ├── components/        # React components
│   │   │   ├── ui/           # UI primitives
│   │   │   ├── layout/       # Layout components
│   │   │   ├── graphs/       # Graph visualizations
│   │   │   ├── education/    # Flashcards, study guides
│   │   │   └── daily/        # Swipeable cards, video reels
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Utilities and API client
│   └── package.json
│
├── js/                        # AI Anchor application
│   ├── app.js                # Main application logic
│   └── config.js             # Avatar configuration
├── avatars/                   # 3D avatar GLB files
├── backgrounds/               # Newsroom backgrounds
├── scripts/                   # JSON broadcast scripts
└── index.html                # AI Anchor interface
```

---

## Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Neo4j Database (optional, for graph features)

### Backend Setup

```bash
cd clarifai-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GEMINI_API_KEY=your_gemini_api_key
export GOOGLE_FACT_CHECK_API_KEY=your_api_key
export NEO4J_URI=bolt://localhost:7687
export NEO4J_USER=neo4j
export NEO4J_PASSWORD=your_password

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd clarifai-frontend

# Install dependencies
npm install

# Set environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev
```

### AI News Anchor

```bash
# From root directory
python -m http.server 8080

# Open http://localhost:8080 in browser
```

---

## API Endpoints

### Topics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/topics` | List trending topics with risk scores |
| GET | `/topics/{id}` | Get topic details |
| POST | `/topics/analyze` | Analyze topics for misinformation |

### Claims
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/claims` | List recent claims |
| POST | `/claims/verify` | Verify a specific claim |
| GET | `/claims/fact-checks` | Get fact-checks from trusted sources |

### Graph
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/graph/nodes` | Get knowledge graph nodes |
| GET | `/graph/stats` | Graph statistics |
| GET | `/graph/narrative` | Get narrative graph for topic |
| GET | `/graph/narrative/stream` | Stream narrative graph (SSE) |

### Research
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/research/analyze` | Generate research knowledge graph |
| GET | `/research/analyze/stream` | Stream research analysis (SSE) |
| POST | `/research/report` | Generate markdown report |
| GET | `/research/report/download` | Download report as file |

### Education
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/education/flashcards/generate` | Generate flashcard deck |
| GET | `/education/flashcards/stream` | Stream flashcard generation (SSE) |
| POST | `/education/study-guide/generate` | Generate study guide |
| GET | `/education/study-guide/download` | Download study guide |
| POST | `/education/complete-package` | Generate flashcards + study guide |

### AI Anchor
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/anchor/generate` | Generate broadcast script |
| GET | `/anchor/preview` | Preview anchor script |

---

## Business Model

### General Public (B2C)

**Free Tier**
- Limited daily fact-checks
- Basic news feed with ads
- Standard graphs and summaries

**Premium Subscription**
- No ads
- Unlimited fact-checks and topic searches
- Full source transparency pages
- Video generation access
- Personalized learning and flashcard packs
- Early access to new features

### Researchers / Students (B2B2C Academic)

**Academic Subscription**
- Institution-based licensing
- Bulk user accounts for universities
- Unlimited report downloads
- API tokens for academic research
- Data exports for publications
- Educational grants and student discounts

### APIs for Third-Party Platforms (B2B)

**API Pricing Model**
- Usage-based token pricing for fact-verification calls
- Tiered plans: Starter / Pro / Enterprise
- On-premise deployment for sensitive government domains
- SLA guarantees for enterprise clients

---

## Differentiators

- **Confidence Scoring** - Transparent evidence everywhere with quantified trust metrics
- **Automatic Data Visualization** - Any claim or topic gets visual representation
- **Persistent Topic Pages** - Building a global fact knowledge graph
- **AI-Generated Video Explainers** - Professional news presentations backed by real citations
- **Dual Audience Focus** - Serves everyday news consumers AND research professionals
- **Real-time Streaming** - Live graph building and analysis updates via SSE
- **Educational Integration** - Learn while staying informed with flashcards and study guides

---

## AI News Anchor Features

The integrated 3D AI News Anchor provides:

- **3D Avatar System** - Ready Player Me compatible with facial expressions
- **Real-time Lip-sync** - HeadTTS neural voices with automatic Oculus Visemes
- **JSON Script Control** - Automate broadcasts with structured scripts
- **Multiple TTS Voices** - US/UK male and female neural voices
- **Dynamic Camera Views** - Full body, upper body, mid shot, head close-up
- **Mood & Gestures** - Control avatar emotions and hand gestures
- **Video Recording** - Record broadcasts as WebM video

### Available Voices

| ID | Name | Gender |
|----|------|--------|
| af_bella | Bella | Female US |
| af_nicole | Nicole | Female US |
| am_adam | Adam | Male US |
| am_michael | Michael | Male US |
| bf_emma | Emma | Female UK |
| bm_george | George | Male UK |

---

## Go-to-Market Strategy

### Phase 1: Consumer Adoption
- Mobile app launch with clean, credible news feed
- Viral hooks via shareable AI-generated videos
- University outreach for learners and student influencers

### Phase 2: Trust & Authority Building
- Partnerships with journalism schools, NGOs, and media literacy groups
- Transparency reports published regularly

### Phase 3: Enterprise + API Growth
- Integrate with newsrooms, fact-checking agencies, content moderation teams
- Provide Compliance Reports for high-risk misinformation segments

---

## License

MIT License - Feel free to use for personal and commercial projects.

---

## Credits

- [TalkingHead](https://github.com/met4citizen/TalkingHead) - 3D avatar lip-sync
- [HeadTTS](https://github.com/met4citizen/HeadTTS) - Neural TTS with visemes
- [Ready Player Me](https://readyplayer.me/) - Free avatar creation
- [Three.js](https://threejs.org/) - 3D rendering
- [Neo4j](https://neo4j.com/) - Graph database
- [Google Gemini](https://ai.google.dev/) - AI language model

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with transparency and trust in mind.**
