"""Advisor Agent Tools - Client communication and executive summary tools."""

from datetime import datetime
from app.tools.registry import ToolRegistry, ToolDefinition, ToolCategory


def generate_talking_points(topic: str, audience: str = "executive", tone: str = "professional") -> dict:
    """Generate key talking points for client communications."""
    
    talking_points = {
        "topic": topic,
        "audience": audience,
        "tone": tone,
        "points": [
            {
                "headline": "Strategic Imperative",
                "supporting_detail": "Market dynamics demand immediate action - window of opportunity narrowing",
                "data_point": "Competitors moving fast with 3 major transactions announced in past 6 months",
            },
            {
                "headline": "Clear Path Forward",
                "supporting_detail": "Our analysis identifies a prioritized set of actionable options",
                "data_point": "Top 3 targets represent $2-8B investment range with varying risk profiles",
            },
            {
                "headline": "Risk-Adjusted Approach",
                "supporting_detail": "Each option evaluated against strategic, financial, and execution criteria",
                "data_point": "Probability-weighted analysis suggests 15-25% IRR range across scenarios",
            },
            {
                "headline": "Implementation Ready",
                "supporting_detail": "Detailed roadmap and resource requirements defined",
                "data_point": "6-month timeline with clear milestones and decision points",
            },
        ],
        "key_messages": [
            "The market opportunity is substantial but time-sensitive",
            "We have identified a clear set of strategic options",
            "Our recommended path balances ambition with prudent risk management",
        ],
        "anticipated_questions": [
            "What is the competitive response scenario?",
            "How does this align with our 5-year strategy?",
            "What are the key risks and mitigants?",
            "What resources are required for execution?",
        ],
    }
    
    return talking_points


def assess_risks(proposal: str) -> dict:
    """Assess risks and develop mitigation strategies."""
    
    risk_assessment = {
        "proposal_summary": proposal,
        "risk_categories": [
            {
                "category": "Strategic",
                "risks": [
                    {
                        "risk": "Competitive response",
                        "likelihood": "High",
                        "impact": "Medium",
                        "mitigation": "Develop response scenarios and contingency plans",
                    },
                    {
                        "risk": "Market timing",
                        "likelihood": "Medium",
                        "impact": "High",
                        "mitigation": "Build flexibility into execution timeline",
                    },
                ],
            },
            {
                "category": "Execution",
                "risks": [
                    {
                        "risk": "Integration complexity",
                        "likelihood": "High",
                        "impact": "High",
                        "mitigation": "Early integration planning, experienced PMO",
                    },
                    {
                        "risk": "Key talent retention",
                        "likelihood": "Medium",
                        "impact": "High",
                        "mitigation": "Retention packages, clear career paths",
                    },
                ],
            },
            {
                "category": "Financial",
                "risks": [
                    {
                        "risk": "Valuation uncertainty",
                        "likelihood": "Medium",
                        "impact": "Medium",
                        "mitigation": "Staged payments, earnouts tied to milestones",
                    },
                    {
                        "risk": "Synergy realization",
                        "likelihood": "Medium",
                        "impact": "High",
                        "mitigation": "Conservative assumptions, detailed synergy tracking",
                    },
                ],
            },
            {
                "category": "Regulatory",
                "risks": [
                    {
                        "risk": "Antitrust scrutiny",
                        "likelihood": "Low",
                        "impact": "High",
                        "mitigation": "Early regulatory engagement, divestiture planning",
                    },
                ],
            },
        ],
        "overall_risk_rating": "Medium-High",
        "key_risk_factors": [
            "Execution complexity",
            "Competitive dynamics",
            "Integration success",
        ],
        "recommended_actions": [
            "Establish risk governance framework",
            "Define risk tolerance thresholds",
            "Create monitoring and escalation protocols",
        ],
    }
    
    return risk_assessment


