'use client';

import { Shield, ShieldOff, Cloud } from 'lucide-react';
import { useLLMStore } from '@/lib/llmStore';
import { useEffect, useState } from 'react';

export function IncognitoIndicator() {
  const [mounted, setMounted] = useState(false);
  const { getActiveProvider, isLocalMode } = useLLMStore();
  
  useEffect(() => {
    // Hydrate persisted store
    useLLMStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800">
        <div className="w-4 h-4 bg-neutral-300 dark:bg-neutral-600 rounded animate-pulse" />
        <div className="w-16 h-4 bg-neutral-300 dark:bg-neutral-600 rounded animate-pulse" />
      </div>
    );
  }

  const provider = getActiveProvider();
  const isLocal = isLocalMode();

  if (isLocal) {
    return (
      <div 
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 cursor-default"
        title={`Local Mode: ${provider?.name || 'Ollama'}\nYour data stays on your machine`}
      >
        <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Local</span>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-800 cursor-default"
      title={`Cloud Mode: ${provider?.name || 'OpenAI'}\nData sent to external API`}
    >
      <Cloud className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Cloud</span>
    </div>
  );
}
