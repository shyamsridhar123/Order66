"""Advisor Agent - Client communications and executive summaries."""

from typing import Optional
from app.agents.prompts import ADVISOR_PROMPT
from app.services.llm_service import get_llm_service
from app.api.routes.config import get_agent_llm_config
from app.tools.executor import (
    execute_tool_with_notification,
    format_tool_results_for_prompt,
)
from app.api.websocket import ConnectionManager


async def run_advisor(
    task: str, 
    context: dict,
    ws_manager: Optional[ConnectionManager] = None,
    conversation_id: Optional[str] = None,
) -> tuple[str, int]:
    """
    Run the Advisor agent for client communications.
    
    Args:
        task: The communication task
        context: Context including content to summarize/communicate
        ws_manager: WebSocket manager for tool call notifications
        conversation_id: Conversation ID for WebSocket
    
    Returns:
        Tuple of (client-ready communication, tokens used)
    """
    llm = get_llm_service()
    
    # Get per-agent LLM configuration
    model, temperature, max_tokens, custom_prompt = get_agent_llm_config("advisor")
    system_prompt = custom_prompt if custom_prompt else ADVISOR_PROMPT
    
    # Gather content from previous agents
    previous = context.get("previous_results", {})
    message = context.get("message", task)
    
    # Use tools to prepare communication
    tool_results = []
    
    # 1. Generate talking points
    talking_points_result = await execute_tool_with_notification(
        agent_name="advisor",
        tool_name="generate_talking_points",
        parameters={
            "topic": task[:100],
            "audience": "executive",
            "tone": "professional",
        },
        ws_manager=ws_manager,
        conversation_id=conversation_id,
    )
    if talking_points_result.get("success"):
        tool_results.append(talking_points_result)
    
    # 2. Assess risks if this is a proposal/recommendation
    if any(word in task.lower() for word in ["proposal", "recommendation", "strategy", "acquisition"]):
        risk_result = await execute_tool_with_notification(
            agent_name="advisor",
            tool_name="assess_risks",
            parameters={"proposal": message[:500]},
            ws_manager=ws_manager,
            conversation_id=conversation_id,
        )
        if risk_result.get("success"):
            tool_results.append(risk_result)
    
    # 3. Create recommendation if multiple options discussed
    if any(word in message.lower() for word in ["option", "alternative", "choice", "compare"]):
        rec_result = await execute_tool_with_notification(
            agent_name="advisor",
            tool_name="create_recommendation",
            parameters={
                "analysis_summary": message[:300],
                "options": ["Option A", "Option B", "Option C"],
                "criteria": ["Strategic Fit", "Financial Return", "Risk Profile"],
            },
            ws_manager=ws_manager,
            conversation_id=conversation_id,
        )
        if rec_result.get("success"):
            tool_results.append(rec_result)
    
    # 4. Summarize for executive
    summary_result = await execute_tool_with_notification(
        agent_name="advisor",
        tool_name="summarize_for_executive",
        parameters={
            "content": message,
            "max_length": "one_page",
        },
        ws_manager=ws_manager,
        conversation_id=conversation_id,
    )
    if summary_result.get("success"):
        tool_results.append(summary_result)
    
    # Format tool results
    tool_context = format_tool_results_for_prompt(tool_results) if tool_results else ""
    
    # Build content from previous agents
    content_parts = []
    for agent_name, result in previous.items():
        content_parts.append(f"{agent_name.title()} Output:\n{result[:500]}")
    
    content_str = "\n\n".join(content_parts) if content_parts else message
    
    prompt = f"""Task: {task}

=== ADVISOR TOOLS OUTPUT ===
{tool_context}

=== CONTENT FROM OTHER AGENTS ===
{content_str}

Create a clear, executive-level communication that:
1. Uses the talking points and summary from the tools
2. Leads with the key insight or recommendation
3. Addresses identified risks with mitigations
4. Provides supporting context
5. Ends with clear next steps or action items"""

    response = await llm.complete_with_usage(
        prompt=prompt,
        system_prompt=system_prompt,
        temperature=temperature,
        max_tokens=max_tokens,
        model=model,
    )
    
    return response.content, response.tokens_used
