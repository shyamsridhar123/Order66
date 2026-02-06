"""Scribe Agent Tools - Document generation and formatting tools."""

from datetime import datetime
from app.tools.registry import ToolRegistry, ToolDefinition, ToolCategory


def apply_template(template_name: str, data: dict = None) -> dict:
    """Apply a document template with provided data."""
    
    templates = {
        "competitive_brief": {
            "title": "Competitive Intelligence Brief",
            "sections": [
                {"name": "Executive Summary", "required": True, "max_words": 200},
                {"name": "Market Overview", "required": True, "max_words": 500},
                {"name": "Competitor Profiles", "required": True, "max_words": 800},
                {"name": "Pipeline Analysis", "required": True, "max_words": 600},
                {"name": "Strategic Implications", "required": True, "max_words": 400},
                {"name": "Recommendations", "required": True, "max_words": 300},
            ],
            "format": "markdown",
            "audience": "Executive Leadership",
        },
        "market_assessment": {
            "title": "Market Assessment Report",
            "sections": [
                {"name": "Executive Summary", "required": True, "max_words": 250},
                {"name": "Market Size & Growth", "required": True, "max_words": 600},
                {"name": "Competitive Landscape", "required": True, "max_words": 800},
                {"name": "Customer Segmentation", "required": True, "max_words": 500},
                {"name": "Pricing Analysis", "required": True, "max_words": 400},
                {"name": "Market Access Considerations", "required": True, "max_words": 400},
                {"name": "Conclusions & Next Steps", "required": True, "max_words": 300},
            ],
            "format": "markdown",
            "audience": "Commercial Strategy Team",
        },
        "due_diligence": {
            "title": "Due Diligence Summary",
            "sections": [
                {"name": "Investment Thesis", "required": True, "max_words": 200},
                {"name": "Company Overview", "required": True, "max_words": 400},
                {"name": "Pipeline Assessment", "required": True, "max_words": 600},
                {"name": "Financial Analysis", "required": True, "max_words": 500},
                {"name": "Risk Factors", "required": True, "max_words": 400},
                {"name": "Valuation", "required": True, "max_words": 300},
                {"name": "Recommendation", "required": True, "max_words": 200},
            ],
            "format": "markdown",
            "audience": "Investment Committee",
        },
        "board_presentation": {
            "title": "Board of Directors Presentation",
            "sections": [
                {"name": "Key Headlines", "required": True, "max_words": 100},
                {"name": "Performance Summary", "required": True, "max_words": 300},
                {"name": "Strategic Priorities", "required": True, "max_words": 400},
                {"name": "Financial Outlook", "required": True, "max_words": 300},
                {"name": "Key Decisions Required", "required": True, "max_words": 200},
            ],
            "format": "slides",
            "audience": "Board of Directors",
        },
        "email_executive": {
            "title": "Executive Communication",
            "sections": [
                {"name": "Subject Line", "required": True, "max_words": 10},
                {"name": "Key Message", "required": True, "max_words": 50},
                {"name": "Context", "required": True, "max_words": 100},
                {"name": "Ask/Next Steps", "required": True, "max_words": 50},
            ],
            "format": "email",
            "audience": "C-Suite Executive",
        },
    }
    
    template = templates.get(template_name, templates["competitive_brief"])
    
    return {
        "template_name": template_name,
        "template": template,
        "data_provided": data is not None,
        "instructions": f"Use this template structure for a {template['audience']} audience. Follow section guidelines and word limits.",
    }


def generate_executive_summary(content: str, max_bullets: int = 5) -> dict:
    """Generate an executive summary from content."""
    
    return {
        "format": "bullet_points",
        "max_bullets": max_bullets,
        "instructions": [
            "Lead with the most important finding or recommendation",
            "Each bullet should be actionable or decision-relevant",
            "Use specific numbers and metrics where available",
            "Keep each bullet under 25 words",
            "End with clear next step or call to action",
        ],
        "example": [
            "**Market Opportunity**: $47B addressable market growing at 8.5% CAGR through 2029",
            "**Competitive Position**: Currently #3 with 15% share; path to #2 with new product launch",
            "**Key Risk**: Patent cliff in 2027 threatens 40% of current revenue",
            "**Recommendation**: Accelerate BD efforts in adjacent indications to offset LOE impact",
            "**Immediate Action**: Schedule diligence on top 3 acquisition targets by end of Q1",
        ],
        "content_length": len(content),
    }


def create_comparison_table(items: list, attributes: list) -> dict:
    """Create a formatted comparison table."""
    
    return {
        "format": "markdown_table",
        "items": items,
        "attributes": attributes,
        "table_template": f"""
| Attribute | {' | '.join(items)} |
|-----------|{'|'.join(['---' for _ in items])}|
{chr(10).join([f"| {attr} | {' | '.join(['[data]' for _ in items])} |" for attr in attributes])}
""",
        "instructions": [
            "Fill in [data] placeholders with actual values",
            "Use consistent formatting for numbers (e.g., $XXB, XX%)",
            "Highlight key differentiators in bold",
            "Add footnotes for data sources",
        ],
    }


