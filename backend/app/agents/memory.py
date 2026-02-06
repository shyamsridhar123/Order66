"""Memory Agent - Knowledge retrieval and RAG."""

from typing import Optional
from app.agents.prompts import MEMORY_PROMPT
from app.services.llm_service import get_llm_service
from app.services.knowledge_service import get_knowledge_service
from app.models.database import AsyncSessionLocal
from app.api.routes.config import get_agent_llm_config
from app.tools.executor import (
    execute_tool_with_notification,
    format_tool_results_for_prompt,
)
from app.api.websocket import ConnectionManager


async def run_memory(
    task: str, 
    context: dict,
    ws_manager: Optional[ConnectionManager] = None,
    conversation_id: Optional[str] = None,
) -> tuple[str, int]:
    """
    Run the Memory agent for knowledge retrieval using semantic search.
    
    Args:
        task: The retrieval task
        context: Context including query details
        ws_manager: WebSocket manager for tool call notifications
        conversation_id: Conversation ID for WebSocket
    
    Returns:
        Tuple of (retrieved knowledge and context, tokens used)
    """
    llm = get_llm_service()
    
    # Get per-agent LLM configuration
    model, temperature, max_tokens, custom_prompt = get_agent_llm_config("memory")
    system_prompt = custom_prompt if custom_prompt else MEMORY_PROMPT
    knowledge_service = get_knowledge_service()
    
    message = context.get("message", task)
    entities = context.get("entities", [])
    
    # Build search query
    search_query = f"{task} {message} {' '.join(entities)}"
    
    # Use tools to retrieve knowledge
    tool_results = []
    
    # 1. Semantic search over knowledge base
    semantic_result = await execute_tool_with_notification(
        agent_name="memory",
        tool_name="semantic_search",
        parameters={"query": search_query, "limit": 5},
        ws_manager=ws_manager,
        conversation_id=conversation_id,
    )
    if semantic_result.get("success"):
        tool_results.append(semantic_result)
    
    # 2. Find similar engagements
    engagement_result = await execute_tool_with_notification(
        agent_name="memory",
        tool_name="find_similar_engagements",
        parameters={"query": search_query, "limit": 3},
        ws_manager=ws_manager,
        conversation_id=conversation_id,
    )
    if engagement_result.get("success"):
        tool_results.append(engagement_result)
    
    # 3. Get relevant framework
    intent = context.get("intent", "")
    if "proposal" in intent.lower() or "portfolio" in message.lower():
        framework_result = await execute_tool_with_notification(
            agent_name="memory",
            tool_name="get_framework",
            parameters={"framework_name": "portfolio_optimization"},
            ws_manager=ws_manager,
            conversation_id=conversation_id,
        )
        if framework_result.get("success"):
            tool_results.append(framework_result)
    elif "market" in message.lower():
        framework_result = await execute_tool_with_notification(
            agent_name="memory",
            tool_name="get_framework",
            parameters={"framework_name": "market_assessment"},
            ws_manager=ws_manager,
            conversation_id=conversation_id,
        )
        if framework_result.get("success"):
            tool_results.append(framework_result)
    elif "due diligence" in message.lower() or "acquisition" in message.lower():
        framework_result = await execute_tool_with_notification(
            agent_name="memory",
            tool_name="get_framework",
            parameters={"framework_name": "due_diligence"},
            ws_manager=ws_manager,
            conversation_id=conversation_id,
        )
        if framework_result.get("success"):
            tool_results.append(framework_result)
    
    # Format tool results
    tool_context = format_tool_results_for_prompt(tool_results) if tool_results else ""
    
    # Also perform real database search for additional context
    async with AsyncSessionLocal() as db:
        knowledge_results = await knowledge_service.search(
            query=search_query,
            db=db,
            limit=5,
        )
        engagement_results = await knowledge_service.find_similar_engagements(
            query=search_query,
            db=db,
            limit=3,
        )
    
    # Format database results
    kb_text = _format_knowledge_results(knowledge_results)
    eng_text = _format_engagement_results(engagement_results)
    
    prompt = f"""Task: {task}

=== MEMORY TOOLS OUTPUT ===
{tool_context}

=== DATABASE SEARCH RESULTS ===

## Relevant Frameworks & Expertise:
{kb_text if kb_text else "No matching frameworks found."}

## Similar Past Engagements:
{eng_text if eng_text else "No similar engagements found."}

Original Query: {message}

Analyze the retrieved information and provide:
1. The most relevant past engagements and their outcomes
2. Applicable frameworks and methodologies
3. Key insights that can inform the current request"""

    response = await llm.complete_with_usage(
        prompt=prompt,
        system_prompt=system_prompt,
        temperature=temperature,
        max_tokens=max_tokens,
        model=model,
    )
    
    return response.content, response.tokens_used


def _format_knowledge_results(results: list[dict]) -> str:
    """Format knowledge search results."""
    if not results:
        return ""
    
    lines = []
    for r in results:
        score = r.get("score", 0)
        if score > 0.5:  # Only include relevant results
            lines.append(f"### {r['title']} (relevance: {score:.0%})")
            lines.append(f"Category: {r['category']}")
            if r.get("industry"):
                lines.append(f"Industry: {r['industry']}")
            lines.append(f"\n{r['content'][:500]}..." if len(r['content']) > 500 else f"\n{r['content']}")
            lines.append("")
    
    return "\n".join(lines)


def _format_engagement_results(results: list[dict]) -> str:
    """Format engagement search results."""
    if not results:
        return ""
    
    lines = []
    for r in results:
        score = r.get("score", 0)
        if score > 0.5:  # Only include relevant results
            lines.append(f"### {r['client_name']} - {r['engagement_type']} (relevance: {score:.0%})")
            lines.append(f"Industry: {r['client_industry']}")
            lines.append(f"Description: {r['description'][:300]}..." if len(r['description']) > 300 else f"Description: {r['description']}")
            lines.append(f"Outcomes: {r['outcomes']}")
            if r.get("frameworks_used"):
                lines.append(f"Frameworks Used: {', '.join(r['frameworks_used'])}")
            lines.append("")
    
    return "\n".join(lines)
