/**
 * ToolCallVisualization - Shows real-time tool calls for an agent
 */
'use client';

import { useToolStore, getToolDisplayInfo } from '@/lib/toolStore';
import { cn } from '@/lib/utils';

interface ToolCallVisualizationProps {
  agentName: string;
  compact?: boolean;
}

export function ToolCallVisualization({ agentName, compact = false }: ToolCallVisualizationProps) {
  const toolCalls = useToolStore((s) => s.getToolsForAgent(agentName));
  const activeTools = useToolStore((s) => s.activeToolsByAgent[agentName] || []);
  
  if (toolCalls.length === 0) {
    return null;
  }
  
  if (compact) {
    // Compact view - just show active tool names
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {toolCalls.slice(-3).map((call) => {
          const info = getToolDisplayInfo(call.toolName);
          const isActive = call.status === 'calling';
          
          return (
            <span
              key={call.id}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full',
                isActive
                  ? 'bg-blue-500/20 text-blue-400 animate-pulse'
                  : 'bg-green-500/20 text-green-400'
              )}
            >
              <span className="text-[10px]">{isActive ? '🔧' : '✓'}</span>
              {info.name}
              {call.executionTimeMs && (
                <span className="text-[10px] opacity-70">{call.executionTimeMs}ms</span>
              )}
            </span>
          );
        })}
      </div>
    );
  }
  
  // Full view - show all tool calls with details
  return (
    <div className="mt-2 space-y-1.5">
      <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        Tool Calls ({toolCalls.length})
      </div>
      <div className="space-y-1">
        {toolCalls.map((call) => {
          const info = getToolDisplayInfo(call.toolName);
          const isActive = call.status === 'calling';
          
          return (
            <div
              key={call.id}
              className={cn(
                'flex items-center justify-between px-2 py-1.5 rounded-md text-xs',
                'bg-zinc-100 dark:bg-zinc-800/50',
                isActive && 'ring-1 ring-blue-500/50'
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  isActive ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
                )} />
                <div>
                  <div className="font-medium text-zinc-700 dark:text-zinc-300">
                    {info.name}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-500">
                    {isActive ? info.description : call.resultPreview?.slice(0, 50)}
                  </div>
                </div>
              </div>
              
              {call.executionTimeMs && (
                <span className="text-[10px] text-zinc-500 dark:text-zinc-500">
                  {call.executionTimeMs}ms
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * ToolCallSummary - Shows a summary of all tool calls across agents
 */
export function ToolCallSummary() {
  const toolCalls = useToolStore((s) => s.toolCalls);
  const activeTools = useToolStore((s) => s.activeToolsByAgent);
  
  const totalActive = Object.values(activeTools).flat().length;
  const totalCompleted = toolCalls.filter((c) => c.status === 'completed').length;
  
  if (toolCalls.length === 0) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg text-xs">
      <div className="flex items-center gap-1.5">
        <span className="text-zinc-500">🔧</span>
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {toolCalls.length} Tools
        </span>
      </div>
      
      {totalActive > 0 && (
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-blue-500">{totalActive} active</span>
        </div>
      )}
      
      {totalCompleted > 0 && (
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-green-500">{totalCompleted} completed</span>
        </div>
      )}
    </div>
  );
}
