"""Memory Agent Tools - Knowledge retrieval and RAG tools."""

from datetime import datetime
from app.tools.registry import ToolRegistry, ToolDefinition, ToolCategory


def semantic_search(query: str, limit: int = 5) -> dict:
    """Perform semantic search over knowledge base."""
    
    # Mock semantic search results
    results = [
        {
            "id": "kb-001",
            "title": "Oncology Market Entry Framework",
            "content": "Framework for entering oncology markets including regulatory pathway selection, clinical development strategy, and commercial planning. Key considerations: tumor type selection, biomarker strategy, pricing and access.",
            "category": "framework",
            "relevance_score": 0.92,
            "tags": ["oncology", "market entry", "strategy"],
        },
        {
            "id": "kb-002",
            "title": "FDA Accelerated Approval Playbook",
            "content": "Comprehensive guide to obtaining FDA accelerated approval including surrogate endpoint selection, rolling submission strategy, and post-marketing commitments.",
            "category": "regulatory",
            "relevance_score": 0.87,
            "tags": ["FDA", "accelerated approval", "regulatory"],
        },
        {
            "id": "kb-003",
            "title": "Biopharma M&A Valuation Methods",
            "content": "Overview of valuation methodologies for biopharma transactions including rNPV, DCF, comparable transactions, and sum-of-the-parts analysis.",
            "category": "finance",
            "relevance_score": 0.81,
            "tags": ["M&A", "valuation", "finance"],
        },
    ]
    
    return {
        "query": query,
        "results": results[:limit],
        "total_matches": len(results),
        "search_type": "semantic",
        "embedding_model": "nomic-embed-text",
    }


def find_similar_engagements(query: str, limit: int = 3) -> dict:
    """Find similar past engagements."""
    
    # Mock engagement history
    engagements = [
        {
            "id": "eng-2024-087",
            "client": "Top 10 Pharma",
            "project": "Oncology Portfolio Strategy",
            "description": "Developed 5-year oncology portfolio strategy including pipeline prioritization, BD target identification, and commercial planning.",
            "outcome": "Client executed 2 acquisitions totaling $8B based on recommendations",
            "duration": "12 weeks",
            "team_size": 6,
            "frameworks_used": ["Portfolio Optimization", "Market Attractiveness"],
            "relevance_score": 0.89,
        },
        {
            "id": "eng-2024-052",
            "client": "Mid-Size Biotech",
            "project": "Market Access Strategy - Rare Disease",
            "description": "Developed pricing and market access strategy for rare disease launch including value story, payer engagement plan, and patient support program design.",
            "outcome": "Product launched successfully with 85% formulary coverage at target price",
            "duration": "8 weeks",
            "team_size": 4,
            "frameworks_used": ["Value Dossier", "Payer Archetype Analysis"],
            "relevance_score": 0.82,
        },
        {
            "id": "eng-2023-145",
            "client": "Global Pharma",
            "project": "Competitive Intelligence Program",
            "description": "Designed and implemented competitive intelligence program including monitoring systems, analysis frameworks, and organizational structure.",
            "outcome": "CI function established with 12 FTEs; cited as best-in-class by industry benchmarks",
            "duration": "16 weeks",
            "team_size": 5,
            "frameworks_used": ["CI Maturity Model", "War Gaming"],
            "relevance_score": 0.75,
        },
    ]
    
    return {
        "query": query,
        "engagements": engagements[:limit],
        "total_matches": len(engagements),
    }


def get_framework(framework_name: str) -> dict:
    """Retrieve a methodology framework."""
    
    frameworks = {
        "portfolio_optimization": {
            "name": "Portfolio Optimization Framework",
            "description": "Systematic approach to prioritizing R&D investments across a drug portfolio",
            "steps": [
                "1. Define strategic objectives and constraints",
                "2. Assess individual asset attractiveness (rNPV, strategic fit)",
                "3. Evaluate portfolio balance (phase, TA, risk profile)",
                "4. Model resource allocation scenarios",
                "5. Stress test against competitive/market scenarios",
                "6. Develop implementation roadmap",
            ],
            "key_tools": ["rNPV Calculator", "Portfolio Heat Map", "Scenario Planner"],
            "typical_duration": "8-12 weeks",
            "team_composition": ["Strategy Lead", "Financial Analyst", "Scientific Advisor"],
        },
        "market_assessment": {
            "name": "Market Assessment Framework",
            "description": "Comprehensive approach to sizing and characterizing a therapeutic market",
            "steps": [
                "1. Define market boundaries (indication, geography, time horizon)",
                "2. Epidemiology analysis (prevalence, incidence, diagnosed rates)",
                "3. Treatment flow mapping (current SOC, unmet need)",
                "4. Competitive landscape analysis",
                "5. Market sizing (TAM, SAM, SOM)",
                "6. Forecast development with scenario analysis",
            ],
            "key_tools": ["Epi Model", "Treatment Flow", "Competitive Matrix"],
            "typical_duration": "6-8 weeks",
            "team_composition": ["Market Research Lead", "Data Analyst", "Medical Advisor"],
        },
        "due_diligence": {
            "name": "Biopharma Due Diligence Framework",
            "description": "Structured approach to evaluating acquisition targets",
            "steps": [
                "1. Strategic rationale assessment",
                "2. Scientific/clinical due diligence",
                "3. Commercial assessment",
                "4. Financial analysis and valuation",
                "5. Risk identification and mitigation",
                "6. Integration planning",
                "7. Recommendation development",
            ],
            "key_tools": ["DD Checklist", "Valuation Model", "Risk Register"],
            "typical_duration": "4-8 weeks",
            "team_composition": ["Deal Lead", "Scientific Advisor", "Commercial Lead", "Finance"],
        },
        "default": {
            "name": framework_name,
            "description": "Custom framework",
            "steps": ["Define scope", "Gather data", "Analyze", "Synthesize", "Recommend"],
            "key_tools": [],
            "typical_duration": "4-6 weeks",
        },
    }
    
    framework = frameworks.get(framework_name.lower().replace(" ", "_"), frameworks["default"])
    
    return {
        "framework": framework,
        "retrieved_at": datetime.now().isoformat(),
    }


