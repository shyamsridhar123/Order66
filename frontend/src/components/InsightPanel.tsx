'use client';

import { useState } from 'react';
import { Lightbulb, Zap, FileSearch, ChevronDown, ChevronRight, Check, X, Eye, EyeOff, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { useAppStore, AGENTS, Insight, Action, Evidence } from '@/lib/store';

function ConfidenceBadge({ level }: { level: Insight['confidence'] }) {
  const styles = {
    high: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    medium: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    low: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[level]}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

function PriorityBadge({ level }: { level: Action['priority'] }) {
  const styles = {
    critical: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    high: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    medium: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    low: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[level]}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

function InsightCard({ insight, expanded, onToggle }: { insight: Insight; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
      >
        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50">
          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{insight.title}</h4>
        </div>
        <ConfidenceBadge level={insight.confidence} />
        {expanded ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-0 border-t border-neutral-100 dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 mb-2">{insight.description}</p>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs text-neutral-400">Sources:</span>
            {insight.source.map((s) => (
              <span key={s} className="text-xs px-1.5 py-0.5 rounded bg-violet-50 dark:bg-violet-900/50 text-violet-700 dark:text-violet-400">
                {AGENTS[s].name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionCard({ action }: { action: Action }) {
  const { approveAction, rejectAction } = useAppStore();
  const [showRationale, setShowRationale] = useState(false);

  const statusStyles = {
    pending: 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
    approved: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800',
    rejected: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
    modified: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
  };

  return (
    <div className={`border rounded-lg p-3 transition-all ${statusStyles[action.status]}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50">
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{action.title}</h4>
        </div>
        <PriorityBadge level={action.priority} />
      </div>
      
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">{action.description}</p>
      
      <button
        onClick={() => setShowRationale(!showRationale)}
        className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1 mb-3"
      >
        {showRationale ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        {showRationale ? 'Hide' : 'Show'} rationale
      </button>
      
      {showRationale && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 rounded p-2 mb-3 italic">
          {action.rationale}
        </p>
      )}
      
      {action.status === 'pending' && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => approveAction(action.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
          >
            <ThumbsUp className="w-3 h-3" />
            Approve
          </button>
          <button
            onClick={() => rejectAction(action.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
          >
            <ThumbsDown className="w-3 h-3" />
            Reject
          </button>
        </div>
      )}
      
      {action.status === 'approved' && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
          <Check className="w-3.5 h-3.5" />
          Approved
        </div>
      )}
      
      {action.status === 'rejected' && (
        <div className="flex items-center gap-1.5 text-xs text-red-700 dark:text-red-400">
          <X className="w-3.5 h-3.5" />
          Rejected
        </div>
      )}
    </div>
  );
}

function EvidenceCard({ evidence }: { evidence: Evidence }) {
  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-3">
      <div className="flex items-start gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/50">
          <FileSearch className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{evidence.title}</h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{evidence.source}</p>
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          {evidence.relevance}%
        </div>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{evidence.summary}</p>
    </div>
  );
}

export function InsightPanel() {
  const { currentResponse, showTransparency, toggleTransparency, requestAlternative } = useAppStore();
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'insights' | 'actions' | 'evidence'>('insights');
  const [feedbackInput, setFeedbackInput] = useState('');

  if (!currentResponse) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3">
              <Lightbulb className="w-6 h-6 text-neutral-400" />
            </div>
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">No insights yet</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Ask a question to see AI-generated insights, actions, and evidence.</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'insights', label: 'Insights', count: currentResponse.insights.length },
    { id: 'actions', label: 'Actions', count: currentResponse.actions.length },
    { id: 'evidence', label: 'Evidence', count: currentResponse.evidence.length },
  ] as const;

  const handleRequestAlternative = () => {
    if (!feedbackInput.trim()) return;
    requestAlternative(feedbackInput);
    setFeedbackInput('');
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-violet-700 dark:text-violet-400'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === tab.id
                ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-400'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
            }`}>
              {tab.count}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-500" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'insights' && currentResponse.insights.map((insight) => (
          <InsightCard
            key={insight.id}
            insight={insight}
            expanded={expandedInsight === insight.id}
            onToggle={() => setExpandedInsight(expandedInsight === insight.id ? null : insight.id)}
          />
        ))}
        
        {activeTab === 'actions' && currentResponse.actions.map((action) => (
          <ActionCard key={action.id} action={action} />
        ))}
        
        {activeTab === 'evidence' && currentResponse.evidence.map((ev) => (
          <EvidenceCard key={ev.id} evidence={ev} />
        ))}
      </div>

      {/* Transparency Toggle & Feedback */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 p-3 space-y-3">
        <button
          onClick={toggleTransparency}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <span className="text-sm text-neutral-700 dark:text-neutral-300">Show agent contributions</span>
          <div className={`w-8 h-5 rounded-full transition-colors ${showTransparency ? 'bg-violet-600' : 'bg-neutral-300 dark:bg-neutral-600'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5 ${showTransparency ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
          </div>
        </button>

        {showTransparency && (
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3 space-y-2">
            {Object.entries(currentResponse.agentContributions).map(([agent, contribution]) => (
              <div key={agent} className="text-xs">
                <span className="font-medium text-violet-700 dark:text-violet-400">{AGENTS[agent as keyof typeof AGENTS].name}:</span>
                <span className="text-neutral-600 dark:text-neutral-400 ml-1">{contribution}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={feedbackInput}
            onChange={(e) => setFeedbackInput(e.target.value)}
            placeholder="Request alternative approach..."
            className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:border-violet-400 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-100 dark:focus:ring-violet-900 outline-none"
          />
          <button
            onClick={handleRequestAlternative}
            disabled={!feedbackInput.trim()}
            className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
