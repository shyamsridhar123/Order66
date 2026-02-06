/**
 * DebugPanel - Shows debug information after agent responses
 */
'use client';

import { Bug, Clock, Cpu, Wrench, Users, Zap, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useAppStore, DebugInfo } from '@/lib/store';
import { getToolDisplayInfo } from '@/lib/toolStore';

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function DebugSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true 
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-neutral-700 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-800 transition-colors text-left"
      >
        {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <Icon className="w-3 h-3 text-emerald-400" />
        <span className="text-xs font-medium text-neutral-300">{title}</span>
      </button>
      {isOpen && (
        <div className="px-3 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}

export function DebugPanel() {
  const debugInfo = useAppStore((s) => s.currentDebugInfo);
  const debugMode = useAppStore((s) => s.debugMode);
  
  if (!debugMode || !debugInfo || !debugInfo.endTime) {
    return null;
  }
  
  return (
    <div className="mb-4 rounded-lg border border-emerald-800 bg-neutral-900 overflow-hidden font-mono text-xs">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-900/30 border-b border-emerald-800">
        <Bug className="w-4 h-4 text-emerald-400" />
        <span className="font-semibold text-emerald-400">Debug Output</span>
        <span className="ml-auto text-neutral-500">
          Total: {formatMs(debugInfo.totalDurationMs || 0)}
        </span>
      </div>
      
      {/* Stats Overview */}
      <DebugSection title="Performance Stats" icon={Zap}>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-neutral-800 rounded px-2 py-1.5 text-center">
            <div className="text-emerald-400 font-semibold">{formatMs(debugInfo.totalDurationMs || 0)}</div>
            <div className="text-neutral-500 text-[10px]">Duration</div>
          </div>
          <div className="bg-neutral-800 rounded px-2 py-1.5 text-center">
            <div className="text-amber-400 font-semibold">{formatMs(debugInfo.apiLatencyMs || 0)}</div>
            <div className="text-neutral-500 text-[10px]">API</div>
          </div>
          <div className="bg-neutral-800 rounded px-2 py-1.5 text-center">
            <div className="text-blue-400 font-semibold">{debugInfo.agentsUsed.length}</div>
            <div className="text-neutral-500 text-[10px]">Agents</div>
          </div>
          <div className="bg-neutral-800 rounded px-2 py-1.5 text-center">
            <div className="text-violet-400 font-semibold">{debugInfo.toolCalls.length}</div>
            <div className="text-neutral-500 text-[10px]">Tools</div>
          </div>
        </div>
      </DebugSection>
      
      {/* Intent Analysis */}
      {debugInfo.intent && (
        <DebugSection title="Intent Analysis" icon={Cpu} defaultOpen={false}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Primary:</span>
              <span className="px-1.5 py-0.5 rounded bg-violet-900/50 text-violet-400">
                {debugInfo.intent.primary}
              </span>
            </div>
            {debugInfo.intent.entities.length > 0 && (
              <div>
                <span className="text-neutral-500">Entities:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {debugInfo.intent.entities.map((e, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-cyan-900/50 text-cyan-400">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="text-neutral-400 text-[10px] mt-1">
              Task: {debugInfo.intent.taskDescription.slice(0, 100)}...
            </div>
          </div>
        </DebugSection>
      )}
      
      {/* Agents */}
      <DebugSection title="Agent Execution" icon={Users}>
        <div className="space-y-1">
          {debugInfo.agentsUsed.map((agent, i) => (
            <div 
              key={agent}
              className="flex items-center justify-between px-2 py-1 rounded bg-neutral-800"
            >
              <div className="flex items-center gap-2">
                <span className="w-4 text-neutral-500 text-[10px]">#{i + 1}</span>
                <span className="text-blue-400">{agent}</span>
              </div>
              <span className="text-emerald-400">✓</span>
            </div>
          ))}
        </div>
      </DebugSection>
      
      {/* Tool Calls */}
      {debugInfo.toolCalls.length > 0 && (
        <DebugSection title={`Tool Calls (${debugInfo.toolCalls.length})`} icon={Wrench} defaultOpen={false}>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {debugInfo.toolCalls.map((tool, i) => {
              const info = getToolDisplayInfo(tool.toolName);
              const hasError = tool.resultPreview?.toLowerCase().includes('error');
              return (
                <div key={tool.id} className={`bg-neutral-800 rounded p-2 ${hasError ? 'border border-red-800' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-violet-400 font-medium text-[11px]">{info.name}</span>
                      <span className="text-neutral-600 text-[10px]">by</span>
                      <span className="text-blue-400 text-[11px]">{tool.agentName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {tool.executionTimeMs && (
                        <span className="text-amber-400 text-[10px]">{tool.executionTimeMs}ms</span>
                      )}
                      <span className={tool.status === 'completed' && !hasError ? 'text-emerald-400' : 'text-red-400'}>
                        {tool.status === 'completed' && !hasError ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                  {hasError && tool.resultPreview && (
                    <div className="text-[10px] mt-1 p-1.5 rounded bg-red-900/30 text-red-400 truncate">
                      {tool.resultPreview}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </DebugSection>
      )}
      
      {/* Timing Breakdown */}
      <DebugSection title="Timing" icon={Clock} defaultOpen={false}>
        <div className="flex items-center justify-between text-[11px] text-neutral-400 gap-3">
          <span>{new Date(debugInfo.startTime).toLocaleTimeString()} → {new Date(debugInfo.endTime).toLocaleTimeString()}</span>
          <span className="text-emerald-400 font-medium">{formatMs(debugInfo.totalDurationMs || 0)}</span>
        </div>
      </DebugSection>
    </div>
  );
}

/**
 * DebugModeIndicator - Shows when debug mode is active
 */
export function DebugModeIndicator() {
  const debugMode = useAppStore((s) => s.debugMode);
  
  if (!debugMode) return null;
  
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-900/30 border border-emerald-800">
      <Bug className="w-3 h-3 text-emerald-400" />
      <span className="text-xs font-medium text-emerald-400">Debug</span>
    </div>
  );
}
