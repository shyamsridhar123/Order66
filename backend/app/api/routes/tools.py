"""Tools API - Endpoints for tool listing and execution."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Optional

from app.tools import get_tool_registry


router = APIRouter(prefix="/api/tools", tags=["tools"])


class ToolExecuteRequest(BaseModel):
    """Request to execute a tool."""
    tool_name: str
    parameters: dict[str, Any] = {}


class ToolExecuteResponse(BaseModel):
    """Response from tool execution."""
    tool: str
    success: bool
    result: Optional[Any] = None
    error: Optional[str] = None
    execution_time_ms: Optional[float] = None


@router.get("")
async def list_tools(agent: Optional[str] = None):
    """List all available tools, optionally filtered by agent."""
    registry = get_tool_registry()
    
    if agent:
        tools = registry.get_agent_tools(agent)
    else:
        tools = registry.get_all_tools()
    
    return {
        "tools": [t.to_dict() for t in tools],
        "count": len(tools),
        "agents": list(set(t.agent for t in tools)),
    }


@router.get("/agent/{agent_name}")
async def get_agent_tools(agent_name: str):
    """Get all tools for a specific agent."""
    registry = get_tool_registry()
    tools = registry.get_agent_tools(agent_name)
    
    return {
        "agent": agent_name,
        "tools": [t.to_dict() for t in tools],
        "count": len(tools),
        "llm_format": registry.get_tools_for_llm(agent_name),
    }


@router.post("/execute")
async def execute_tool(request: ToolExecuteRequest) -> ToolExecuteResponse:
    """Execute a tool with given parameters."""
    import time
    
    registry = get_tool_registry()
    tool = registry.get_tool(request.tool_name)
    
    if not tool:
        raise HTTPException(status_code=404, detail=f"Tool '{request.tool_name}' not found")
    
    start_time = time.time()
    result = await registry.execute(request.tool_name, **request.parameters)
    execution_time = (time.time() - start_time) * 1000
    
    return ToolExecuteResponse(
        tool=request.tool_name,
        success=result.get("success", False),
        result=result.get("result"),
        error=result.get("error"),
        execution_time_ms=round(execution_time, 2),
    )


@router.get("/categories")
async def get_categories():
    """Get all tool categories."""
    from app.tools.registry import ToolCategory
    
    return {
        "categories": [
            {"id": cat.value, "name": cat.name.title()}
            for cat in ToolCategory
        ]
    }
