'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Bug, Search, Filter, ThumbsUp, ThumbsDown, 
  Clock, Cpu, Users, Wrench, MessageSquare, Trash2,
  RefreshCw, ChevronDown, ChevronRight, X, CheckCircle,
  AlertCircle, Activity, Zap, Database
} from 'lucide-react';
import { useDebugStore, DebugLogEntry, DebugStats } from '@/lib/debugStore';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString();
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color = 'violet',
  subValue 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number;
  color?: string;
  subValue?: string;
}) {
  const colorClasses: Record<string, string> = {
    violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{value}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
          {subValue && (
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500">{subValue}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function LogRow({ log, isSelected, onSelect, onFeedback }: { 
  log: DebugLogEntry; 
  isSelected: boolean;
  onSelect: () => void;
  onFeedback: (rating: number) => void;
}) {
  const statusColors = {
    success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    timeout: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  };

  return (
    <div 
      className={`border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors ${
        isSelected ? 'bg-violet-50 dark:bg-violet-900/20' : ''
      }`}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <code className="text-xs font-mono text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 px-1.5 py-0.5 rounded">
                {log.request_id}
              </code>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[log.status]}`}>
                {log.status}
              </span>
              {log.feedback_rating === 2 && (
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
              )}
              {log.feedback_rating === 1 && (
                <ThumbsDown className="w-3.5 h-3.5 text-red-500" />
              )}
            </div>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate">
              {log.prompt.slice(0, 100)}{log.prompt.length > 100 ? '...' : ''}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(log.duration_ms)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {log.agents_used.length} agents
              </span>
              <span className="flex items-center gap-1">
                <Wrench className="w-3 h-3" />
                {log.tools_called.length} tools
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {log.tokens_total} tokens
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!log.feedback_rating && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onFeedback(2); }}
                  className="p-1.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-neutral-400 hover:text-emerald-600 transition-colors"
                  title="Thumbs up"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onFeedback(1); }}
                  className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-400 hover:text-red-600 transition-colors"
                  title="Thumbs down"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2">
          {formatDate(log.created_at)}
        </p>
      </div>
    </div>
  );
}

function LogDetail({ log, onClose, onFeedback, onDelete }: {
  log: DebugLogEntry;
  onClose: () => void;
  onFeedback: (rating: number, comment?: string) => void;
  onDelete: () => void;
}) {
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [pendingRating, setPendingRating] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    prompt: true,
    completion: true,
    agents: false,
    tools: false,
    metadata: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFeedbackSubmit = () => {
    if (pendingRating) {
      onFeedback(pendingRating, feedbackComment || undefined);
      setShowFeedbackForm(false);
      setPendingRating(null);
      setFeedbackComment('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
        <div>
          <code className="text-sm font-mono text-violet-600 dark:text-violet-400">
            {log.request_id}
          </code>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {formatDate(log.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-500 hover:text-red-600 transition-colors"
            title="Delete log"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-neutral-100 dark:bg-neutral-700 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {formatDuration(log.duration_ms)}
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Duration</p>
          </div>
          <div className="bg-neutral-100 dark:bg-neutral-700 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {log.agents_used.length}
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Agents</p>
          </div>
          <div className="bg-neutral-100 dark:bg-neutral-700 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {log.tools_called.length}
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Tools</p>
          </div>
          <div className="bg-neutral-100 dark:bg-neutral-700 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {log.tokens_total}
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Tokens</p>
          </div>
        </div>

        {/* Status & Model */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            log.status === 'success' 
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {log.status}
          </span>
          {log.model_used && (
            <span className="px-2 py-1 rounded text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
              {log.model_used}
            </span>
          )}
          {log.provider && (
            <span className="px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
              {log.provider}
            </span>
          )}
          {log.intent_detected && (
            <span className="px-2 py-1 rounded text-xs bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400">
              Intent: {log.intent_detected}
            </span>
          )}
        </div>

        {/* Prompt Section */}
        <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('prompt')}
            className="w-full flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            {expandedSections.prompt ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Prompt</span>
          </button>
          {expandedSections.prompt && (
            <div className="p-3 bg-neutral-900 text-neutral-100 font-mono text-xs whitespace-pre-wrap max-h-48 overflow-y-auto">
              {log.prompt}
            </div>
          )}
        </div>

        {/* Completion Section */}
        <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('completion')}
            className="w-full flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            {expandedSections.completion ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Completion</span>
          </button>
          {expandedSections.completion && (
            <div className="p-3 bg-neutral-900 text-neutral-100 font-mono text-xs whitespace-pre-wrap max-h-64 overflow-y-auto">
              {log.completion || 'No completion recorded'}
            </div>
          )}
        </div>

        {/* Agents Section */}
        {log.agents_used.length > 0 && (
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('agents')}
              className="w-full flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              {expandedSections.agents ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Users className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Agents ({log.agents_used.length})
              </span>
            </button>
            {expandedSections.agents && (
              <div className="p-3 space-y-1">
                {log.agents_used.map((agent, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-5 text-neutral-400">#{i + 1}</span>
                    <span className="text-neutral-700 dark:text-neutral-300">{agent}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tools Section */}
        {log.tools_called.length > 0 && (
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('tools')}
              className="w-full flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              {expandedSections.tools ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Wrench className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Tools ({log.tools_called.length})
              </span>
            </button>
            {expandedSections.tools && (
              <div className="p-3 space-y-2">
                {log.tools_called.map((tool, i) => (
                  <div key={i} className="bg-neutral-100 dark:bg-neutral-700 rounded p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">{tool.tool}</span>
                      {tool.duration_ms && (
                        <span className="text-amber-600 dark:text-amber-400">{tool.duration_ms}ms</span>
                      )}
                    </div>
                    <span className="text-neutral-500">by {tool.agent}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {log.error_message && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">Error</span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-300 font-mono">{log.error_message}</p>
          </div>
        )}

        {/* Feedback Section */}
        <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Feedback</h4>
          
          {log.feedback_rating ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {log.feedback_rating === 2 ? (
                  <ThumbsUp className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ThumbsDown className="w-5 h-5 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  log.feedback_rating === 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {log.feedback_rating === 2 ? 'Positive' : 'Negative'}
                </span>
              </div>
              {log.feedback_comment && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 rounded p-2">
                  "{log.feedback_comment}"
                </p>
              )}
              {log.feedback_at && (
                <p className="text-xs text-neutral-500">{formatDate(log.feedback_at)}</p>
              )}
            </div>
          ) : showFeedbackForm ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setPendingRating(2)}
                  className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border transition-colors ${
                    pendingRating === 2 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'
                      : 'border-neutral-200 dark:border-neutral-600 hover:border-emerald-300'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Good
                </button>
                <button
                  onClick={() => setPendingRating(1)}
                  className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border transition-colors ${
                    pendingRating === 1 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-600'
                      : 'border-neutral-200 dark:border-neutral-600 hover:border-red-300'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  Bad
                </button>
              </div>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Add a comment (optional)..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowFeedbackForm(false); setPendingRating(null); }}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={!pendingRating}
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowFeedbackForm(true)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 transition-colors"
            >
              Add Feedback
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DebugPage() {
  const { 
    logs, stats, selectedLog, isLoading, 
    fetchLogs, fetchStats, submitFeedback, deleteLog, selectLog,
    filters, setFilters 
  } = useDebugStore();
  
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchLogs({ limit: 100 });
    fetchStats();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setFilters({ search: searchInput });
      fetchLogs({ limit: 100 });
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchInput]);

  const handleFilterChange = (key: string, value: unknown) => {
    setFilters({ [key]: value });
    fetchLogs({ limit: 100 });
  };

  const handleQuickFeedback = (logId: string, rating: number) => {
    submitFeedback(logId, rating);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/"
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center">
              <Bug className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Debug Console</h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Enterprise logging & feedback</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => { fetchLogs({ limit: 100 }); fetchStats(); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      {/* Stats Cards */}
      {stats && (
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <StatCard icon={Activity} label="Total Requests" value={stats.total_requests} color="violet" />
            <StatCard icon={CheckCircle} label="Success" value={stats.success_count} color="emerald" />
            <StatCard icon={AlertCircle} label="Errors" value={stats.error_count} color="red" />
            <StatCard icon={Clock} label="Avg Duration" value={`${Math.round(stats.avg_duration_ms)}ms`} color="blue" />
            <StatCard icon={Zap} label="Total Tokens" value={stats.total_tokens.toLocaleString()} color="amber" />
            <StatCard icon={ThumbsUp} label="Positive" value={stats.feedback_positive} color="emerald" />
            <StatCard icon={ThumbsDown} label="Negative" value={stats.feedback_negative} color="red" />
            <StatCard icon={Database} label="Today" value={stats.requests_today} color="cyan" subValue={`${stats.requests_this_week} this week`} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex h-[calc(100vh-16rem)]">
        {/* Logs List */}
        <div className="flex-1 flex flex-col border-r border-neutral-200 dark:border-neutral-800">
          {/* Filters */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search prompts, completions, request IDs..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-neutral-400" />
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || null)}
                className="px-2 py-1 rounded text-xs border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              >
                <option value="">All Status</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
              </select>
              <select
                value={filters.hasFeedback === null ? '' : String(filters.hasFeedback)}
                onChange={(e) => handleFilterChange('hasFeedback', e.target.value === '' ? null : e.target.value === 'true')}
                className="px-2 py-1 rounded text-xs border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              >
                <option value="">All Feedback</option>
                <option value="true">Has Feedback</option>
                <option value="false">No Feedback</option>
              </select>
              <select
                value={filters.rating === null ? '' : String(filters.rating)}
                onChange={(e) => handleFilterChange('rating', e.target.value === '' ? null : Number(e.target.value))}
                className="px-2 py-1 rounded text-xs border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              >
                <option value="">All Ratings</option>
                <option value="2">👍 Positive</option>
                <option value="1">👎 Negative</option>
              </select>
            </div>
          </div>

          {/* Logs */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-neutral-900">
            {isLoading && logs.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-6 h-6 animate-spin text-neutral-400" />
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                <Bug className="w-12 h-12 mb-2 opacity-50" />
                <p>No debug logs found</p>
                <p className="text-xs">Logs will appear here when requests are made</p>
              </div>
            ) : (
              logs.map((log) => (
                <LogRow
                  key={log.id}
                  log={log}
                  isSelected={selectedLog?.id === log.id}
                  onSelect={() => selectLog(log)}
                  onFeedback={(rating) => handleQuickFeedback(log.id, rating)}
                />
              ))
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedLog ? (
          <div className="w-[500px] flex-shrink-0">
            <LogDetail
              log={selectedLog}
              onClose={() => selectLog(null)}
              onFeedback={(rating, comment) => submitFeedback(selectedLog.id, rating, comment)}
              onDelete={() => { deleteLog(selectedLog.id); selectLog(null); }}
            />
          </div>
        ) : (
          <div className="w-[500px] flex-shrink-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800/50">
            <div className="text-center text-neutral-500">
              <Bug className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Select a log to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
