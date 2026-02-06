"""Scribe Agent - Document generation and formatting."""

from typing import Optional
from app.agents.prompts import SCRIBE_PROMPT
from app.services.llm_service import get_llm_service
from app.api.routes.config import get_agent_llm_config
from app.tools.executor import (
    execute_tool_with_notification,
    format_tool_results_for_prompt,
)
from app.api.websocket import ConnectionManager


async def run_scribe(
    task: str, 
    context: dict,
    ws_manager: Optional[ConnectionManager] = None,
    conversation_id: Optional[str] = None,
) -> tuple[str, int]:
    """
    Run the Scribe agent for document generation.
    
    Args:
        task: The document generation task
        context: Context including content from other agents
        ws_manager: WebSocket manager for tool call notifications
        conversation_id: Conversation ID for WebSocket
    
    Returns:
        Tuple of (generated document content, tokens used)
    """
    llm = get_llm_service()
    
    # Get per-agent LLM configuration
    model, temperature, max_tokens, custom_prompt = get_agent_llm_config("scribe")
    system_prompt = custom_prompt if custom_prompt else SCRIBE_PROMPT
    
    # Gather content from previous agents
    previous = context.get("previous_results", {})
    message = context.get("message", task)
    
    # Use tools to structure the document
    tool_results = []
    
    # 1. Determine template type based on task
    template_type = "competitive_brief"  # default
    if "proposal" in task.lower():
        template_type = "board_presentation"
    elif "due diligence" in task.lower():
        template_type = "due_diligence"
    elif "market" in task.lower():
        template_type = "market_assessment"
    elif "email" in task.lower():
        template_type = "email_executive"
    
    # Apply template
    template_result = await execute_tool_with_notification(
        agent_name="scribe",
        tool_name="apply_template",
        parameters={
            "template_name": template_type,
            "data": {
                "title": task[:50],
                "date": "2024",
                "author": "Nodus AI",
            },
        },
        ws_manager=ws_manager,
        conversation_id=conversation_id,
    )
    if template_result.get("success"):
        tool_results.append(template_result)
    
    # 2. Generate executive summary
    summary_result = await execute_tool_with_notification(
        agent_name="scribe",
        tool_name="generate_executive_summary",
        parameters={
            "content": message[:500],
            "max_bullets": 5,
        },
        ws_manager=ws_manager,
        conversation_id=conversation_id,
    )
    if summary_result.get("success"):
        tool_results.append(summary_result)
    
    # 3. Create comparison table if multiple entities
    entities = context.get("entities", [])
    if len(entities) >= 2:
        table_result = await execute_tool_with_notification(
            agent_name="scribe",
            tool_name="create_comparison_table",
            parameters={
                "items": entities[:4],
                "attributes": ["Market Position", "Revenue", "Growth", "R&D Focus"],
            },
            ws_manager=ws_manager,
            conversation_id=conversation_id,
        )
        if table_result.get("success"):
            tool_results.append(table_result)
    
    # Format tool results
    tool_context = format_tool_results_for_prompt(tool_results) if tool_results else ""
    
    # Build content from previous agents
    content_parts = []
    if "strategist" in previous:
        content_parts.append(f"Strategy Content:\n{previous['strategist']}")
    if "researcher" in previous:
        content_parts.append(f"Research Content:\n{previous['researcher']}")
    if "analyst" in previous:
        content_parts.append(f"Analysis Content:\n{previous['analyst']}")
    
    content_str = "\n\n".join(content_parts) if content_parts else message
    
    prompt = f"""DOCUMENT REQUEST: {task}

=== DOCUMENT TOOLS OUTPUT ===
{tool_context}

=== SOURCE MATERIAL ===
{content_str}

INSTRUCTIONS:
1. Use the template structure from the tools output
2. Incorporate the executive summary
3. Structure the document with clear hierarchy
4. Use tables and bullet points for clarity
5. End with actionable recommendations or next steps

Produce a clean, professional markdown document suitable for executive presentation."""

    response = await llm.complete_with_usage(
        prompt=prompt,
        system_prompt=system_prompt,
        temperature=temperature,
        max_tokens=max_tokens,
        model=model,
    )
    
    return response.content, response.tokens_used
