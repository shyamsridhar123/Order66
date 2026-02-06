# Nodus - Multi-Agent Orchestration Platform

## Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.14 | Runtime |
| **FastAPI** | 0.115.0 | REST API framework |
| **Uvicorn** | - | ASGI server |
| **SQLAlchemy** | 2.x | ORM with async support |
| **SQLite** | - | Database (via aiosqlite) |
| **Ollama** | - | Local LLM inference |
| **qwen2.5:7b** | - | Chat/completion model |
| **nomic-embed-text** | - | Embedding model for RAG |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2.5 | React framework |
| **React** | 18 | UI library |
| **TypeScript** | 5 | Type safety |
| **Tailwind CSS** | 3.4 | Styling |
| **Zustand** | 4.x | State management |
| **Lucide React** | - | Icons |

---

## Prerequisites

1. **Python 3.11+** installed
2. **Node.js 18+** installed
3. **Ollama** installed and running locally

### Install Ollama Models
```bash
# Install Ollama (if not already)
curl -fsSL https://ollama.com/install.sh | sh

# Pull required models
ollama pull qwen2.5:7b
ollama pull nomic-embed-text

# Verify Ollama is running
curl http://localhost:11434/api/tags
```

---

## Running the Application

### 1. Start Ollama (if not running)
```bash
ollama serve
```

### 2. Start Backend

**Full command (recommended):**
```bash
cd /home/blazingbeard/Documents/projects/MAF/Order66-main/backend && /home/blazingbeard/Documents/projects/MAF/Order66-main/backend/venv/bin/uvicorn app.main:app --reload --port 8000
```

**For Fish Shell (must run from backend directory):**
```bash
cd /home/blazingbeard/Documents/projects/MAF/Order66-main/backend

# Run with full path to venv uvicorn (works reliably in fish)
/home/blazingbeard/Documents/projects/MAF/Order66-main/backend/venv/bin/uvicorn app.main:app --reload --port 8000
```

**For Bash/Zsh:**
```bash
cd backend

# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies (first time only)
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 3. Start Frontend

**Full command (recommended):**
```bash
cd /home/blazingbeard/Documents/projects/MAF/Order66-main/frontend && npm run dev
```

**Or step by step:**
```bash
cd frontend

# Install dependencies (first time only)
npm install

# Run development server
npm run dev
```

Frontend runs at: http://localhost:3000 (or 3001/3002 if port is in use)

---

## Environment Configuration

### Backend (.env file in /backend)
```env
# Default LLM Configuration (Ollama)
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_API_KEY=ollama

# Models (can be overridden via Admin UI)
LLM_CHAT_MODEL=qwen2.5:7b
LLM_EMBEDDING_MODEL=nomic-embed-text

# Optional: OpenAI Configuration
# OPENAI_API_KEY=sk-...

# Optional: Azure OpenAI Configuration
# AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
# AZURE_OPENAI_KEY=...
# AZURE_OPENAI_DEPLOYMENT=gpt-4o

# Database
DATABASE_URL=sqlite+aiosqlite:///./data/nodus.db

# Application
APP_ENV=development
APP_DEBUG=true
```

### Frontend (.env.local file in /frontend)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Project Structure

```
Order66-main/
├── backend/
│   ├── app/
│   │   ├── agents/           # AI Agent implementations
│   │   │   ├── orchestrator.py   # Main coordinator
│   │   │   ├── strategist.py     # Proposal strategy
│   │   │   ├── researcher.py     # Research & data gathering
│   │   │   ├── analyst.py        # Data analysis
│   │   │   ├── advisor.py        # Recommendations
│   │   │   ├── scribe.py         # Document generation
│   │   │   └── memory.py         # RAG & knowledge retrieval
│   │   ├── api/
│   │   │   └── routes/       # API endpoints
│   │   ├── models/           # Database models & schemas
│   │   ├── services/         # Business logic services
│   │   ├── tools/            # Agent tool definitions
│   │   │   ├── registry.py       # Central tool registry
│   │   │   ├── executor.py       # Tool execution utilities
│   │   │   ├── researcher_tools.py
│   │   │   ├── analyst_tools.py
│   │   │   ├── scribe_tools.py
│   │   │   ├── memory_tools.py
│   │   │   └── advisor_tools.py
│   │   └── main.py           # FastAPI entry point
│   ├── data/                 # SQLite database
│   ├── requirements.txt
│   └── venv/                 # Python virtual environment
│
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js pages
│   │   │   ├── page.tsx          # Main chat page
│   │   │   ├── knowledge/        # Knowledge management
│   │   │   ├── admin/            # Agent settings
│   │   │   └── monitoring/       # Metrics dashboard
│   │   ├── components/       # React components
│   │   │   ├── Header.tsx
│   │   │   ├── CopilotChat.tsx
│   │   │   ├── AgentVisualization.tsx
│   │   │   ├── InsightPanel.tsx
│   │   │   ├── ToolCallVisualization.tsx
│   │   │   └── ThemeToggle.tsx
│   │   └── lib/              # State stores & utilities
│   │       ├── store.ts          # Main app state
│   │       ├── toolStore.ts      # Tool tracking state
│   │       └── knowledgeStore.ts # Knowledge state
│   ├── tailwind.config.ts
│   └── package.json
│
└── docs/                     # Documentation
    ├── PRD.md                # Product requirements
    └── TRD.md                # Technical design
