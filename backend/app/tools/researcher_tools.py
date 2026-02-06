"""Researcher Agent Tools - Data gathering and research tools."""

import random
from datetime import datetime, timedelta
from app.tools.registry import ToolRegistry, ToolDefinition, ToolCategory


# ============================================================================
# MOCK DATA GENERATORS
# ============================================================================

def search_clinical_trials(query: str, phase: str = None, status: str = None) -> dict:
    """Search clinical trials database (mock ClinicalTrials.gov)."""
    
    # Mock trial data for life sciences demo
    mock_trials = [
        {
            "nct_id": "NCT04379596",
            "title": f"A Phase 3 Study of {query.split()[0] if query else 'Drug'} in Advanced Solid Tumors",
            "phase": phase or "Phase 3",
            "status": status or "Recruiting",
            "sponsor": "Pfizer Inc.",
            "conditions": ["Non-Small Cell Lung Cancer", "Solid Tumors"],
            "enrollment": 450,
            "start_date": "2024-03-15",
            "completion_date": "2026-12-01",
            "primary_endpoint": "Overall Survival (OS)",
            "locations": ["United States", "Europe", "Japan"],
        },
        {
            "nct_id": "NCT05128721",
            "title": f"Efficacy and Safety of {query.split()[0] if query else 'Compound'} Combination Therapy",
            "phase": phase or "Phase 2",
            "status": status or "Active, not recruiting",
            "sponsor": "Novartis Pharmaceuticals",
            "conditions": ["Breast Cancer", "HER2-positive"],
            "enrollment": 280,
            "start_date": "2023-09-01",
            "completion_date": "2025-06-30",
            "primary_endpoint": "Objective Response Rate (ORR)",
            "locations": ["United States", "Canada", "Germany"],
        },
        {
            "nct_id": "NCT05892341",
            "title": f"First-in-Human Study of {query.split()[-1] if query else 'Novel Agent'} Monotherapy",
            "phase": "Phase 1",
            "status": "Recruiting",
            "sponsor": "Roche/Genentech",
            "conditions": ["Advanced Malignancies"],
            "enrollment": 120,
            "start_date": "2024-01-10",
            "completion_date": "2025-12-15",
            "primary_endpoint": "Maximum Tolerated Dose (MTD)",
            "locations": ["United States"],
        },
    ]
    
    return {
        "query": query,
        "total_results": len(mock_trials),
        "trials": mock_trials,
        "source": "ClinicalTrials.gov",
        "retrieved_at": datetime.now().isoformat(),
    }


def get_fda_filings(company: str, filing_type: str = None) -> dict:
    """Get FDA regulatory filings for a company."""
    
    mock_filings = [
        {
            "filing_id": "NDA-215478",
            "type": "NDA",
            "drug_name": "Lorenzamab",
            "indication": "Non-Small Cell Lung Cancer",
            "submission_date": "2024-06-15",
            "pdufa_date": "2025-04-15",
            "status": "Under Review",
            "priority_review": True,
            "breakthrough_therapy": True,
        },
        {
            "filing_id": "BLA-761298",
            "type": "BLA",
            "drug_name": "Celimovir",
            "indication": "Chronic Hepatitis B",
            "submission_date": "2024-02-28",
            "pdufa_date": "2024-12-28",
            "status": "Approved",
            "approval_date": "2024-11-15",
            "priority_review": False,
            "breakthrough_therapy": False,
        },
        {
            "filing_id": "sNDA-208736-S015",
            "type": "sNDA",
            "drug_name": "Revlimid",
            "indication": "Multiple Myeloma - First Line",
            "submission_date": "2024-08-01",
            "pdufa_date": "2025-06-01",
            "status": "Under Review",
            "priority_review": False,
            "breakthrough_therapy": False,
        },
    ]
    
    return {
        "company": company,
        "total_filings": len(mock_filings),
        "filings": mock_filings,
        "source": "FDA Orange Book / Purple Book",
        "retrieved_at": datetime.now().isoformat(),
    }


