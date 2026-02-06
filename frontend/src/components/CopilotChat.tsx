'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, FileText, TrendingUp, Users, RotateCcw, History, ThumbsUp, ThumbsDown, MessageCircle, X } from 'lucide-react';
import { useAppStore, Message } from '@/lib/store';
import { DebugPanel, DebugModeIndicator } from './DebugPanel';
import { ConversationHistory, ConversationHistoryButton } from './ConversationHistory';

const examplePrompts = [
  { icon: FileText, text: "Research Pfizer's recent acquisitions and create a competitive brief" },
  { icon: TrendingUp, text: 'Analyze Q3 performance vs. competition' },
  { icon: Users, text: 'Draft a proposal for market expansion in oncology' },
  { icon: MessageSquare, text: 'What are our compliance requirements for EU launch?' },
];

// Feedback component for assistant messages
function MessageFeedback({ messageId, onFeedback }: { messageId: string; onFeedback: (rating: 'up' | 'down', comment?: string) => void }) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = (rating: 'up' | 'down') => {
    if (feedback === rating) {
      // Toggle off
      setFeedback(null);
      setShowComment(false);
      return;
    }
    setFeedback(rating);
    if (rating === 'down') {
      setShowComment(true);
    } else {
      onFeedback(rating);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    }
  };

  const submitFeedback = () => {
    if (feedback) {
      onFeedback(feedback, comment || undefined);
      setShowComment(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    }
  };

  return (
    <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-700">
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400 dark:text-neutral-500">Was this helpful?</span>
        <button
          onClick={() => handleFeedback('up')}
          className={`p-1 rounded transition-colors ${
            feedback === 'up'
              ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400'
          }`}
          title="Helpful"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleFeedback('down')}
          className={`p-1 rounded transition-colors ${
            feedback === 'down'
              ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-red-600 dark:hover:text-red-400'
          }`}
          title="Not helpful"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>
        {submitted && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 animate-pulse">
            Thanks for feedback!
          </span>
        )}
      </div>
      
      {/* Comment box for negative feedback */}
      {showComment && (
        <div className="mt-2 space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What could be improved? (optional)"
            className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 resize-none"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowComment(false)}
              className="px-2 py-1 text-xs rounded text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              Cancel
            </button>
            <button
              onClick={submitFeedback}
              className="px-2 py-1 text-xs rounded bg-violet-600 text-white hover:bg-violet-700"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message, onFeedback }: { message: Message; onFeedback?: (rating: 'up' | 'down', comment?: string) => void }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isAssistant = message.role === 'assistant';
  
  if (isSystem) {
    return (
      <div className="flex justify-center mb-4">
        <div className="px-4 py-2 rounded-lg bg-emerald-900/20 border border-emerald-800 text-emerald-400 text-xs">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`
          max-w-[85%] rounded-2xl px-4 py-3
          ${isUser 
            ? 'bg-violet-600 text-white rounded-br-md' 
            : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-bl-md shadow-sm dark:shadow-none'
          }
        `}
      >
        {!isUser && message.isUnified && (
          <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-neutral-100 dark:border-neutral-700">
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-xs font-medium text-violet-600 dark:text-violet-400">Unified Agent Response</span>
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-2 ${isUser ? 'text-violet-200' : 'text-neutral-400'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        
        {/* Feedback for assistant messages */}
        {isAssistant && onFeedback && (
          <MessageFeedback messageId={message.id} onFeedback={onFeedback} />
        )}
      </div>
    </div>
  );
}

export function CopilotChat() {
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isProcessing, sendMessage, clearConversation, debugMode, conversationId } = useAppStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleExampleClick = (text: string) => {
    if (isProcessing) return;
    sendMessage(text);
  };

  // Find the last assistant message index to show debug panel only once
  const lastAssistantIndex = messages.map((m, i) => m.role === 'assistant' && m.isUnified ? i : -1).filter(i => i >= 0).pop();
  
  // Check if we have real conversation messages (not just system messages like debug toggle)
  const hasRealMessages = messages.some(m => m.role === 'user' || m.role === 'assistant');
  
  // Handle feedback submission
  const handleFeedback = async (messageId: string, rating: 'up' | 'down', comment?: string) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    try {
      await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          message_id: messageId,
          rating: rating === 'up' ? 1 : -1,
          comment: comment,
        }),
      });
      console.log('Feedback submitted:', { messageId, rating, comment });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  return (
    <div className="h-full flex gap-4">
      {/* History Panel */}
      {showHistory && (
        <div className="w-80 flex-shrink-0 h-full">
          <ConversationHistory onClose={() => setShowHistory(false)} />
        </div>
      )}
      
      {/* Main Chat */}
      <div className="flex-1 min-w-0 flex flex-col bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ConversationHistoryButton onClick={() => setShowHistory(!showHistory)} />
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Copilot</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Ask anything</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DebugModeIndicator />
            {hasRealMessages && (
              <button
                onClick={clearConversation}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Clear conversation"
              >
                <RotateCcw className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </button>
            )}
          </div>
        </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {!hasRealMessages ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            {/* Show system messages (like debug toggle) at the top */}
            {messages.filter(m => m.role === 'system').map((msg) => (
              <div key={msg.id} className="mb-4 w-full max-w-md">
                <div className="px-4 py-2 rounded-lg bg-emerald-900/20 border border-emerald-800 text-emerald-400 text-xs text-center">
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900 dark:to-violet-800 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
              Welcome to Nodus Copilot
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm">
              Your AI-powered assistant for multi-agent orchestration. Ask a question or try one of the examples below.
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-4">
              💡 Tip: Type <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400">--debug</code> to enable debug mode
            </p>
            <div className="w-full space-y-2">
              {examplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(prompt.text)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all text-left group"
                >
                  <prompt.icon className="w-4 h-4 text-neutral-400 group-hover:text-violet-600 dark:group-hover:text-violet-400" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-violet-700 dark:group-hover:text-violet-400">{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <MessageBubble 
                key={msg.id} 
                message={msg}
                onFeedback={msg.role === 'assistant' ? (rating, comment) => handleFeedback(msg.id, rating, comment) : undefined}
              />
            ))}
            {/* Debug panel shown separately after all messages */}
            {debugMode && !isProcessing && lastAssistantIndex !== undefined && (
              <DebugPanel />
            )}
            {isProcessing && (
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-4">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs">Agents are processing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={debugMode ? "Debug mode active • Ask anything..." : "Ask the AI team anything..."}
            className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900 outline-none transition-all text-sm"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="p-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