```

---

## Features

### Main Pages
| Page | URL | Description |
|------|-----|-------------|
| **Chat** | `/` | Main Copilot interface with agent visualization |
| **Knowledge** | `/knowledge` | Manage RAG embeddings per agent |
| **Admin** | `/admin` | Configure agents and LLM providers |
| **Monitoring** | `/monitoring` | View agent metrics & status |

### Debug Mode

Type `--debug` in the chat input to toggle debug mode. When enabled:

- A **Debug** badge appears in the chat header
- After each response, a detailed debug panel shows:

| Section | Information |
|---------|-------------|
| **Performance Stats** | Total duration, API latency, agent count, tool count |
| **Intent Analysis** | Primary intent, extracted entities, task description |
| **Agent Execution** | Which agents ran and in what order |
| **Tool Calls** | Each tool called, parameters, execution time, results |
| **Timing Breakdown** | Request start/end times, visual timeline |

**Commands:**
```
--debug     Toggle debug mode on/off
```

### Incognito Mode (Local LLM Indicator)

The header displays a privacy indicator showing your current LLM mode:

| Indicator | Color | Meaning |
|-----------|-------|---------|
| 🛡️ **Local** | Green | Data stays on your machine (Ollama) |
| ☁️ **Cloud** | Amber | Data sent to external API (OpenAI, Azure) |

### LLM Provider Configuration

Navigate to **Admin → LLM Providers** tab to configure:

1. **Ollama (Local)** - Default, runs on your machine
2. **OpenAI** - Cloud API (requires API key)
3. **Azure OpenAI** - Enterprise cloud (requires endpoint + key)
4. **Custom** - Any OpenAI-compatible endpoint

### Per-Agent LLM Configuration

Each agent can have its own LLM model. Navigate to **Admin → Agents** and expand any agent to configure:

| Setting | Description |
|---------|-------------|
| **Provider** | Override global provider (or use default) |
| **Model** | Specific model for this agent (e.g., `phi3.5` for Scribe) |
| **Temperature** | Creativity level (lower = more precise) |
| **Max Tokens** | Maximum response length |

**Recommended Models per Agent:**

| Agent | Recommended Model | Reason |
|-------|-------------------|--------|
| **Orchestrator** | `qwen2.5:7b` | Needs good reasoning for intent |
| **Strategist** | `mistral` | Long-form proposal writing |
| **Researcher** | `qwen2.5:7b` | Balanced speed/quality |
| **Analyst** | `qwen2.5:7b` | Quantitative precision |
| **Scribe** | `phi3.5` ⭐ | Best for document formatting |
| **Advisor** | `mistral` | Executive communication |
| **Memory** | `qwen2.5:3b` | Fast retrieval synthesis |

**Mode Restrictions:**
- 🛡️ **Local Mode**: Only local providers available per-agent
- ☁️ **Cloud Mode**: Both local and cloud providers available

### Agent Roles
| Agent | Purpose |
|-------|---------|
| **Orchestrator** | Routes intent, coordinates agents, governs workflow |
| **Strategist** | Frames objectives, creates proposals |
| **Researcher** | Retrieves data from web, news, company intel |
| **Analyst** | Synthesizes signals, generates insights |
| **Advisor** | Produces recommendations with rationale |
| **Scribe** | Captures summaries, generates documents |
| **Memory** | RAG retrieval, historical context |

---

## Agent Tools

Each agent has access to specialized tools that provide structured data and capabilities. Tools are executed with mock data for demo purposes but showcase the intent and tooling pattern.

### Tool Categories

| Category | Description | Example Tools |
|----------|-------------|---------------|
| **Research** | Data gathering from external sources | `search_clinical_trials`, `get_company_profile` |
| **Analysis** | Financial modeling and metrics | `calculate_market_size`, `run_dcf_model` |
| **Document** | Document generation and formatting | `apply_template`, `create_comparison_table` |
| **Knowledge** | RAG and knowledge retrieval | `semantic_search`, `find_similar_engagements` |
| **Communication** | Client communications | `generate_talking_points`, `assess_risks` |

### Tools by Agent

#### Researcher Tools (6)
| Tool | Description |
|------|-------------|
| `search_clinical_trials` | Search ClinicalTrials.gov for trials |
| `get_fda_filings` | Retrieve FDA submission data |
| `search_pubmed` | Search medical literature |
| `get_company_profile` | Get company data (Pfizer, etc.) |
| `search_news` | Find recent news articles |
| `get_competitor_landscape` | Analyze competitive positioning |

#### Analyst Tools (6)
| Tool | Description |
|------|-------------|
| `calculate_market_size` | Calculate TAM/SAM/SOM |
| `run_dcf_model` | Run DCF valuation model |
| `benchmark_metrics` | Compare key metrics across companies |
| `forecast_revenue` | Project future revenue |
| `analyze_pipeline_value` | Calculate pipeline NPV |
| `generate_chart_data` | Create visualization data |

#### Scribe Tools (5)
| Tool | Description |
|------|-------------|
| `apply_template` | Apply document template (brief, assessment, etc.) |
| `generate_executive_summary` | Create exec summary |
| `create_comparison_table` | Build comparison tables |
| `format_citations` | Format references |
| `generate_appendix` | Create appendix section |

#### Memory Tools (5)
| Tool | Description |
|------|-------------|
| `semantic_search` | Search knowledge base |
| `find_similar_engagements` | Find past projects |
| `get_framework` | Retrieve methodology framework |
| `search_expertise` | Find subject matter experts |
| `get_history` | Get historical context |

#### Advisor Tools (6)
| Tool | Description |
|------|-------------|
| `generate_talking_points` | Create key messages |
| `assess_risks` | Evaluate risks and mitigations |
| `create_recommendation` | Formulate structured advice |
| `draft_email` | Write professional communication |
| `summarize_for_executive` | Create executive brief |
| `prepare_board_materials` | Prepare board presentation |

### Tool API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tools` | GET | List all tools (filter by `?agent=name`) |
| `/api/tools/agent/{agent}` | GET | Get tools for specific agent |
| `/api/tools/execute` | POST | Execute a tool with parameters |
| `/api/tools/categories` | GET | List tool categories |

