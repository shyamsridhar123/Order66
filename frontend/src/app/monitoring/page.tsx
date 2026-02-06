'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Activity, Brain, Target, Search, BarChart3, 
  Lightbulb, PenTool, Database, RefreshCw, Pause, Play,
  TrendingUp, Clock, Zap, AlertTriangle, CheckCircle2,
  XCircle, Circle, Cpu, Gauge
} from 'lucide-react';
import { AGENTS, AgentId } from '@/lib/store';
import { useMonitoringStore, AgentMetrics } from '@/lib/monitoringStore';

const iconMap = {
  brain: Brain,
  target: Target,
  search: Search,
  chart: BarChart3,
  lightbulb: Lightbulb,
  pen: PenTool,
  database: Database,
};

const statusConfig = {
  online: { color: 'text-emerald-500', bg: 'bg-emerald-500', label: 'Online' },
  busy: { color: 'text-amber-500', bg: 'bg-amber-500', label: 'Busy' },
  offline: { color: 'text-neutral-400', bg: 'bg-neutral-400', label: 'Offline' },
  error: { color: 'text-red-500', bg: 'bg-red-500', label: 'Error' },
};

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatTime(seconds: number): string {
  if (seconds < 1) return (seconds * 1000).toFixed(0) + 'ms';
  return seconds.toFixed(2) + 's';
}

function StatCard({ icon: Icon, label, value, subValue, trend }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/50">
          <Icon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
        </div>
        {trend && (
          <TrendingUp className={`w-4 h-4 ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500 rotate-180' : 'text-neutral-400'}`} />
        )}
      </div>
      <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{value}</p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      {subValue && <p className="text-xs text-neutral-400 mt-1">{subValue}</p>}
    </div>
  );
}

function AgentMetricsCard({ agentId }: { agentId: AgentId }) {
  const { agentMetrics } = useMonitoringStore();
  const metrics = agentMetrics[agentId];
  const agent = AGENTS[agentId];
  const Icon = iconMap[agent.icon as keyof typeof iconMap];
  const status = statusConfig[metrics.status];

  const successRate = metrics.totalRequests > 0 
    ? ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1) 
    : '100';

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 hover:shadow-md dark:hover:shadow-none dark:hover:border-neutral-600 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700">
            <Icon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">{agent.name}</h3>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${status.bg} animate-pulse`} />
              <span className={`text-xs ${status.color}`}>{status.label}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-neutral-800 dark:text-neutral-200">{metrics.uptime}%</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">uptime</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-2.5">
          <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">{metrics.totalRequests}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Requests</p>
        </div>
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-2.5">
          <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">{formatNumber(metrics.totalTokensUsed)}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Tokens</p>
        </div>
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-2.5">
          <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">{formatTime(metrics.avgResponseTime)}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Avg Time</p>
        </div>
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-2.5">
          <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">{successRate}%</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Success</p>
        </div>
      </div>

      {/* Success/Failure Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-neutral-500 dark:text-neutral-400">Request Distribution</span>
          <span className="text-neutral-400">{metrics.successfulRequests} / {metrics.failedRequests}</span>
        </div>
        <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden flex">
          <div 
            className="bg-emerald-500 h-full transition-all"
            style={{ width: `${metrics.totalRequests > 0 ? (metrics.successfulRequests / metrics.totalRequests) * 100 : 100}%` }}
          />
          <div 
            className="bg-red-500 h-full transition-all"
            style={{ width: `${metrics.totalRequests > 0 ? (metrics.failedRequests / metrics.totalRequests) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Last Active */}
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>Last active</span>
        <span>{metrics.lastActive ? new Date(metrics.lastActive).toLocaleTimeString() : 'Never'}</span>
      </div>
    </div>
  );
}

function LiveActivityFeed() {
  const { agentMetrics } = useMonitoringStore();
  const [activities, setActivities] = useState<Array<{ id: string; agent: AgentId; action: string; time: Date }>>([]);

  useEffect(() => {
    // Simulate live activity
    const interval = setInterval(() => {
      const agents = Object.keys(AGENTS) as AgentId[];
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      const actions = ['Processing request', 'Completed task', 'Retrieving context', 'Generating response', 'Analyzing data'];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      setActivities(prev => [
        { id: crypto.randomUUID(), agent: randomAgent, action: randomAction, time: new Date() },
        ...prev.slice(0, 9),
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
      <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
        <Activity className="w-4 h-4 text-violet-600 dark:text-violet-400" />
        Live Activity
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-4">Waiting for activity...</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 py-2 border-b border-neutral-50 dark:border-neutral-700 last:border-0 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate">
                  <span className="font-medium">{AGENTS[activity.agent].name}</span>
                  <span className="text-neutral-400"> · </span>
                  {activity.action}
                </p>
              </div>
              <span className="text-xs text-neutral-400">
                {activity.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function MonitoringPage() {
  const { systemMetrics, isLive, toggleLive, resetMetrics } = useMonitoringStore();
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const agentIds = Object.keys(AGENTS) as AgentId[];

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => setLastRefresh(new Date()), 5000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Monitoring</h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Agent operations & metrics</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400">
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={toggleLive}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isLive ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isLive ? 'Live' : 'Paused'}
          </button>
          <button
            onClick={resetMetrics}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Reset metrics"
          >
            <RefreshCw className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* System Overview */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">System Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatCard icon={Zap} label="Total Requests" value={formatNumber(systemMetrics.totalRequests)} trend="up" />
            <StatCard icon={Cpu} label="Tokens Used" value={formatNumber(systemMetrics.totalTokensUsed)} subValue="All agents" />
            <StatCard icon={Clock} label="Avg Response" value={formatTime(systemMetrics.avgResponseTime)} trend="neutral" />
            <StatCard icon={CheckCircle2} label="Active Agents" value={`${systemMetrics.activeAgents}/7`} />
            <StatCard icon={AlertTriangle} label="Error Rate" value={`${systemMetrics.errorRate}%`} trend="down" />
            <StatCard icon={Gauge} label="Req/min" value={systemMetrics.requestsPerMinute.toFixed(1)} trend="up" />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Agent Cards */}
          <div className="lg:col-span-3">
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Agent Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {agentIds.map((agentId) => (
                <AgentMetricsCard key={agentId} agentId={agentId} />
              ))}
            </div>
          </div>

          {/* Live Feed */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Activity Feed</h2>
            <LiveActivityFeed />

            {/* Quick Stats */}
            <div className="mt-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Peak tokens/request</span>
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{formatNumber(systemMetrics.peakTokensPerRequest)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Avg tokens/request</span>
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {formatNumber(Math.round(systemMetrics.totalTokensUsed / (systemMetrics.totalRequests || 1)))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">System uptime</span>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
