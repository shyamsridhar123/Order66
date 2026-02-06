"""Researcher Agent - Web search, news, and company intelligence."""

from typing import Optional
from app.agents.prompts import RESEARCHER_PROMPT
from app.agents.factory import search_web, search_news, get_company_info
from app.services.llm_service import get_llm_service
from app.api.routes.config import get_agent_llm_config
from app.tools.executor import (
    execute_tool_with_notification,
    format_tool_results_for_prompt,
    get_available_tools_for_agent,
)
from app.api.websocket import ConnectionManager


async def run_researcher(
    task: str, 
    context: dict,
    ws_manager: Optional[ConnectionManager] = None,
    conversation_id: Optional[str] = None,
) -> tuple[str, int]:
    """
    Run the Researcher agent to gather information.
    
    Args:
        task: The research task description
        context: Context including message, entities
        ws_manager: WebSocket manager for tool call notifications
        conversation_id: Conversation ID for WebSocket
    
    Returns:
        Tuple of (research findings, tokens used)
    """
    llm = get_llm_service()
    
    # Get per-agent LLM configuration
    model, temperature, max_tokens, custom_prompt = get_agent_llm_config("researcher")
    system_prompt = custom_prompt if custom_prompt else RESEARCHER_PROMPT
    
    # Extract entities to research
    entities = context.get("entities", [])
    message = context.get("message", task)
    
    # Use tools to gather research
    tool_results = []
    
    # 1. Search clinical trials (if medical/pharma context)
    clinical_result = await execute_tool_with_notification(
        agent_name="researcher",
        tool_name="search_clinical_trials",
        parameters={"query": message},
        ws_manager=ws_manager,
        conversation_id=conversation_id,
    )
    if clinical_result.get("success"):
        tool_results.append(clinical_result)
    
    # 2. Search news
    news_result = await execute_tool_with_notification(
        agent_name="researcher",
        tool_name="search_news",
        parameters={"query": message, "days": 30},
        ws_manager=ws_manager,
        conversation_id=conversation_id,
    )
    if news_result.get("success"):
        tool_results.append(news_result)
    
    # 3. Get company profile for entities
    for entity in entities[:2]:  # Max 2 companies
        company_result = await execute_tool_with_notification(
            agent_name="researcher",
            tool_name="get_company_profile",
            parameters={"company": entity},
            ws_manager=ws_manager,
            conversation_id=conversation_id,
        )
        if company_result.get("success"):
            tool_results.append(company_result)
            break  # Just one company for now
    
    # 4. Get competitor landscape if relevant
    if any(word in message.lower() for word in ["competitor", "competitive", "landscape", "market"]):
        # Determine therapeutic area from context
        therapeutic_area = "oncology"  # Default
        if any(word in message.lower() for word in ["vaccine", "immunization"]):
            therapeutic_area = "vaccines"
        elif any(word in message.lower() for word in ["rare disease", "orphan"]):
            therapeutic_area = "rare diseases"
        elif any(word in message.lower() for word in ["inflammation", "autoimmune"]):
            therapeutic_area = "immunology"
        
        competitor_result = await execute_tool_with_notification(
            agent_name="researcher",
            tool_name="get_competitor_landscape",
            parameters={"therapeutic_area": therapeutic_area},
            ws_manager=ws_manager,
            conversation_id=conversation_id,
        )
        if competitor_result.get("success"):
            tool_results.append(competitor_result)
    
    # Format tool results for the LLM
    tool_context = format_tool_results_for_prompt(tool_results) if tool_results else ""
    
    # Also include legacy factory results for backward compatibility
    legacy_results = []
    web_results = search_web(message)
    legacy_results.append(f"## Web Search\n{web_results}")
    
    # Synthesize research
    prompt = f"""Based on the following research data, provide a comprehensive research briefing.

Task: {task}

=== TOOL RESULTS ===
{tool_context}

=== ADDITIONAL CONTEXT ===
{chr(10).join(legacy_results)}

Synthesize these findings into a clear, well-organized research briefing that addresses the task."""

    response = await llm.complete_with_usage(
        prompt=prompt,
        system_prompt=system_prompt,
        temperature=temperature,
        max_tokens=max_tokens,
        model=model,
    )
    
    return response.content, response.tokens_used
