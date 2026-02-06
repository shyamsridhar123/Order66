"""Analyst Agent - Data analysis and financial modeling."""

from typing import Optional
from app.agents.prompts import ANALYST_PROMPT
from app.services.llm_service import get_llm_service
from app.api.routes.config import get_agent_llm_config
from app.tools.executor import (
    execute_tool_with_notification,
    format_tool_results_for_prompt,
)
from app.api.websocket import ConnectionManager


async def run_analyst(
    task: str, 
    context: dict,
    ws_manager: Optional[ConnectionManager] = None,
    conversation_id: Optional[str] = None,
) -> tuple[str, int]:
    """
    Run the Analyst agent for data analysis and modeling.
    
    Args:
        task: The analysis task description
        context: Context including data and previous results
        ws_manager: WebSocket manager for tool call notifications
        conversation_id: Conversation ID for WebSocket
    
    Returns:
        Tuple of (analysis results, tokens used)
    """
    llm = get_llm_service()
    
    # Get per-agent LLM configuration
    model, temperature, max_tokens, custom_prompt = get_agent_llm_config("analyst")
    system_prompt = custom_prompt if custom_prompt else ANALYST_PROMPT
    
    # Get any previous research or data
    previous = context.get("previous_results", {})
    message = context.get("message", task)
    entities = context.get("entities", [])
    
    # Use tools to perform analysis
    tool_results = []
    
    # 1. Calculate market size
    market_result = await execute_tool_with_notification(
        agent_name="analyst",
        tool_name="calculate_market_size",
        parameters={
            "therapeutic_area": message[:50],
            "geography": "Global",
        },
        ws_manager=ws_manager,
        conversation_id=conversation_id,
    )
    if market_result.get("success"):
        tool_results.append(market_result)
    
    # 2. Run DCF model if valuation mentioned
    if any(word in message.lower() for word in ["valuation", "value", "worth", "acquisition", "deal"]):
        dcf_result = await execute_tool_with_notification(
            agent_name="analyst",
            tool_name="run_dcf_model",
            parameters={
                "company": entities[0] if entities else "Target Company",
                "revenue_cagr": 0.15,
                "discount_rate": 0.10,
            },
            ws_manager=ws_manager,
            conversation_id=conversation_id,
        )
        if dcf_result.get("success"):
            tool_results.append(dcf_result)
    
    # 3. Benchmark metrics
    if entities:
        benchmark_result = await execute_tool_with_notification(
            agent_name="analyst",
            tool_name="benchmark_metrics",
            parameters={
                "companies": entities[:3] if len(entities) >= 2 else [entities[0], "Industry Avg"],
                "metrics": ["revenue_growth", "ebitda_margin", "rd_intensity"],
            },
            ws_manager=ws_manager,
            conversation_id=conversation_id,
        )
        if benchmark_result.get("success"):
            tool_results.append(benchmark_result)
    
    # 4. Generate chart data for visualization
    chart_result = await execute_tool_with_notification(
        agent_name="analyst",
        tool_name="generate_chart_data",
        parameters={
            "data_type": "market_share",
        },
        ws_manager=ws_manager,
        conversation_id=conversation_id,
    )
    if chart_result.get("success"):
        tool_results.append(chart_result)
    
    # Format tool results for the LLM
    tool_context = format_tool_results_for_prompt(tool_results) if tool_results else ""
    
    # Build context from previous agent results
    data_context = ""
    if "researcher" in previous:
        data_context += f"\nResearch Data:\n{previous['researcher'][:1000]}"
    if "memory" in previous:
        data_context += f"\nHistorical Data:\n{previous['memory'][:1000]}"
    
    prompt = f"""Task: {task}

=== ANALYSIS TOOLS RESULTS ===
{tool_context}

=== CONTEXT FROM OTHER AGENTS ===
{data_context}

Original Request: {message}

Provide quantitative analysis, metrics, and data-driven insights based on the tool results above."""

    response = await llm.complete_with_usage(
        prompt=prompt,
        system_prompt=system_prompt,
        temperature=temperature,
        max_tokens=max_tokens,
        model=model,
    )
    
    return response.content, response.tokens_used