def create_recommendation(
    analysis_summary: str, 
    options: list = None, 
    criteria: list = None
) -> dict:
    """Create a structured recommendation with supporting rationale."""
    
    options = options or ["Option A", "Option B", "Option C"]
    criteria = criteria or ["Strategic fit", "Financial returns", "Execution risk"]
    
    recommendation = {
        "analysis_summary": analysis_summary,
        "recommendation": {
            "primary": options[0] if options else "Recommended Option",
            "confidence_level": "High",
            "rationale": [
                "Best alignment with strategic objectives",
                "Attractive risk-adjusted returns",
                "Manageable execution complexity",
            ],
        },
        "options_evaluated": [
            {
                "option": opt,
                "scores": {crit: 3 + (i % 3) for i, crit in enumerate(criteria)},  # Mock scores
                "pros": ["Strong market position", "Clear synergies"],
                "cons": ["Higher execution risk", "Premium valuation"],
                "overall_score": 3.5 + (0.5 * idx) if idx == 0 else 3.0 - (0.3 * idx),
            }
            for idx, opt in enumerate(options)
        ],
        "criteria_weighting": {crit: round(1.0 / len(criteria), 2) for crit in criteria},
        "next_steps": [
            "Present recommendation to steering committee",
            "Develop detailed implementation plan",
            "Begin stakeholder alignment process",
            "Initiate preliminary discussions with target",
        ],
        "decision_timeline": "Recommend decision within 2 weeks",
        "resources_required": "Dedicated deal team of 4-6 FTEs",
    }
    
    return recommendation


def draft_email(
    recipient: str,
    subject: str,
    key_points: list = None,
    tone: str = "professional",
    email_type: str = "update"
) -> dict:
    """Draft a professional email communication."""
    
    key_points = key_points or ["Project update", "Next steps"]
    
    templates = {
        "update": f"""Dear {recipient},

I hope this message finds you well. I wanted to provide a brief update on our recent progress.

Key highlights:
{chr(10).join(f"• {point}" for point in key_points)}

We remain on track with our agreed timeline and are pleased with the momentum. Our team continues to make strong progress on the analysis, and we're confident in delivering actionable insights.

I would welcome the opportunity to discuss these developments at your convenience. Please let me know if you have any questions or would like to schedule a brief call.

Best regards,
[Your Name]""",
        
        "deliverable": f"""Dear {recipient},

Please find attached the deliverable as discussed. Below is a brief summary:

{chr(10).join(f"• {point}" for point in key_points)}

We believe this analysis provides a solid foundation for decision-making. I welcome your feedback and am available to walk through the materials at your convenience.

Please don't hesitate to reach out with any questions.

Best regards,
[Your Name]""",
        
        "meeting_request": f"""Dear {recipient},

I hope you're doing well. I would like to request a meeting to discuss the following:

{chr(10).join(f"• {point}" for point in key_points)}

Would you have availability in the coming week? I'm flexible and can accommodate your schedule.

Looking forward to connecting.

Best regards,
[Your Name]""",
    }
    
    email_content = templates.get(email_type, templates["update"])
    
    return {
        "recipient": recipient,
        "subject": subject,
        "tone": tone,
        "type": email_type,
        "draft": email_content,
        "word_count": len(email_content.split()),
        "suggestions": [
            "Consider personalizing the opening",
            "Add specific dates for follow-up",
            "Include relevant attachments",
        ],
    }


def summarize_for_executive(content: str, max_length: str = "one_page") -> dict:
    """Create an executive-friendly summary of complex content."""
    
    summary = {
        "original_content_length": len(content.split()),
        "target_format": max_length,
        "executive_summary": {
            "situation": "Client faces strategic decision point in evolving market landscape",
            "complication": "Multiple viable options with significant trade-offs; time pressure increasing",
            "resolution": "Recommended path forward balances strategic ambition with prudent risk management",
        },
        "key_takeaways": [
            "Market opportunity is substantial ($X billion) but time-sensitive",
            "Three strategic options evaluated; Option A recommended",
            "Expected returns of 15-25% IRR with manageable risk profile",
            "6-month execution timeline with clear milestones",
        ],
        "decision_required": "Board approval for recommended strategic initiative",
        "ask": "Endorse recommendation and authorize next phase of work",
        "appendix_available": True,
    }
    
    return summary


