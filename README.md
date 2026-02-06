# Nodus

## 🤖 Multi-Agent AI Orchestration Platform

> **Your AI-Powered Consulting Team** — Coordinated AI agents that deliver enterprise-grade outputs in minutes, not days.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Ollama](https://img.shields.io/badge/Ollama-Local_LLM-white?logo=ollama)

---

## 🎯 What is Nodus?

Nodus deploys a coordinated team of **7 specialized AI agents** that mirror a consulting firm's operating model. Built on the **Microsoft Agent Framework**, it enables:

- ⚡ **5-minute competitive briefs** (vs. 4-8 hours manual)
- 📊 **Real-time agent coordination** with live visualization
- 🔒 **Privacy-first** — run entirely local with Ollama or use Azure OpenAI
- 🛠️ **28 pre-built tools** for research, analysis, and document generation

```
┌─────────────────────────────────────────────────────┐
│           MICROSOFT AGENT FRAMEWORK                 │
├─────────────────────────────────────────────────────┤
│                  ORCHESTRATOR                       │
│            "The Managing Director"                  │
├─────────┬─────────┬─────────┬─────────┬────────────┤
│Strategist│Researcher│ Analyst │ Advisor │ Scribe    │
│   💡    │    🔍   │   📊   │   💬   │   ✍️       │
└─────────┴─────────┴─────────┴─────────┴────────────┘
```

---

## 🚀 Quick Start

### One-Command Demo

```bash
# Clone and start
git clone <repo>
cd nodus

# Option 1: Use the demo script (recommended)
chmod +x demo.sh
./demo.sh start

# Option 2: Docker
docker-compose up
```

**Access the app at:** http://localhost:3000

### Manual Setup

#### Prerequisites
- Python 3.11+
- Node.js 18+ (with pnpm)
- Ollama (for local mode) or Azure OpenAI API key

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
pnpm install
pnpm dev -H 0.0.0.0
```

### 📽️ Presentation Mode

Run the interactive slide presentation:

```bash
cd docs
pip install flask markdown
python presentation_server.py
```

**Open:** http://localhost:5000

See [docs/PRESENTATION.md](docs/PRESENTATION.md) for the full presentation content with speaker notes.

---

## 🤖 The Agent Team

| Agent | Role | Superpower |
|-------|------|------------|
| 🎯 **Orchestrator** | Task Decomposition | Knows which expert to call |
| 💡 **Strategist** | Engagement Scoping | Frames problems like McKinsey |
| 🔍 **Researcher** | Intelligence Gathering | 28+ research tools |
| 📊 **Analyst** | Data Analysis | Charts, models, benchmarks |
| 💬 **Advisor** | Client Communications | Executive-ready summaries |
| ✍️ **Scribe** | Document Generation | Branded, formatted output |
| 🧠 **Memory** | Knowledge Management | RAG-powered context retrieval |

---

## ✨ Key Features

### 🎭 Real-Time Agent Orchestra
- Live agent status cards with working indicators
- Tool execution tracking per agent
- Coordinated workflow visualization
- See every agent's thought process

### 🐛 Debug Mode
Type `--debug` in any prompt to unlock:
- **Agent Traces** — Full reasoning chains
- **Tool Calls** — Parameters and results
- **Timing Metrics** — Performance breakdown
- **Token Usage** — LLM consumption stats

### 🔧 Tool Registry (28 Built-in Tools)

**Research Tools:**
`search_web` • `search_news` • `search_clinical_trials` • `get_company_profile` • `get_competitor_landscape` • `search_patents` • `search_academic`

**Analysis Tools:**
`generate_chart` • `calculate_metrics` • `run_benchmark` • `financial_model`

**Document Tools:**
`generate_document` • `format_proposal` • `create_presentation`

**Knowledge Tools:**
`semantic_search` • `find_similar_engagements` • `retrieve_context`

### ⚙️ Admin Console (`/admin`)
- Enable/disable agents
- Custom system prompts per agent
- Per-agent LLM model selection
- Temperature and token limits
- Tool toggle per agent
- Test tools with parameters

### 🔒 Privacy-First Architecture
- **Local Mode:** Run entirely on-premise with Ollama
- **Cloud Mode:** Azure OpenAI for enterprise scale
- **One-click toggle** between modes
- No data leaves your infrastructure in local mode
- PII auto-obfuscation in debug logs

### 📊 Monitoring Dashboard (`/monitoring`)
- Real-time agent metrics
- Request/response tracking
- Token usage analytics
- Error rate monitoring
- Live activity feed

### 💬 Conversation History
- Auto-save all conversations
- Full state restoration including debug info
- Export/import JSON
- Search past conversations

### 👍 Feedback System
- Thumbs up/down on every response
- Optional comments
- Stored per message for analytics
- Enables quality tracking and improvement

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Shadcn/ui** | Component library |
| **Zustand** | Lightweight state management |
| **WebSocket** | Real-time agent updates |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance async API |
| **Python 3.11+** | Latest runtime features |
| **SQLAlchemy 2.x** | Async ORM |
| **SQLite + aiosqlite** | Zero-config persistence |
| **Ollama** | Local LLM inference |
| **Azure OpenAI** | Cloud LLM provider |

### Architecture
```
┌──────────────────────────────────────────────────────────┐
│                     FRONTEND                              │
│  Next.js 14 • React 18 • TypeScript • Tailwind • Zustand │
└────────────────────────┬─────────────────────────────────┘
                         │ REST + WebSocket
┌────────────────────────▼─────────────────────────────────┐
│                      BACKEND                              │
│      FastAPI • Python 3.11 • SQLAlchemy • aiosqlite      │
├──────────────────────────────────────────────────────────┤
│              MICROSOFT AGENT FRAMEWORK                    │
│   Orchestrator → Parallel Agent Execution → Synthesis    │
├──────────────────────────────────────────────────────────┤
│                    LLM LAYER                              │
│         Ollama (Local) ←→ Azure OpenAI (Cloud)           │
└──────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
nodus/
├── docs/
│   ├── PRESENTATION.md     # 📽️ Full slide deck (run with presentation_server.py)
│   ├── presentation_server.py  # Flask server for slides
│   ├── API.md              # Complete API documentation
│   ├── PRD.md              # Product Requirements Document
│   ├── TRD.md              # Technical Requirements Document
│   └── DEMO_PLAN.md        # Demo scenarios and walkthrough
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/            # App router pages
│   │   │   ├── admin/      # Agent & LLM configuration
│   │   │   ├── debug/      # Debug console
│   │   │   ├── knowledge/  # Knowledge base management
│   │   │   └── monitoring/ # Agent metrics dashboard
│   │   ├── components/     # React components
│   │   └── lib/            # Stores, utilities, WebSocket
│   └── package.json
├── backend/                # FastAPI application
│   ├── app/
│   │   ├── agents/         # 7 AI agents
│   │   ├── api/            # REST endpoints + WebSocket
│   │   ├── models/         # Database models & schemas
│   │   ├── services/       # LLM, documents, knowledge
│   │   └── tools/          # 28 agent tools
│   ├── tests/              # Pytest test suite
│   └── requirements.txt
├── demo.sh                 # 🚀 One-command demo script
└── README.md
```

---

## 🌐 Pages & Routes

| Page | Route | Description |
|------|-------|-------------|
| **Chat** | `/` | Main multi-agent conversation interface |
| **Admin** | `/admin` | Agent configuration, LLM settings, tool management |
| **Knowledge** | `/knowledge` | RAG knowledge base management |
| **Monitoring** | `/monitoring` | Real-time agent metrics dashboard |
| **Debug** | `/debug` | Enterprise logging & feedback console |

---

## 📊 Demo Scenarios

Try these prompts to see the agents in action:

1. **Quick Research**
   > "What are the latest developments in CAR-T therapy?"

2. **Competitive Analysis**
   > "Analyze Pfizer vs Merck in oncology"

3. **Proposal Generation**
   > "Draft a proposal for digital transformation consulting"

4. **Debug Mode**
   > "--debug Research Tesla's EV strategy"

---

## ⏱️ ROI Impact

| Task | Before Nodus | After Nodus |
|------|--------------|-------------|
| Research Brief | 4-8 hours | **5 minutes** |
| Proposal Draft | 2-3 days | **15 minutes** |
| Competitive Analysis | 1-2 days | **10 minutes** |

**80% Time Reduction • Consistent Quality • Infinite Scale**

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/conversations` | GET/POST | List or create conversations |
| `/api/chat/conversations/{id}/messages` | GET/POST | Get or send messages |
| `/api/proposals/generate` | POST | Generate new proposal |
| `/api/research/query` | POST | Execute research query |
| `/api/knowledge/search` | POST | Semantic search knowledge base |
| `/api/tools` | GET | List all available tools |
| `/api/tools/execute` | POST | Execute a tool manually |
| `/api/config/llm` | GET/POST | LLM provider configuration |
| `/ws/agents/{conversation_id}` | WS | Real-time agent updates |

Full API docs at `/docs` when running, or see [docs/API.md](docs/API.md).

---

## 🧪 Testing

```bash
cd backend
pytest                      # Run all tests
pytest -v                   # Verbose output
pytest tests/test_chat.py   # Specific test file
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [PRESENTATION.md](docs/PRESENTATION.md) | 📽️ Full slide presentation (use with presentation_server.py) |
| [API.md](docs/API.md) | Complete REST & WebSocket API reference |
| [PRD.md](docs/PRD.md) | Product requirements, user stories, success criteria |
| [TRD.md](docs/TRD.md) | Technical architecture and implementation details |
| [DEMO_PLAN.md](docs/DEMO_PLAN.md) | Demo scenarios and walkthrough guide |

---

## 🔧 Configuration

### Environment Variables

Create `.env` in the project root:

```env
# Local Mode (Ollama)
OLLAMA_BASE_URL=http://localhost:11434/v1
LLM_CHAT_MODEL=llama3.2:3b
LLM_EMBEDDING_MODEL=nomic-embed-text

# Cloud Mode (Azure OpenAI)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-4o

# Database
DATABASE_URL=sqlite+aiosqlite:///./data/nodus.db
```

### LAN Access

The demo script automatically binds to `0.0.0.0` for LAN access. Find your IP with `hostname -I` and access from other devices.

---

## 🗺️ Roadmap

- [x] Multi-agent orchestration
- [x] Real-time visualization
- [x] Tool registry system
- [x] Debug mode
- [x] Admin console
- [x] Local/Cloud LLM toggle
- [ ] Custom agent creation UI
- [ ] Workflow templates
- [ ] Team collaboration
- [ ] Enterprise SSO

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
