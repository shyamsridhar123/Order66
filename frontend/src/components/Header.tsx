'use client';

import Link from 'next/link';
import { Brain, Settings, ChevronDown, Activity, Database, Bug } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { IncognitoIndicator } from './IncognitoIndicator';

export function Header() {
  return (
    <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Nodus Copilot</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Multi-Agent Orchestration Platform</p>
          </div>
        </Link>
      </div>
      
      <div className="flex items-center gap-3">
        <IncognitoIndicator />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer transition-colors">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Life Sciences Demo</span>
          <ChevronDown className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
        </div>
        <ThemeToggle />
        <Link 
          href="/knowledge"
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Knowledge Base"
        >
          <Database className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
        </Link>
        <Link 
          href="/monitoring"
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Monitoring"
        >
          <Activity className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
        </Link>
        <Link 
          href="/debug"
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Debug Console"
        >
          <Bug className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
        </Link>
        <Link 
          href="/admin"
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Admin Settings"
        >
          <Settings className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
        </Link>
      </div>
    </header>
  );
}
