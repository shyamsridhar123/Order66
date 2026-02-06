#!/usr/bin/env python3
"""Test tool registry."""

from app.tools import get_tool_registry

def main():
    registry = get_tool_registry()
    tools = registry.get_all_tools()
    
    print(f"\n=== Tool Registry Test ===")
    print(f"Total tools registered: {len(tools)}")
    print()
    
    # Group by agent
    agents = {}
    for tool in tools:
        if tool.agent not in agents:
            agents[tool.agent] = []
        agents[tool.agent].append(tool)
    
    for agent, agent_tools in sorted(agents.items()):
        print(f"{agent.upper()} ({len(agent_tools)} tools):")
        for tool in agent_tools:
            print(f"  - {tool.name}: {tool.description[:50]}...")
        print()
    
    # Test execute one tool
    import asyncio
    
    async def test_execute():
        print("=== Testing Tool Execution ===")
        result = await registry.execute("search_news", query="Pfizer acquisitions", days=30, limit=3)
        print(f"search_news result: {result}")
    
    asyncio.run(test_execute())

if __name__ == "__main__":
    main()