### Tool Visualization

Tool calls are visualized in real-time in the Agent Visualization panel:
- **🔧 Calling** - Blue pulsing indicator when tool is executing
- **✓ Completed** - Green indicator with execution time

Navigate to **Admin → Tools** to browse and test all available tools.

---

## API Endpoints

### Chat
- `POST /api/chat/conversations/{id}/messages` - Send message

### Knowledge
- `GET /api/knowledge` - List knowledge items
- `POST /api/knowledge` - Create knowledge item
- `PUT /api/knowledge/{id}` - Update knowledge item
- `DELETE /api/knowledge/{id}` - Delete knowledge item

### Documents
- `GET /api/documents` - List documents
- `GET /api/documents/{id}` - Get document

### Config
- `GET /api/config/llm` - Get current LLM configuration
- `POST /api/config/llm` - Update LLM provider settings

---

## Troubleshooting

### CORS Errors
If you see "NetworkError when attempting to fetch resource", check that the frontend port is in the backend's allowed origins:

Edit `backend/app/config.py`:
```python
allowed_origins: list[str] = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:3002",  # Add your port
]
```

### Database Schema Changes
If you add new columns to models, delete the database and restart:
```bash
rm backend/data/nodus.db
# Restart backend - it will recreate tables
```

### Ollama Not Responding
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start it
ollama serve
```

### Port Already in Use
```bash
# Kill process on port
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Frontend
```

---

## Switching LLM Providers

### Via Admin UI (Recommended)
1. Navigate to http://localhost:3000/admin
2. Click the **LLM Providers** tab
3. Click on a provider card to activate it
4. For cloud providers, click the gear icon to enter your API key
5. Click **Save & Apply**

The header will update to show either:
- 🛡️ **Local** (green) - Ollama or local endpoint
- ☁️ **Cloud** (amber) - OpenAI, Azure, or external API

### Via Environment Variables
Edit `backend/.env` and restart the backend:

```bash
# For OpenAI
OLLAMA_BASE_URL=https://api.openai.com/v1
OLLAMA_API_KEY=sk-your-key-here
LLM_CHAT_MODEL=gpt-4o
LLM_EMBEDDING_MODEL=text-embedding-3-small

# For Azure OpenAI
OLLAMA_BASE_URL=https://your-resource.openai.azure.com/openai/deployments/gpt-4o
OLLAMA_API_KEY=your-azure-key
LLM_CHAT_MODEL=gpt-4o
LLM_EMBEDDING_MODEL=text-embedding-3-small
```

---

## Dark Mode

Click the sun/moon toggle in the header to switch between light and dark themes. The preference is saved to localStorage.

---

## Development Notes

- Backend auto-reloads on file changes (--reload flag)
- Frontend uses Next.js hot module replacement
- Database is SQLite stored in `backend/data/nodus.db`
- All LLM calls go through Ollama locally (no cloud API needed)