def search_expertise(skill: str, available_only: bool = True) -> dict:
    """Search for internal subject matter experts."""
    
    # Mock SME database
    experts = [
        {
            "name": "Dr. Sarah Chen",
            "title": "Partner, Life Sciences",
            "expertise": ["Oncology", "Clinical Development", "Regulatory Strategy"],
            "experience_years": 18,
            "notable_projects": ["Led $5B acquisition DD", "Oncology franchise strategy for Top 5 pharma"],
            "availability": "Available",
            "location": "Boston",
        },
        {
            "name": "Michael Torres",
            "title": "Principal, Commercial Strategy",
            "expertise": ["Market Access", "Pricing", "Launch Excellence"],
            "experience_years": 12,
            "notable_projects": ["Launched 3 blockbuster drugs", "Built market access capability for biotech"],
            "availability": "Partially Available",
            "location": "New York",
        },
        {
            "name": "Dr. Emily Watson",
            "title": "Senior Manager, R&D Strategy",
            "expertise": ["Portfolio Optimization", "Pipeline Valuation", "BD&L"],
            "experience_years": 8,
            "notable_projects": ["rNPV model development", "Pipeline prioritization for mid-cap"],
            "availability": "Available",
            "location": "San Francisco",
        },
    ]
    
    if available_only:
        experts = [e for e in experts if e["availability"] == "Available"]
    
    return {
        "skill_searched": skill,
        "experts": experts,
        "total_matches": len(experts),
        "filter_applied": "available_only" if available_only else "none",
    }


def get_history(topic: str, time_range: str = "2 years") -> dict:
    """Get historical context and trends for a topic."""
    
    return {
        "topic": topic,
        "time_range": time_range,
        "historical_context": {
            "key_events": [
                {"date": "2024-06", "event": "FDA approved 3 new ADCs, expanding addressable market"},
                {"date": "2024-03", "event": "Major acquisition reshapes competitive landscape"},
                {"date": "2023-09", "event": "New clinical data shifts treatment paradigm"},
            ],
            "trend_analysis": "Market has grown 12% annually with increasing consolidation among top players",
            "lessons_learned": [
                "Early mover advantage critical in biomarker-defined populations",
                "Combination strategies increasingly important",
                "Real-world evidence becoming key differentiator",
            ],
        },
    }


# ============================================================================
# TOOL DEFINITIONS
# ============================================================================

MEMORY_TOOLS = [
    {
        "name": "semantic_search",
        "description": "Perform semantic search over the knowledge base for relevant frameworks, methodologies, and content",
        "function": semantic_search,
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"},
                "limit": {"type": "integer", "description": "Maximum results to return"},
            },
            "required": ["query"],
        },
        "returns": {"type": "object", "description": "Search results with relevance scores"},
    },
    {
        "name": "find_similar_engagements",
        "description": "Find similar past client engagements and their outcomes",
        "function": find_similar_engagements,
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Description of current engagement"},
                "limit": {"type": "integer", "description": "Maximum results to return"},
            },
            "required": ["query"],
        },
        "returns": {"type": "object", "description": "Similar engagements with outcomes"},
    },
    {
        "name": "get_framework",
        "description": "Retrieve a specific methodology framework (portfolio_optimization, market_assessment, due_diligence)",
        "function": get_framework,
        "parameters": {
            "type": "object",
            "properties": {
                "framework_name": {"type": "string", "description": "Name of framework to retrieve"},
            },
            "required": ["framework_name"],
        },
        "returns": {"type": "object", "description": "Framework details and steps"},
    },
    {
        "name": "search_expertise",
        "description": "Search for internal subject matter experts by skill or domain",
        "function": search_expertise,
        "parameters": {
            "type": "object",
            "properties": {
                "skill": {"type": "string", "description": "Skill or expertise area to search"},
                "available_only": {"type": "boolean", "description": "Only return available experts"},
            },
            "required": ["skill"],
        },
        "returns": {"type": "object", "description": "Matching experts"},
    },
    {
        "name": "get_history",
        "description": "Get historical context and trends for a topic",
        "function": get_history,
        "parameters": {
            "type": "object",
            "properties": {
                "topic": {"type": "string", "description": "Topic to research"},
                "time_range": {"type": "string", "description": "Time range to cover"},
            },
            "required": ["topic"],
        },
        "returns": {"type": "object", "description": "Historical context and trends"},
    },
]


def register_memory_tools(registry: ToolRegistry) -> None:
    """Register all memory tools."""
    for tool_def in MEMORY_TOOLS:
        registry.register(ToolDefinition(
            name=tool_def["name"],
            description=tool_def["description"],
            category=ToolCategory.KNOWLEDGE,
            agent="memory",
            parameters=tool_def["parameters"],
            returns=tool_def["returns"],
            function=tool_def["function"],
            demo_latency_ms=500,
        ))
