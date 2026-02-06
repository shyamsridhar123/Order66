/**
 * ConversationHistory - Shows past conversations with ability to load/delete
 */
'use client';

import { useState, useEffect } from 'react';
import { 
  History, Trash2, Download, Upload, Search, 
  MessageSquare, Bug, Clock, ChevronRight, X 
} from 'lucide-react';
import { useHistoryStore, SavedConversation } from '@/lib/historyStore';
import { useAppStore } from '@/lib/store';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function ConversationItem({ 
  conv, 
  onLoad, 
  onDelete,
  isActive 
}: { 
  conv: SavedConversation; 
  onLoad: () => void;
  onDelete: () => void;
  isActive: boolean;
}) {
  const msgCount = conv.messages.filter(m => m.role !== 'system').length;
  const toolCount = conv.toolCalls?.length || 0;
  
  return (
    <div 
      className={`
        group p-3 rounded-lg border cursor-pointer transition-all
        ${isActive 
          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' 
          : 'border-neutral-200 dark:border-neutral-700 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-neutral-50 dark:hover:bg-neutral-800'
        }
      `}
      onClick={onLoad}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
            {conv.title}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {msgCount}
            </span>
            {toolCount > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {toolCount} tools
              </span>
            )}
            {conv.debugMode && (
              <span className="flex items-center gap-1 text-emerald-500">
                <Bug className="w-3 h-3" />
                Debug
              </span>
            )}
          </div>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
            {formatDate(conv.updatedAt)}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-400 hover:text-red-600 transition-all"
          title="Delete conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ConversationHistory({ onClose }: { onClose?: () => void }) {
  const { conversations, deleteConversation, clearAllHistory, exportHistory, importHistory, _hasHydrated } = useHistoryStore();
  const { conversationId, loadConversation, clearConversation } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showImport, setShowImport] = useState(false);
  
  // Hydrate persisted store on mount
  useEffect(() => {
    useHistoryStore.persist.rehydrate();
  }, []);
  
  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const handleExport = () => {
    const json = exportHistory();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nodus-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const json = event.target?.result as string;
        if (importHistory(json)) {
          setShowImport(false);
        } else {
          alert('Invalid history file format');
        }
      };
      reader.readAsText(file);
    }
  };
  
  const handleLoad = (id: string) => {
    loadConversation(id);
    onClose?.();
  };
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Conversation History
          </h2>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            ({conversations.length})
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        )}
      </div>
      
      {/* Search & Actions */}
      <div className="flex-shrink-0 p-3 border-b border-neutral-200 dark:border-neutral-800 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { clearConversation(); onClose?.(); }}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
          >
            New Chat
          </button>
          <button
            onClick={handleExport}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
            title="Export history"
          >
            <Download className="w-4 h-4" />
          </button>
          <label className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors cursor-pointer" title="Import history">
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>
      
      {/* Conversations List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <History className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-2" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {searchQuery ? 'No matching conversations' : 'No conversation history yet'}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              Your conversations will appear here
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              isActive={conv.id === conversationId}
              onLoad={() => handleLoad(conv.id)}
              onDelete={() => deleteConversation(conv.id)}
            />
          ))
        )}
      </div>
      
      {/* Footer */}
      {conversations.length > 0 && (
        <div className="flex-shrink-0 p-3 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => {
              if (confirm('Clear all conversation history? This cannot be undone.')) {
                clearAllHistory();
              }
            }}
            className="w-full px-3 py-2 text-xs rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Clear All History
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * ConversationHistoryButton - Toggle button for history panel
 */
export function ConversationHistoryButton({ onClick }: { onClick: () => void }) {
  const { conversations, _hasHydrated } = useHistoryStore();
  
  // Hydrate on mount
  useEffect(() => {
    useHistoryStore.persist.rehydrate();
  }, []);
  
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      title="Conversation History"
    >
      <History className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
      {_hasHydrated && conversations.length > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] flex items-center justify-center">
          {conversations.length > 9 ? '9+' : conversations.length}
        </span>
      )}
    </button>
  );
}