def prepare_board_materials(topic: str, meeting_date: str = "TBD") -> dict:
    """Prepare board-level presentation materials."""
    
    return {
        "topic": topic,
        "meeting_date": meeting_date,
        "materials": {
            "executive_summary": {
                "pages": 1,
                "content": "One-page strategic overview with recommendation",
            },
            "detailed_analysis": {
                "pages": 15,
                "content": "Supporting analysis, market data, and financial projections",
            },
            "appendix": {
                "pages": 10,
                "content": "Methodology, data sources, sensitivity analysis",
            },
        },
        "pre_read_distribution": "3 business days before meeting",
        "presentation_time": "30 minutes + 15 minutes Q&A",
        "attendees": [
            "CEO",
            "CFO", 
            "CSO",
            "Board Members",
        ],
        "key_decisions": [
            "Strategic direction approval",
            "Resource allocation authorization",
            "Timeline agreement",
        ],
    }


# ============================================================================
# TOOL DEFINITIONS
# ============================================================================

ADVISOR_TOOLS = [
    {
        "name": "generate_talking_points",
        "description": "Generate key talking points for client or executive communications",
        "function": generate_talking_points,
        "parameters": {
            "type": "object",
            "properties": {
                "topic": {"type": "string", "description": "Topic to generate talking points for"},
                "audience": {"type": "string", "description": "Target audience (executive, board, team)"},
                "tone": {"type": "string", "description": "Desired tone (professional, casual, urgent)"},
            },
            "required": ["topic"],
        },
        "returns": {"type": "object", "description": "Structured talking points with key messages"},
    },
    {
        "name": "assess_risks",
        "description": "Assess risks and develop mitigation strategies for a proposal",
        "function": assess_risks,
        "parameters": {
            "type": "object",
            "properties": {
                "proposal": {"type": "string", "description": "Description of the proposal to assess"},
            },
            "required": ["proposal"],
        },
        "returns": {"type": "object", "description": "Risk assessment with mitigations"},
    },
    {
        "name": "create_recommendation",
        "description": "Create a structured recommendation with supporting rationale",
        "function": create_recommendation,
        "parameters": {
            "type": "object",
            "properties": {
                "analysis_summary": {"type": "string", "description": "Summary of analysis performed"},
                "options": {"type": "array", "items": {"type": "string"}, "description": "Options evaluated"},
                "criteria": {"type": "array", "items": {"type": "string"}, "description": "Evaluation criteria"},
            },
            "required": ["analysis_summary"],
        },
        "returns": {"type": "object", "description": "Recommendation with rationale"},
    },
    {
        "name": "draft_email",
        "description": "Draft a professional email communication",
        "function": draft_email,
        "parameters": {
            "type": "object",
            "properties": {
                "recipient": {"type": "string", "description": "Email recipient"},
                "subject": {"type": "string", "description": "Email subject"},
                "key_points": {"type": "array", "items": {"type": "string"}, "description": "Key points to include"},
                "tone": {"type": "string", "description": "Email tone"},
                "email_type": {"type": "string", "description": "Type: update, deliverable, meeting_request"},
            },
            "required": ["recipient", "subject"],
        },
        "returns": {"type": "object", "description": "Draft email with suggestions"},
    },
    {
        "name": "summarize_for_executive",
        "description": "Create an executive-friendly summary of complex content",
        "function": summarize_for_executive,
        "parameters": {
            "type": "object",
            "properties": {
                "content": {"type": "string", "description": "Content to summarize"},
                "max_length": {"type": "string", "description": "Target length (one_page, half_page, bullets)"},
            },
            "required": ["content"],
        },
        "returns": {"type": "object", "description": "Executive summary"},
    },
    {
        "name": "prepare_board_materials",
        "description": "Prepare board-level presentation materials",
        "function": prepare_board_materials,
        "parameters": {
            "type": "object",
            "properties": {
                "topic": {"type": "string", "description": "Topic for board presentation"},
                "meeting_date": {"type": "string", "description": "Board meeting date"},
            },
            "required": ["topic"],
        },
        "returns": {"type": "object", "description": "Board materials package"},
    },
]


def register_advisor_tools(registry: ToolRegistry) -> None:
    """Register all advisor tools."""
    for tool_def in ADVISOR_TOOLS:
        registry.register(ToolDefinition(
            name=tool_def["name"],
            description=tool_def["description"],
            category=ToolCategory.COMMUNICATION,
            agent="advisor",
            parameters=tool_def["parameters"],
            returns=tool_def["returns"],
            function=tool_def["function"],
            demo_latency_ms=400,
        ))