def search_pubmed(query: str, max_results: int = 5) -> dict:
    """Search PubMed for scientific literature."""
    
    mock_articles = [
        {
            "pmid": "38472615",
            "title": f"Advances in {query}: A Systematic Review and Meta-Analysis",
            "authors": ["Chen J", "Smith RK", "Williams AB", "et al."],
            "journal": "Nature Medicine",
            "year": 2024,
            "doi": "10.1038/nm.2024.1234",
            "abstract": f"Background: Recent developments in {query} have shown promising results. Methods: We conducted a systematic review... Conclusions: Evidence supports the efficacy of novel approaches.",
            "citations": 45,
            "impact_factor": 82.9,
        },
        {
            "pmid": "38291847",
            "title": f"Clinical Outcomes of {query} in Real-World Settings",
            "authors": ["Garcia M", "Johnson KL", "Brown TH"],
            "journal": "Journal of Clinical Oncology",
            "year": 2024,
            "doi": "10.1200/JCO.2024.5678",
            "abstract": f"Purpose: To evaluate real-world outcomes of {query}. Patients and Methods: Retrospective analysis of 1,247 patients... Results: Median OS was 18.3 months.",
            "citations": 23,
            "impact_factor": 45.3,
        },
        {
            "pmid": "37985621",
            "title": f"Molecular Mechanisms Underlying {query} Resistance",
            "authors": ["Kim SH", "Park JY", "Lee DW", "et al."],
            "journal": "Cell",
            "year": 2023,
            "doi": "10.1016/j.cell.2023.9012",
            "abstract": f"Understanding resistance mechanisms to {query} is critical... We identified novel pathways...",
            "citations": 89,
            "impact_factor": 66.8,
        },
    ]
    
    return {
        "query": query,
        "total_results": 2847,
        "articles": mock_articles[:max_results],
        "source": "PubMed/MEDLINE",
        "retrieved_at": datetime.now().isoformat(),
    }


def get_company_profile(company: str) -> dict:
    """Get comprehensive company profile."""
    
    # Mock company data
    profiles = {
        "pfizer": {
            "name": "Pfizer Inc.",
            "ticker": "PFE",
            "sector": "Pharmaceuticals",
            "market_cap": "$158.2B",
            "revenue_ttm": "$58.5B",
            "employees": 83000,
            "headquarters": "New York, NY",
            "ceo": "Albert Bourla",
            "founded": 1849,
            "pipeline": {
                "phase_1": 28,
                "phase_2": 35,
                "phase_3": 24,
                "filed": 8,
            },
            "therapeutic_areas": ["Oncology", "Vaccines", "Rare Disease", "Inflammation"],
            "recent_acquisitions": [
                {"target": "Seagen", "value": "$43B", "date": "2023-12", "rationale": "Oncology expansion"},
                {"target": "Arena Pharma", "value": "$6.7B", "date": "2022-03", "rationale": "Immunology"},
            ],
            "key_products": [
                {"name": "Comirnaty", "revenue": "$11.2B", "indication": "COVID-19 Vaccine"},
                {"name": "Paxlovid", "revenue": "$8.1B", "indication": "COVID-19 Treatment"},
                {"name": "Eliquis", "revenue": "$6.5B", "indication": "Anticoagulant"},
            ],
        },
        "default": {
            "name": company,
            "ticker": "N/A",
            "sector": "Life Sciences",
            "market_cap": "$25.4B",
            "revenue_ttm": "$8.2B",
            "employees": 12000,
            "headquarters": "Cambridge, MA",
            "pipeline": {"phase_1": 12, "phase_2": 8, "phase_3": 5, "filed": 2},
            "therapeutic_areas": ["Oncology", "Rare Disease"],
        },
    }
    
    profile = profiles.get(company.lower(), profiles["default"])
    if profile == profiles["default"]:
        profile["name"] = company
    
    return {
        "company": profile,
        "source": "Company Filings, Bloomberg",
        "retrieved_at": datetime.now().isoformat(),
    }


