'use client';

import { Header } from '@/components/Header';
import { AgentVisualization } from '@/components/AgentVisualization';
import { CopilotChat } from '@/components/CopilotChat';
import { InsightPanel } from '@/components/InsightPanel';

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header />
      
      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Panel - Agent Visualization */}
        <aside className="w-80 shrink-0 hidden lg:block">
          <AgentVisualization />
        </aside>
        
        {/* Center Panel - Chat */}
        <section className="flex-1 min-w-0">
          <CopilotChat />
        </section>
        
        {/* Right Panel - Insights & Actions */}
        <aside className="w-96 shrink-0 hidden xl:block">
          <InsightPanel />
        </aside>
      </main>
    </div>
  );
}
