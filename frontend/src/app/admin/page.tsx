'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Settings, Brain, Target, Search, BarChart3, 
  Lightbulb, PenTool, Database, RotateCcw, Save, Zap,
  ToggleLeft, ToggleRight, ChevronDown, ChevronRight,
  Cpu, Cloud, Shield, Plus, Trash2, Check, Server, Wrench, Play
} from 'lucide-react';
import { AGENTS, AgentId } from '@/lib/store';
import { useAdminStore, AgentConfig } from '@/lib/adminStore';
import { useLLMStore, LLMProviderConfig, LLMProvider } from '@/lib/llmStore';

// Hydrate stores on mount
function useHydrateStores() {
  useEffect(() => {
    useAdminStore.persist.rehydrate();
    useLLMStore.persist.rehydrate();
  }, []);
}

const iconMap = {
  brain: Brain,
  target: Target,
  search: Search,
  chart: BarChart3,
  lightbulb: Lightbulb,
  pen: PenTool,
  database: Database,
};

const colorClasses: Record<string, string> = {
  violet: 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
  blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  cyan: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  amber: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  rose: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  purple: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
};

function AgentSettingsCard({ agentId }: { agentId: AgentId }) {
  const [expanded, setExpanded] = useState(false);
  const { agentConfigs, updateAgentConfig, toggleAgent, resetAgentConfig, resetAgentPrompt, getDefaultPrompt } = useAdminStore();
  const { providers, activeProviderId, isLocalMode } = useLLMStore();
  const config = agentConfigs[agentId];
  const agent = AGENTS[agentId];
  const Icon = iconMap[agent.icon as keyof typeof iconMap];
  const colors = colorClasses[agent.color];

  // Filter providers based on global mode
  const isGlobalLocal = isLocalMode();
  const availableProviders = isGlobalLocal 
    ? providers.filter(p => p.isLocal)  // Local mode: only local providers
    : providers;  // Cloud mode: all providers

  // Get current LLM display info
  const currentProvider = config.llmProviderId 
    ? providers.find(p => p.id === config.llmProviderId)
    : providers.find(p => p.id === activeProviderId);
  const currentModel = config.llmModel || currentProvider?.chatModel || 'default';

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${config.enabled ? 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800' : 'border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 opacity-75'}`}>
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        <div className={`p-2.5 rounded-lg border ${colors}`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">{agent.name}</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{agent.role}</p>
        </div>

        {/* LLM Badge */}
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
          config.llmModel || config.llmProviderId 
            ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-400' 
            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
        }`}>
          <Cpu className="w-3 h-3" />
          {currentModel}
        </div>

        <button
          onClick={() => toggleAgent(agentId)}
          className={`p-1 rounded-lg transition-colors ${config.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`}
          disabled={agentId === 'orchestrator'}
          title={agentId === 'orchestrator' ? 'Orchestrator cannot be disabled' : (config.enabled ? 'Disable agent' : 'Enable agent')}
        >
          {config.enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        >
          {expanded ? <ChevronDown className="w-5 h-5 text-neutral-500 dark:text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />}
        </button>
      </div>

      {/* Expanded Settings */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-neutral-100 dark:border-neutral-700 pt-4">
          {/* LLM Provider Selection */}
          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">LLM Configuration</span>
              {isGlobalLocal && (
                <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
                  <Shield className="w-3 h-3" />
                  Local Only
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Provider Selection */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Provider</label>
                <select
                  value={config.llmProviderId || ''}
                  onChange={(e) => updateAgentConfig(agentId, { 
                    llmProviderId: e.target.value || null,
                    llmModel: null  // Reset model when provider changes
                  })}
                  className="w-full px-2 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm focus:border-violet-400 outline-none"
                >
                  <option value="">Use Global Default</option>
                  {availableProviders.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.isLocal ? '🛡️' : '☁️'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model Selection */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Model</label>
                <input
                  type="text"
                  value={config.llmModel || ''}
                  onChange={(e) => updateAgentConfig(agentId, { llmModel: e.target.value || null })}
                  placeholder={currentProvider?.chatModel || 'default'}
                  className="w-full px-2 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm focus:border-violet-400 outline-none"
                />
              </div>
            </div>

            {/* Model Suggestions for Ollama */}
            {(config.llmProviderId?.includes('ollama') || (!config.llmProviderId && activeProviderId.includes('ollama'))) && (
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs text-neutral-400">Quick:</span>
                {['qwen2.5:7b', 'phi3.5', 'mistral', 'llama3.2:3b', 'gemma2:2b'].map(model => (
                  <button
                    key={model}
                    onClick={() => updateAgentConfig(agentId, { llmModel: model })}
                    className={`px-2 py-0.5 text-xs rounded transition-colors ${
                      config.llmModel === model 
                        ? 'bg-violet-600 text-white' 
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-violet-100 dark:hover:bg-violet-900/30'
                    }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Temperature */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Temperature</span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">{config.temperature.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.temperature}
              onChange={(e) => updateAgentConfig(agentId, { temperature: parseFloat(e.target.value) })}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
            />
            <div className="flex justify-between text-xs text-neutral-400 mt-1">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Max Tokens</span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">{config.maxTokens}</span>
            </label>
            <input
              type="range"
              min="256"
              max="4096"
              step="256"
              value={config.maxTokens}
              onChange={(e) => updateAgentConfig(agentId, { maxTokens: parseInt(e.target.value) })}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
            />
          </div>

          {/* Timeout */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Timeout (seconds)</span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">{config.timeout}s</span>
            </label>
            <input
              type="range"
              min="10"
              max="120"
              step="5"
              value={config.timeout}
              onChange={(e) => updateAgentConfig(agentId, { timeout: parseInt(e.target.value) })}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Execution Priority</label>
            <select
              value={config.priority}
              onChange={(e) => updateAgentConfig(agentId, { priority: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm focus:border-violet-400 focus:ring-1 focus:ring-violet-100 outline-none"
            >
              <option value={1}>1 - First (Critical)</option>
              <option value={2}>2 - Early (High)</option>
              <option value={3}>3 - Normal</option>
              <option value={4}>4 - Later (Low)</option>
            </select>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <PenTool className="w-4 h-4" />
                System Prompt
              </label>
              <div className="flex items-center gap-2">
                {config.systemPrompt !== getDefaultPrompt(agentId) && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400">
                    Modified
                  </span>
                )}
                <button
                  onClick={() => resetAgentPrompt(agentId)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors"
                  title="Reset to default prompt"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>
            </div>
            <div className="relative">
              <textarea
                value={config.systemPrompt}
                onChange={(e) => updateAgentConfig(agentId, { systemPrompt: e.target.value })}
                rows={10}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm font-mono focus:border-violet-400 focus:ring-1 focus:ring-violet-100 outline-none resize-y min-h-[200px]"
                spellCheck={false}
              />
              <div className="absolute bottom-2 right-2 text-xs text-neutral-400">
                {config.systemPrompt.length} chars
              </div>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              This prompt defines the agent's behavior, tone, and output format. Edit to customize.
            </p>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => resetAgentConfig(agentId)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to defaults
          </button>
        </div>
      )}
    </div>
  );
}

function GlobalSettings() {
  const { globalSettings, updateGlobalSettings, resetAllConfigs } = useAdminStore();

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/50">
          <Zap className="w-5 h-5 text-violet-700 dark:text-violet-400" />
        </div>
        <div>
          <h2 className="font-semibold text-neutral-800 dark:text-neutral-200">Global Settings</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">System-wide configuration</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Parallel Execution */}
        <div className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-700">
          <div>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Parallel Execution</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Run compatible agents simultaneously</p>
          </div>
          <button
            onClick={() => updateGlobalSettings({ parallelExecution: !globalSettings.parallelExecution })}
            className={globalSettings.parallelExecution ? 'text-emerald-600' : 'text-neutral-400'}
          >
            {globalSettings.parallelExecution ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
          </button>
        </div>

        {/* Max Concurrent Agents */}
        <div className="py-3 border-b border-neutral-100 dark:border-neutral-700">
          <label className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Max Concurrent Agents</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Limit parallel execution</p>
            </div>
            <span className="text-sm font-medium text-violet-600 dark:text-violet-400">{globalSettings.maxConcurrentAgents}</span>
          </label>
          <input
            type="range"
            min="1"
            max="7"
            value={globalSettings.maxConcurrentAgents}
            onChange={(e) => updateGlobalSettings({ maxConcurrentAgents: parseInt(e.target.value) })}
            className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
          />
        </div>

        {/* Default Timeout */}
        <div className="py-3 border-b border-neutral-100 dark:border-neutral-700">
          <label className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Default Timeout</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Seconds before agent times out</p>
            </div>
            <span className="text-sm font-medium text-violet-600 dark:text-violet-400">{globalSettings.defaultTimeout}s</span>
          </label>
          <input
            type="range"
            min="10"
            max="120"
            step="5"
            value={globalSettings.defaultTimeout}
            onChange={(e) => updateGlobalSettings({ defaultTimeout: parseInt(e.target.value) })}
            className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
          />
        </div>

        {/* Stream Responses */}
        <div className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-700">
          <div>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Stream Responses</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Show real-time token streaming</p>
          </div>
          <button
            onClick={() => updateGlobalSettings({ streamResponses: !globalSettings.streamResponses })}
            className={globalSettings.streamResponses ? 'text-emerald-600' : 'text-neutral-400'}
          >
            {globalSettings.streamResponses ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
          </button>
        </div>

        {/* Debug Mode */}
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Debug Mode</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Show detailed agent traces</p>
          </div>
          <button
            onClick={() => updateGlobalSettings({ debugMode: !globalSettings.debugMode })}
            className={globalSettings.debugMode ? 'text-emerald-600' : 'text-neutral-400'}
          >
            {globalSettings.debugMode ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* Reset All */}
      <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <button
          onClick={resetAllConfigs}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset all settings to defaults
        </button>
      </div>
    </div>
  );
}

function LLMSettings() {
  const { providers, activeProviderId, setActiveProvider, updateProvider, addProvider, deleteProvider, syncToBackend } = useLLMStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProvider, setNewProvider] = useState<Omit<LLMProviderConfig, 'id'>>({
    name: '',
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    chatModel: 'gpt-4o',
    embeddingModel: 'text-embedding-3-small',
    isLocal: false,
  });

  const handleAddProvider = () => {
    if (newProvider.name && newProvider.baseUrl) {
      addProvider(newProvider);
      setNewProvider({
        name: '',
        provider: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: '',
        chatModel: 'gpt-4o',
        embeddingModel: 'text-embedding-3-small',
        isLocal: false,
      });
      setShowAddForm(false);
    }
  };

  const getProviderIcon = (provider: LLMProvider, isLocal: boolean) => {
    if (isLocal) return <Shield className="w-5 h-5" />;
    if (provider === 'azure') return <Cloud className="w-5 h-5" />;
    return <Server className="w-5 h-5" />;
  };

  const getProviderColors = (isLocal: boolean, isActive: boolean) => {
    if (isActive) {
      return isLocal 
        ? 'border-emerald-500 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' 
        : 'border-violet-500 dark:border-violet-600 bg-violet-50 dark:bg-violet-900/30';
    }
    return 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600';
  };

  return (
    <div className="space-y-6">
      {/* Active Provider Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Active LLM Provider</h3>
            <p className="text-violet-200 text-sm mt-1">
              {providers.find(p => p.id === activeProviderId)?.name || 'None selected'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {providers.find(p => p.id === activeProviderId)?.isLocal ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Local Mode</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20">
                <Cloud className="w-4 h-4" />
                <span className="text-sm font-medium">Cloud Mode</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Provider List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Configured Providers</h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Provider
          </button>
        </div>

        {providers.map((provider) => {
          const isActive = provider.id === activeProviderId;
          const isEditing = editingId === provider.id;

          return (
            <div
              key={provider.id}
              className={`rounded-xl border-2 p-4 transition-all cursor-pointer ${getProviderColors(provider.isLocal, isActive)}`}
              onClick={() => !isEditing && setActiveProvider(provider.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${provider.isLocal ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'}`}>
                    {getProviderIcon(provider.provider, provider.isLocal)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">{provider.name}</h4>
                      {isActive && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {provider.chatModel} • {provider.isLocal ? 'Local' : 'Cloud'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingId(isEditing ? null : provider.id); }}
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                  </button>
                  {!provider.id.startsWith('ollama') && !provider.id.startsWith('openai-cloud') && !provider.id.startsWith('azure') && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteProvider(provider.id); }}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      disabled={isActive}
                    >
                      <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Editing Form */}
              {isEditing && (
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-4" onClick={(e) => e.stopPropagation()}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Base URL</label>
                      <input
                        type="text"
                        value={provider.baseUrl}
                        onChange={(e) => updateProvider(provider.id, { baseUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm focus:border-violet-400 focus:ring-1 focus:ring-violet-100 outline-none"
                        placeholder="https://api.openai.com/v1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">API Key</label>
                      <input
                        type="password"
                        value={provider.apiKey}
                        onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm focus:border-violet-400 focus:ring-1 focus:ring-violet-100 outline-none"
                        placeholder="sk-..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Chat Model</label>
                      <input
                        type="text"
                        value={provider.chatModel}
                        onChange={(e) => updateProvider(provider.id, { chatModel: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm focus:border-violet-400 focus:ring-1 focus:ring-violet-100 outline-none"
                        placeholder="gpt-4o"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Embedding Model</label>
                      <input
                        type="text"
                        value={provider.embeddingModel}
                        onChange={(e) => updateProvider(provider.id, { embeddingModel: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm focus:border-violet-400 focus:ring-1 focus:ring-violet-100 outline-none"
                        placeholder="text-embedding-3-small"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={provider.isLocal}
                        onChange={(e) => updateProvider(provider.id, { isLocal: e.target.checked })}
                        className="rounded border-neutral-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Local/Private (enables incognito mode)</span>
                    </label>
                    <button
                      onClick={() => { syncToBackend(); setEditingId(null); }}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save & Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Provider Form */}
        {showAddForm && (
          <div className="rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">Add New Provider</h4>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                <RotateCcw className="w-4 h-4 text-neutral-500" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Name</label>
                <input
                  type="text"
                  value={newProvider.name}
                  onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm focus:border-violet-400 outline-none"
                  placeholder="My Custom LLM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Provider Type</label>
                <select
                  value={newProvider.provider}
                  onChange={(e) => setNewProvider({ ...newProvider, provider: e.target.value as LLMProvider })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm focus:border-violet-400 outline-none"
                >
                  <option value="openai">OpenAI Compatible</option>
                  <option value="ollama">Ollama</option>
                  <option value="azure">Azure OpenAI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Base URL</label>
                <input
                  type="text"
                  value={newProvider.baseUrl}
                  onChange={(e) => setNewProvider({ ...newProvider, baseUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm focus:border-violet-400 outline-none"
                  placeholder="https://api.openai.com/v1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">API Key</label>
                <input
                  type="password"
                  value={newProvider.apiKey}
                  onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm focus:border-violet-400 outline-none"
                  placeholder="sk-..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Chat Model</label>
                <input
                  type="text"
                  value={newProvider.chatModel}
                  onChange={(e) => setNewProvider({ ...newProvider, chatModel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm focus:border-violet-400 outline-none"
                  placeholder="gpt-4o"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Embedding Model</label>
                <input
                  type="text"
                  value={newProvider.embeddingModel}
                  onChange={(e) => setNewProvider({ ...newProvider, embeddingModel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm focus:border-violet-400 outline-none"
                  placeholder="text-embedding-3-small"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newProvider.isLocal}
                  onChange={(e) => setNewProvider({ ...newProvider, isLocal: e.target.checked })}
                  className="rounded border-neutral-300 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">Local/Private provider</span>
              </label>
              <button
                onClick={handleAddProvider}
                disabled={!newProvider.name || !newProvider.baseUrl}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Provider
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Tool definition type
interface Tool {
  name: string;
  description: string;
  category: string;
  agent: string;
  parameters: {
    type: string;
    properties: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
}

// Tool Edit Modal Component
function ToolEditModal({ 
  tool, 
  onClose, 
  onSave 
}: { 
  tool: Tool; 
  onClose: () => void; 
  onSave: (updates: { description?: string; demoLatencyMs?: number }) => void;
}) {
  const [description, setDescription] = useState(tool.description);
  const [latency, setLatency] = useState(500);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Edit Tool</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded">
            <ChevronDown className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Tool Name
            </label>
            <input
              type="text"
              value={tool.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              disabled
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Agent
            </label>
            <input
              type="text"
              value={tool.agent}
              disabled
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Demo Latency (ms)
            </label>
            <input
              type="number"
              value={latency}
              onChange={(e) => setLatency(parseInt(e.target.value) || 500)}
              min={0}
              max={5000}
              step={100}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-sm"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Simulated delay for demo effect (0-5000ms)
            </p>
          </div>
          
          {/* Parameters (read-only) */}
          {tool.parameters?.properties && Object.keys(tool.parameters.properties).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Parameters
              </label>
              <div className="space-y-2">
                {Object.entries(tool.parameters.properties).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                    <code className="text-sm text-violet-600 dark:text-violet-400">{key}</code>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">({value.type})</span>
                    {tool.parameters.required?.includes(key) && (
                      <span className="text-xs text-red-500">required</span>
                    )}
                    {value.description && (
                      <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-auto truncate max-w-[200px]">
                        {value.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ description, demoLatencyMs: latency })}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolsSettings() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [testingTool, setTestingTool] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ tool: string; result: unknown } | null>(null);
  const [testParams, setTestParams] = useState<Record<string, string>>({});
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [toolStates, setToolStates] = useState<Record<string, Record<string, boolean>>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchTools();
  }, []);
  
  // Initialize tool states when tools load
  useEffect(() => {
    if (tools.length > 0) {
      const initialStates: Record<string, Record<string, boolean>> = {};
      tools.forEach(tool => {
        if (!initialStates[tool.agent]) {
          initialStates[tool.agent] = {};
        }
        initialStates[tool.agent][tool.name] = true; // Default all enabled
      });
      setToolStates(initialStates);
    }
  }, [tools]);

  const fetchTools = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tools`);
      if (res.ok) {
        const data = await res.json();
        setTools(data.tools || []);
      }
    } catch (e) {
      console.error('Failed to fetch tools:', e);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleTool = (agent: string, toolName: string) => {
    setToolStates(prev => ({
      ...prev,
      [agent]: {
        ...prev[agent],
        [toolName]: !prev[agent]?.[toolName],
      },
    }));
  };
  
  const isToolEnabled = (agent: string, toolName: string) => {
    return toolStates[agent]?.[toolName] ?? true;
  };
  
  const getEnabledCount = (agent: string) => {
    const agentTools = tools.filter(t => t.agent === agent);
    return agentTools.filter(t => isToolEnabled(agent, t.name)).length;
  };
  
  const getTotalCount = (agent: string) => {
    return tools.filter(t => t.agent === agent).length;
  };
  
  const enableAllForAgent = (agent: string) => {
    const agentTools = tools.filter(t => t.agent === agent);
    setToolStates(prev => ({
      ...prev,
      [agent]: agentTools.reduce((acc, t) => ({ ...acc, [t.name]: true }), {}),
    }));
  };
  
  const disableAllForAgent = (agent: string) => {
    const agentTools = tools.filter(t => t.agent === agent);
    setToolStates(prev => ({
      ...prev,
      [agent]: agentTools.reduce((acc, t) => ({ ...acc, [t.name]: false }), {}),
    }));
  };

  const executeTool = async (toolName: string) => {
    setTestResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/tools/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_name: toolName,
          parameters: testParams,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTestResult({ tool: toolName, result: data });
      }
    } catch (e) {
      console.error('Failed to execute tool:', e);
      setTestResult({ tool: toolName, result: { error: 'Failed to execute tool' } });
    }
    setTestingTool(null);
  };

  const agents = ['all', ...Array.from(new Set(tools.map(t => t.agent)))];
  
  // Filter by agent and search
  let filteredTools = selectedAgent === 'all' 
    ? tools 
    : tools.filter(t => t.agent === selectedAgent);
    
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredTools = filteredTools.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      research: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-400',
      analysis: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400',
      document: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400',
      knowledge: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400',
      communication: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400',
    };
    return colors[category] || 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Agent Tools</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {tools.length} tools available across {agents.length - 1} agents
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 pl-9 pr-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-sm"
            />
          </div>
          
          {/* Agent Filter */}
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-sm"
          >
            {agents.map((agent) => (
              <option key={agent} value={agent}>
                {agent === 'all' ? 'All Agents' : agent.charAt(0).toUpperCase() + agent.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Per-Agent Summary Cards */}
      {selectedAgent === 'all' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {agents.filter(a => a !== 'all').map(agent => (
            <div 
              key={agent}
              className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 capitalize">
                  {agent}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {getEnabledCount(agent)}/{getTotalCount(agent)}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => enableAllForAgent(agent)}
                  className="flex-1 px-2 py-1 text-[10px] font-medium rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900"
                >
                  All On
                </button>
                <button
                  onClick={() => disableAllForAgent(agent)}
                  className="flex-1 px-2 py-1 text-[10px] font-medium rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                >
                  All Off
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTools.map((tool) => (
          <div
            key={tool.name}
            className={`border rounded-xl overflow-hidden transition-all ${
              isToolEnabled(tool.agent, tool.name)
                ? 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
                : 'border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 opacity-60'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {/* Enable/Disable Toggle */}
                  <button
                    onClick={() => toggleTool(tool.agent, tool.name)}
                    className={`p-0.5 rounded transition-colors ${
                      isToolEnabled(tool.agent, tool.name)
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-neutral-400 dark:text-neutral-500'
                    }`}
                    title={isToolEnabled(tool.agent, tool.name) ? 'Disable tool' : 'Enable tool'}
                  >
                    {isToolEnabled(tool.agent, tool.name) 
                      ? <ToggleRight className="w-6 h-6" /> 
                      : <ToggleLeft className="w-6 h-6" />
                    }
                  </button>
                  <Wrench className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                  <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">
                    {tool.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(tool.category)}`}>
                    {tool.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-400">
                    {tool.agent}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                {tool.description}
              </p>
              
              {/* Parameters */}
              {tool.parameters?.properties && Object.keys(tool.parameters.properties).length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Parameters:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(tool.parameters.properties).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                        title={value.description}
                      >
                        {key}: {value.type}
                        {tool.parameters.required?.includes(key) && <span className="text-red-500">*</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setEditingTool(tool)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 transition-colors"
                >
                  <Settings className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (testingTool === tool.name) {
                      setTestingTool(null);
                      setTestParams({});
                    } else {
                      setTestingTool(tool.name);
                      setTestParams({});
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 transition-colors"
                >
                  <Play className="w-3 h-3" />
                  Test
                </button>
              </div>
            </div>
            
            {/* Test Panel */}
            {testingTool === tool.name && (
              <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 bg-neutral-50 dark:bg-neutral-900">
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                  Enter test parameters (JSON values):
                </p>
                {tool.parameters?.properties && Object.entries(tool.parameters.properties).map(([key, value]) => (
                  <div key={key} className="mb-2">
                    <label className="text-xs text-neutral-500 dark:text-neutral-400">{key}</label>
                    <input
                      type="text"
                      placeholder={value.description || key}
                      value={testParams[key] || ''}
                      onChange={(e) => setTestParams({ ...testParams, [key]: e.target.value })}
                      className="w-full px-2 py-1 text-sm rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                    />
                  </div>
                ))}
                <button
                  onClick={() => executeTool(tool.name)}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors"
                >
                  <Play className="w-3 h-3" />
                  Execute
                </button>
              </div>
            )}
            
            {/* Test Result */}
            {testResult?.tool === tool.name && (
              <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 bg-green-50 dark:bg-green-900/20">
                <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-2">Result:</p>
                <pre className="text-xs text-neutral-600 dark:text-neutral-300 overflow-auto max-h-40 p-2 bg-white dark:bg-neutral-800 rounded">
                  {JSON.stringify(testResult.result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {filteredTools.length === 0 && (
        <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
          {searchQuery ? 'No tools match your search.' : 'No tools found for this agent.'}
        </div>
      )}
      
      {/* Edit Modal */}
      {editingTool && (
        <ToolEditModal
          tool={editingTool}
          onClose={() => setEditingTool(null)}
          onSave={(updates) => {
            console.log('Save tool updates:', editingTool.name, updates);
            // In a real impl, would sync to backend
            setEditingTool(null);
          }}
        />
      )}
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'agents' | 'llm' | 'tools'>('agents');
  const agentIds = Object.keys(AGENTS) as AgentId[];
  
  // Hydrate persisted stores on mount
  useHydrateStores();

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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Admin Settings</h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Manage agents and LLM configuration</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('agents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'agents' 
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            Agents
          </button>
          <button
            onClick={() => setActiveTab('llm')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'llm' 
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            LLM Providers
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'tools' 
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Tools
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto p-6">
        {activeTab === 'agents' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Global Settings - Sidebar */}
            <div className="lg:col-span-1">
              <GlobalSettings />
            </div>

            {/* Agent Settings - Main */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Agent Configuration</h2>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">{agentIds.length} agents</span>
              </div>
              
              {agentIds.map((agentId) => (
                <AgentSettingsCard key={agentId} agentId={agentId} />
              ))}
            </div>
          </div>
        ) : activeTab === 'llm' ? (
          <LLMSettings />
        ) : (
          <ToolsSettings />
        )}
      </main>
    </div>
  );
}
