"""Tool Registry - Central registry for all agent tools."""

from typing import Callable, Any, Optional
from dataclasses import dataclass, field
from enum import Enum


class ToolCategory(str, Enum):
    """Categories of tools."""
    RESEARCH = "research"
    ANALYSIS = "analysis"
    DOCUMENT = "document"
    KNOWLEDGE = "knowledge"
    COMMUNICATION = "communication"


@dataclass
class ToolDefinition:
    """Definition of a tool that agents can use."""
    name: str
    description: str
    category: ToolCategory
    agent: str  # Which agent owns this tool
    parameters: dict  # JSON schema for parameters
    returns: dict  # JSON schema for return value
    function: Callable[..., Any]  # The actual function to call
    demo_latency_ms: int = 500  # Simulated latency for demo effect
    
    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "name": self.name,
            "description": self.description,
            "category": self.category.value,
            "agent": self.agent,
            "parameters": self.parameters,
            "returns": self.returns,
        }


class ToolRegistry:
    """Central registry for all tools."""
    
    def __init__(self):
        self._tools: dict[str, ToolDefinition] = {}
        self._agent_tools: dict[str, list[str]] = {}
    
    def register(self, tool: ToolDefinition) -> None:
        """Register a tool."""
        self._tools[tool.name] = tool
        if tool.agent not in self._agent_tools:
            self._agent_tools[tool.agent] = []
        self._agent_tools[tool.agent].append(tool.name)
    
    def get_tool(self, name: str) -> Optional[ToolDefinition]:
        """Get a tool by name."""
        return self._tools.get(name)
    
    def get_agent_tools(self, agent: str) -> list[ToolDefinition]:
        """Get all tools for an agent."""
        tool_names = self._agent_tools.get(agent, [])
        return [self._tools[name] for name in tool_names]
    
    def get_all_tools(self) -> list[ToolDefinition]:
        """Get all registered tools."""
        return list(self._tools.values())
    
    async def execute(self, tool_name: str, **kwargs) -> dict:
        """Execute a tool and return results."""
        import asyncio
        
        tool = self.get_tool(tool_name)
        if not tool:
            return {"error": f"Tool '{tool_name}' not found"}
        
        # Simulate latency for demo effect
        await asyncio.sleep(tool.demo_latency_ms / 1000)
        
        try:
            result = tool.function(**kwargs)
            return {
                "tool": tool_name,
                "success": True,
                "result": result,
            }
        except Exception as e:
            return {
                "tool": tool_name,
                "success": False,
                "error": str(e),
            }
    
    def get_tools_for_llm(self, agent: str) -> list[dict]:
        """Get tool definitions formatted for LLM function calling."""
        tools = self.get_agent_tools(agent)
        return [
            {
                "type": "function",
                "function": {
                    "name": t.name,
                    "description": t.description,
                    "parameters": t.parameters,
                }
            }
            for t in tools
        ]


# Global registry instance
_registry: Optional[ToolRegistry] = None


def get_tool_registry() -> ToolRegistry:
    """Get the global tool registry."""
    global _registry
    if _registry is None:
        _registry = ToolRegistry()
        _initialize_tools(_registry)
    return _registry


def _initialize_tools(registry: ToolRegistry) -> None:
    """Initialize all tools in the registry."""
    from app.tools.researcher_tools import register_researcher_tools
    from app.tools.analyst_tools import register_analyst_tools
    from app.tools.scribe_tools import register_scribe_tools
    from app.tools.memory_tools import register_memory_tools
    from app.tools.advisor_tools import register_advisor_tools
    
    register_researcher_tools(registry)
    register_analyst_tools(registry)
    register_scribe_tools(registry)
    register_memory_tools(registry)
    register_advisor_tools(registry)