def search_news(query: str, days: int = 30) -> dict:
    """Search recent news and press releases."""
    
    mock_news = [
        {
            "title": f"{query.split()[0]} Announces Positive Phase 3 Results",
            "source": "PR Newswire",
            "date": (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d"),
            "summary": f"Top-line results demonstrate statistically significant improvement in primary endpoint. Company plans to file NDA in Q1 2025.",
            "url": "https://example.com/news/1",
            "sentiment": "positive",
        },
        {
            "title": f"FDA Grants Priority Review for {query.split()[-1] if len(query.split()) > 1 else query} Application",
            "source": "Reuters",
            "date": (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d"),
            "summary": "The FDA has granted Priority Review designation, setting a PDUFA date of June 2025.",
            "url": "https://example.com/news/2",
            "sentiment": "positive",
        },
        {
            "title": f"Market Analysis: {query} Competitive Landscape Shifts",
            "source": "BioPharma Dive",
            "date": (datetime.now() - timedelta(days=8)).strftime("%Y-%m-%d"),
            "summary": "New entrants are reshaping the competitive dynamics in this therapeutic area. Analysts predict increased M&A activity.",
            "url": "https://example.com/news/3",
            "sentiment": "neutral",
        },
        {
            "title": f"Partnership Announced: {query.split()[0]} and Leading Biotech Collaborate",
            "source": "FiercePharma",
            "date": (datetime.now() - timedelta(days=12)).strftime("%Y-%m-%d"),
            "summary": "Strategic collaboration valued at up to $2.5B including milestones. Deal expands pipeline in key therapeutic area.",
            "url": "https://example.com/news/4",
            "sentiment": "positive",
        },
    ]
    
    return {
        "query": query,
        "time_range": f"Last {days} days",
        "total_results": len(mock_news),
        "articles": mock_news,
        "source": "News Aggregator",
        "retrieved_at": datetime.now().isoformat(),
    }


def get_competitor_landscape(therapeutic_area: str) -> dict:
    """Get competitive landscape for a therapeutic area."""
    
    mock_landscape = {
        "therapeutic_area": therapeutic_area,
        "market_size": "$47.2B (2024)",
        "growth_rate": "8.5% CAGR",
        "key_players": [
            {
                "company": "Merck & Co.",
                "market_share": "23%",
                "key_products": ["Keytruda"],
                "strategy": "First-line expansion",
            },
            {
                "company": "Bristol-Myers Squibb",
                "market_share": "18%",
                "key_products": ["Opdivo", "Yervoy"],
                "strategy": "Combination therapies",
            },
            {
                "company": "Roche",
                "market_share": "15%",
                "key_products": ["Tecentriq"],
                "strategy": "Biomarker-driven approach",
            },
            {
                "company": "AstraZeneca",
                "market_share": "12%",
                "key_products": ["Imfinzi", "Tagrisso"],
                "strategy": "Lung cancer leadership",
            },
        ],
        "emerging_players": [
            {"company": "Seagen/Pfizer", "focus": "ADCs"},
            {"company": "Legend Biotech", "focus": "CAR-T"},
        ],
        "trends": [
            "Shift to earlier lines of therapy",
            "Biomarker-driven patient selection",
            "Combination regimens becoming standard",
            "ADCs and bispecifics gaining share",
        ],
    }
    
    return {
        "landscape": mock_landscape,
        "source": "Market Research, SEC Filings",
        "retrieved_at": datetime.now().isoformat(),
    }


# ============================================================================
# TOOL DEFINITIONS
# ============================================================================

RESEARCHER_TOOLS = [
    {
        "name": "search_clinical_trials",
        "description": "Search ClinicalTrials.gov for clinical trial information including phase, status, enrollment, and endpoints",
        "function": search_clinical_trials,
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query (drug name, company, condition)"},
                "phase": {"type": "string", "description": "Trial phase filter (Phase 1, Phase 2, Phase 3)"},
                "status": {"type": "string", "description": "Trial status filter (Recruiting, Active, Completed)"},
            },
            "required": ["query"],
        },
        "returns": {"type": "object", "description": "Clinical trial search results"},
    },
    {
        "name": "get_fda_filings",
        "description": "Get FDA regulatory filings including NDAs, BLAs, and approval status for a company",
        "function": get_fda_filings,
        "parameters": {
            "type": "object",
            "properties": {
                "company": {"type": "string", "description": "Company name"},
                "filing_type": {"type": "string", "description": "Filing type filter (NDA, BLA, sNDA)"},
            },
            "required": ["company"],
        },
        "returns": {"type": "object", "description": "FDA filing information"},
    },
    {
        "name": "search_pubmed",
        "description": "Search PubMed for scientific literature, clinical studies, and research publications",
        "function": search_pubmed,
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query for scientific literature"},
                "max_results": {"type": "integer", "description": "Maximum number of results to return"},
            },
            "required": ["query"],
        },
        "returns": {"type": "object", "description": "PubMed search results with abstracts"},
    },
    {
        "name": "get_company_profile",
        "description": "Get comprehensive company profile including financials, pipeline, and key products",
        "function": get_company_profile,
        "parameters": {
            "type": "object",
            "properties": {
                "company": {"type": "string", "description": "Company name"},
            },
            "required": ["company"],
        },
        "returns": {"type": "object", "description": "Company profile data"},
    },
    {
        "name": "search_news",
        "description": "Search recent news, press releases, and industry coverage",
        "function": search_news,
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query for news"},
                "days": {"type": "integer", "description": "Number of days to search back"},
            },
            "required": ["query"],
        },
        "returns": {"type": "object", "description": "News articles and press releases"},
    },
    {
        "name": "get_competitor_landscape",
        "description": "Get competitive landscape analysis for a therapeutic area including market share and key players",
        "function": get_competitor_landscape,
        "parameters": {
            "type": "object",
            "properties": {
                "therapeutic_area": {"type": "string", "description": "Therapeutic area to analyze"},
            },
            "required": ["therapeutic_area"],
        },
        "returns": {"type": "object", "description": "Competitive landscape data"},
    },
]


def register_researcher_tools(registry: ToolRegistry) -> None:
    """Register all researcher tools."""
    for tool_def in RESEARCHER_TOOLS:
        registry.register(ToolDefinition(
            name=tool_def["name"],
            description=tool_def["description"],
            category=ToolCategory.RESEARCH,
            agent="researcher",
            parameters=tool_def["parameters"],
            returns=tool_def["returns"],
            function=tool_def["function"],
            demo_latency_ms=800,
        ))
