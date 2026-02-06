"""Tool execution utilities for agents with WebSocket notifications."""

import time
import logging
from typing import Any, Optional

from app.tools import get_tool_registry
from app.api.websocket import ConnectionManager

logger = logging.getLogger(__name__)


async def execute_tool_with_notification(
    agent_name: str,
    tool_name: str,
    parameters: dict[str, Any],
    ws_manager: Optional[ConnectionManager] = None,
    conversation_id: Optional[str] = None,
) -> dict:
    """
    Execute a tool and optionally send WebSocket notifications.
    
    Args:
        agent_name: Name of the agent executing the tool
        tool_name: Name of the tool to execute
        parameters: Parameters to pass to the tool
        ws_manager: WebSocket manager for notifications (optional)
        conversation_id: Conversation ID for WebSocket (optional)
    
    Returns:
        Tool execution result
    """
    registry = get_tool_registry()
    
    logger.info(f"[TOOL] Executing {tool_name} for {agent_name} with params: {parameters}")
    
    # Notify tool call started
    if ws_manager and conversation_id:
        logger.info(f"[TOOL] Sending WebSocket notification for {tool_name}")
        await ws_manager.send_tool_call(
            conversation_id,
            agent_name,
            tool_name,
            parameters,
            "calling"
        )
    
    start_time = time.time()
    result = await registry.execute(tool_name, **parameters)
    execution_time_ms = int((time.time() - start_time) * 1000)
    
    # Notify tool result
    if ws_manager and conversation_id:
        # Create a preview of the result
        if result.get("success"):
            result_data = result.get("result", {})
            if isinstance(result_data, dict):
                preview = str(result_data)[:150] + "..." if len(str(result_data)) > 150 else str(result_data)
            else:
                preview = str(result_data)[:150]
        else:
            preview = f"Error: {result.get('error', 'Unknown error')}"
        
        await ws_manager.send_tool_result(
            conversation_id,
            agent_name,
            tool_name,
            preview,
            execution_time_ms
        )
    
    return result


async def execute_agent_tools(
    agent_name: str,
    tool_calls: list[dict[str, Any]],
    ws_manager: Optional[ConnectionManager] = None,
    conversation_id: Optional[str] = None,
) -> list[dict]:
    """
    Execute multiple tools for an agent.
    
    Args:
        agent_name: Name of the agent
        tool_calls: List of {"tool": "name", "params": {...}}
        ws_manager: WebSocket manager for notifications
        conversation_id: Conversation ID for WebSocket
    
    Returns:
        List of tool results
    """
    results = []
    
    for call in tool_calls:
        tool_name = call.get("tool")
        params = call.get("params", {})
        
        result = await execute_tool_with_notification(
            agent_name=agent_name,
            tool_name=tool_name,
            parameters=params,
            ws_manager=ws_manager,
            conversation_id=conversation_id,
        )
        results.append(result)
    
    return results


def get_available_tools_for_agent(agent_name: str) -> list[dict]:
    """Get available tools for an agent in LLM function-calling format."""
    registry = get_tool_registry()
    return registry.get_tools_for_llm(agent_name)


def format_tool_results_for_prompt(results: list[dict]) -> str:
    """Format tool results for inclusion in an LLM prompt."""
    formatted = []
    
    for result in results:
        tool_name = result.get("tool", "unknown")
        if result.get("success"):
            data = result.get("result", {})
            formatted.append(f"## Tool: {tool_name}\n```json\n{_format_json(data)}\n```")
        else:
            error = result.get("error", "Unknown error")
            formatted.append(f"## Tool: {tool_name}\nError: {error}")
    
    return "\n\n".join(formatted)


def _format_json(data: Any, indent: int = 2) -> str:
    """Format data as JSON string."""
    import json
    try:
        return json.dumps(data, indent=indent, default=str)
    except:
        return str(data)
