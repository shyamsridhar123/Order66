'use client';

import { Brain, Target, Search, BarChart3, Lightbulb, PenTool, Database, Loader2, Check, AlertCircle, Wrench } from 'lucide-react';
import { useAppStore, AGENTS, AgentId, AgentStatus } from '@/lib/store';
import { useToolStore, getToolDisplayInfo } from '@/lib/toolStore';

const iconMap = {
  brain: Brain,
  target: Target,
  search: Search,
  chart: BarChart3,
  lightbulb: Lightbulb,
  pen: PenTool,
  database: Database,
};

const colorClasses: Record<string, { bg: string; border: string; text: string; glow: string; darkBg: string; darkBorder: string; darkText: string }> = {
  violet: { bg: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700', glow: 'shadow-violet-200', darkBg: 'dark:bg-violet-950', darkBorder: 'dark:border-violet-700', darkText: 'dark:text-violet-400' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', glow: 'shadow-blue-200', darkBg: 'dark:bg-blue-950', darkBorder: 'dark:border-blue-700', darkText: 'dark:text-blue-400' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700', glow: 'shadow-cyan-200', darkBg: 'dark:bg-cyan-950', darkBorder: 'dark:border-cyan-700', darkText: 'dark:text-cyan-400' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', glow: 'shadow-emerald-200', darkBg: 'dark:bg-emerald-950', darkBorder: 'dark:border-emerald-700', darkText: 'dark:text-emerald-400' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', glow: 'shadow-amber-200', darkBg: 'dark:bg-amber-950', darkBorder: 'dark:border-amber-700', darkText: 'dark:text-amber-400' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700', glow: 'shadow-rose-200', darkBg: 'dark:bg-rose-950', darkBorder: 'dark:border-rose-700', darkText: 'dark:text-rose-400' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', glow: 'shadow-purple-200', darkBg: 'dark:bg-purple-950', darkBorder: 'dark:border-purple-700', darkText: 'dark:text-purple-400' },
};

function StatusIndicator({ status }: { status: AgentStatus }) {
  if (status === 'working') {
    return <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />;
  }
  if (status === 'completed') {
    return <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
  }
  if (status === 'error') {
    return <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />;
  }
  return <div className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600" />;
}

function AgentCard({ agentId }: { agentId: AgentId }) {
  const agents = useAppStore((s) => s.agents);
  const agentState = agents[agentId];
  const agentDef = AGENTS[agentId];
  const colors = colorClasses[agentDef.color];
  const Icon = iconMap[agentDef.icon as keyof typeof iconMap];
  
  // Get tool calls for this agent
  const toolCalls = useToolStore((s) => s.toolCalls.filter(t => t.agentName === agentId));
  const activeTools = useToolStore((s) => s.activeToolsByAgent[agentId] || []);

  const isActive = agentState.status === 'working';
  const isCompleted = agentState.status === 'completed';

  return (
    <div
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-300
        ${isActive ? `${colors.bg} ${colors.darkBg} ${colors.border} ${colors.darkBorder} shadow-lg ${colors.glow} dark:shadow-none` : ''}
        ${isCompleted ? `${colors.bg} ${colors.darkBg} ${colors.border} ${colors.darkBorder} opacity-80` : ''}
        ${!isActive && !isCompleted ? 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg ${isActive || isCompleted ? `${colors.bg} ${colors.darkBg}` : 'bg-neutral-100 dark:bg-neutral-700'}`}>
          <Icon className={`w-5 h-5 ${isActive || isCompleted ? `${colors.text} ${colors.darkText}` : 'text-neutral-500 dark:text-neutral-400'}`} />
        </div>
        <StatusIndicator status={agentState.status} />
      </div>
      
      <h3 className={`font-semibold text-sm mb-1 ${isActive ? `${colors.text} ${colors.darkText}` : 'text-neutral-800 dark:text-neutral-200'}`}>
        {agentDef.name}
      </h3>
      
      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2">
        {agentState.thought || agentDef.role}
      </p>
      
      {/* Tool calls visualization - contained with max height */}
      {toolCalls.length > 0 && (
        <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700 max-h-20 overflow-y-auto">
          <div className="flex items-center gap-1 mb-1">
            <Wrench className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
            <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
              Tools ({toolCalls.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {toolCalls.map((call) => {
              const info = getToolDisplayInfo(call.toolName);
              const isToolActive = call.status === 'calling';
              return (
                <span
                  key={call.id}
                  className={`
                    inline-flex items-center gap-0.5 px-1 py-0.5 text-[9px] rounded
                    ${isToolActive 
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 animate-pulse' 
                      : 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                    }
                  `}
                  title={info.description}
                >
                  {isToolActive ? '⚙️' : '✓'} {info.name}
                </span>
              );
            })}
          </div>
        </div>
      )}
      
      {isActive && (
        <div className="absolute inset-0 rounded-xl animate-pulse-border pointer-events-none" />
      )}
    </div>
  );
}

export function AgentVisualization() {
  const isProcessing = useAppStore((s) => s.isProcessing);
  
  // Arrange agents: Orchestrator center, others around
  const peripheralAgents: AgentId[] = ['strategist', 'researcher', 'analyst', 'advisor', 'scribe', 'memory'];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 rounded-xl overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-between p-4 pb-2">
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Agent Orchestra</h2>
        <span className={`text-xs px-2 py-1 rounded-full ${isProcessing ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'}`}>
          {isProcessing ? 'Processing' : 'Ready'}
        </span>
      </div>
      
      {/* Scrollable agent cards */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
        {/* Orchestrator at top center */}
        <div className="mb-3">
          <AgentCard agentId="orchestrator" />
        </div>
        
        {/* Other agents in a grid */}
        <div className="grid grid-cols-2 gap-2">
          {peripheralAgents.map((agentId) => (
            <AgentCard key={agentId} agentId={agentId} />
          ))}
        </div>
      </div>
      
      {/* Connection lines visualization */}
      <svg className="absolute inset-0 pointer-events-none opacity-20" style={{ display: 'none' }}>
        {/* Add animated connection lines here if needed */}
      </svg>
    </div>
  );
}