def format_citations(sources: list) -> dict:
    """Format sources into proper citations."""
    
    return {
        "format": "numbered_citations",
        "citation_style": "business_report",
        "instructions": [
            "Number citations in order of appearance",
            "Include source name, date, and URL if applicable",
            "Group by source type (company filings, news, research)",
        ],
        "example_citations": [
            "[1] Pfizer Inc. Q3 2024 Earnings Report, October 29, 2024",
            "[2] FDA Approval Letter, NDA 215478, November 15, 2024",
            "[3] Smith J, et al. Nature Medicine. 2024;30(5):1234-1245",
            "[4] BioPharma Dive, 'Market Analysis: Oncology Landscape', December 1, 2024",
        ],
        "sources_provided": len(sources),
    }


def generate_appendix(data_type: str, data: dict = None) -> dict:
    """Generate appendix materials."""
    
    appendix_types = {
        "methodology": {
            "title": "Appendix A: Methodology",
            "sections": ["Data Sources", "Analysis Approach", "Assumptions", "Limitations"],
        },
        "data_tables": {
            "title": "Appendix B: Supporting Data",
            "sections": ["Raw Data Tables", "Calculation Details", "Source References"],
        },
        "glossary": {
            "title": "Appendix C: Glossary",
            "sections": ["Key Terms", "Acronyms", "Definitions"],
        },
        "team": {
            "title": "Appendix D: Project Team",
            "sections": ["Team Members", "Roles", "Contact Information"],
        },
    }
    
    appendix = appendix_types.get(data_type, appendix_types["methodology"])
    
    return {
        "appendix_type": data_type,
        "template": appendix,
        "instructions": f"Generate {appendix['title']} with sections: {', '.join(appendix['sections'])}",
    }


# ============================================================================
# TOOL DEFINITIONS
# ============================================================================

SCRIBE_TOOLS = [
    {
        "name": "apply_template",
        "description": "Apply a document template (competitive_brief, market_assessment, due_diligence, board_presentation, email_executive)",
        "function": apply_template,
        "parameters": {
            "type": "object",
            "properties": {
                "template_name": {"type": "string", "description": "Name of template to apply"},
                "data": {"type": "object", "description": "Data to populate template"},
            },
            "required": ["template_name"],
        },
        "returns": {"type": "object", "description": "Template structure and instructions"},
    },
    {
        "name": "generate_executive_summary",
        "description": "Generate executive summary bullet points from content",
        "function": generate_executive_summary,
        "parameters": {
            "type": "object",
            "properties": {
                "content": {"type": "string", "description": "Content to summarize"},
                "max_bullets": {"type": "integer", "description": "Maximum number of bullets"},
            },
            "required": ["content"],
        },
        "returns": {"type": "object", "description": "Summary format and instructions"},
    },
    {
        "name": "create_comparison_table",
        "description": "Create a formatted comparison table for multiple items",
        "function": create_comparison_table,
        "parameters": {
            "type": "object",
            "properties": {
                "items": {"type": "array", "items": {"type": "string"}, "description": "Items to compare (columns)"},
                "attributes": {"type": "array", "items": {"type": "string"}, "description": "Attributes to compare (rows)"},
            },
            "required": ["items", "attributes"],
        },
        "returns": {"type": "object", "description": "Table template and formatting instructions"},
    },
    {
        "name": "format_citations",
        "description": "Format sources into properly numbered citations",
        "function": format_citations,
        "parameters": {
            "type": "object",
            "properties": {
                "sources": {"type": "array", "items": {"type": "string"}, "description": "List of sources to cite"},
            },
            "required": ["sources"],
        },
        "returns": {"type": "object", "description": "Citation format and examples"},
    },
    {
        "name": "generate_appendix",
        "description": "Generate appendix materials (methodology, data_tables, glossary, team)",
        "function": generate_appendix,
        "parameters": {
            "type": "object",
            "properties": {
                "data_type": {"type": "string", "description": "Type of appendix to generate"},
                "data": {"type": "object", "description": "Data for appendix"},
            },
            "required": ["data_type"],
        },
        "returns": {"type": "object", "description": "Appendix template"},
    },
]


def register_scribe_tools(registry: ToolRegistry) -> None:
    """Register all scribe tools."""
    for tool_def in SCRIBE_TOOLS:
        registry.register(ToolDefinition(
            name=tool_def["name"],
            description=tool_def["description"],
            category=ToolCategory.DOCUMENT,
            agent="scribe",
            parameters=tool_def["parameters"],
            returns=tool_def["returns"],
            function=tool_def["function"],
            demo_latency_ms=400,
        ))
