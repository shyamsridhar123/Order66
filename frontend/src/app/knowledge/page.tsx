'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { 
  Database, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  FileText, 
  Tag,
  Users,
  ChevronDown,
  X,
  Upload,
  Sparkles,
  Brain,
  Target,
  BarChart3,
  Lightbulb,
  PenTool,
  BookOpen
} from 'lucide-react';
import { useKnowledgeStore, KnowledgeItem } from '@/lib/knowledgeStore';
import { AGENTS, AgentId } from '@/lib/store';

const CATEGORIES = [
  { id: 'general', label: 'General', icon: FileText },
  { id: 'framework', label: 'Framework', icon: BookOpen },
  { id: 'template', label: 'Template', icon: FileText },
  { id: 'expertise', label: 'Expertise', icon: Lightbulb },
  { id: 'engagement', label: 'Engagement', icon: Users },
  { id: 'research', label: 'Research', icon: Search },
];

const AGENT_OPTIONS = [
  { id: 'all', name: 'All Agents', icon: Users, color: 'violet' },
  { id: 'orchestrator', name: 'Orchestrator', icon: Brain, color: 'violet' },
  { id: 'strategist', name: 'Strategist', icon: Target, color: 'blue' },
  { id: 'researcher', name: 'Researcher', icon: Search, color: 'cyan' },
  { id: 'analyst', name: 'Analyst', icon: BarChart3, color: 'emerald' },
  { id: 'advisor', name: 'Advisor', icon: Lightbulb, color: 'amber' },
  { id: 'scribe', name: 'Scribe', icon: PenTool, color: 'rose' },
  { id: 'memory', name: 'Memory', icon: Database, color: 'purple' },
];

function AddKnowledgeModal({ 
  isOpen, 
  onClose,
  editItem
}: { 
  isOpen: boolean; 
  onClose: () => void;
  editItem?: KnowledgeItem | null;
}) {
  const { addItem, updateItem } = useKnowledgeStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [industry, setIndustry] = useState('');
  const [tags, setTags] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setContent(editItem.content);
      setCategory(editItem.category);
      setIndustry(editItem.industry || '');
      setTags(editItem.tags.join(', '));
      setSelectedAgents(editItem.agents);
    } else {
      setTitle('');
      setContent('');
      setCategory('general');
      setIndustry('');
      setTags('');
      setSelectedAgents([]);
    }
  }, [editItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const item = {
        title: title.trim(),
        content: content.trim(),
        category,
        industry: industry.trim() || undefined,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        agents: selectedAgents,
      };

      if (editItem) {
        await updateItem(editItem.id, item);
      } else {
        await addItem(item);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save knowledge item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAgent = (agentId: string) => {
    if (agentId === 'all') {
      setSelectedAgents([]);
    } else {
      setSelectedAgents(prev => 
        prev.includes(agentId) 
          ? prev.filter(a => a !== agentId)
          : [...prev, agentId]
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
              {editItem ? <Edit2 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {editItem ? 'Edit Knowledge Item' : 'Add Knowledge'}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {editItem ? 'Update the knowledge entry' : 'Add new knowledge for RAG retrieval'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Enter knowledge title..."
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              placeholder="Enter knowledge content that will be embedded for RAG retrieval..."
              required
            />
          </div>

          {/* Category & Industry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Industry (optional)
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="e.g., Life Sciences"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="e.g., oncology, regulatory, FDA"
            />
          </div>

          {/* Agent Assignment */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Agent Assignment
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AGENT_OPTIONS.map(agent => {
                const isSelected = agent.id === 'all' 
                  ? selectedAgents.length === 0 
                  : selectedAgents.includes(agent.id);
                const Icon = agent.icon;
                
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => toggleAgent(agent.id)}
                    className={`
                      p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5
                      ${isSelected 
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' 
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-violet-600 dark:text-violet-400' : 'text-neutral-400'}`} />
                    <span className={`text-xs font-medium ${isSelected ? 'text-violet-700 dark:text-violet-300' : 'text-neutral-600 dark:text-neutral-400'}`}>
                      {agent.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              {selectedAgents.length === 0 
                ? 'This knowledge will be available to all agents' 
                : `Available to: ${selectedAgents.join(', ')}`
              }
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Embedding...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{editItem ? 'Update' : 'Add & Embed'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function KnowledgeCard({ item, onEdit, onDelete }: { 
  item: KnowledgeItem; 
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const category = CATEGORIES.find(c => c.id === item.category);
  const CategoryIcon = category?.icon || FileText;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this knowledge item?')) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
            <CategoryIcon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{item.title}</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {category?.label || item.category}
              {item.industry && ` • ${item.industry}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3 mb-4">
        {item.content}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-xs text-neutral-600 dark:text-neutral-300"
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-neutral-400">
              +{item.tags.length - 3}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
          <Users className="w-3.5 h-3.5" />
          <span>{item.agents.length === 0 ? 'All agents' : item.agents.length}</span>
        </div>
      </div>
    </div>
  );
}

export default function KnowledgePage() {
  const { items, isLoading, error, selectedAgent, searchQuery, fetchItems, deleteItem, setSelectedAgent, setSearchQuery } = useKnowledgeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<KnowledgeItem | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.tags.some(t => t.toLowerCase().includes(query))
    );
  });

  const handleEdit = (item: KnowledgeItem) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditItem(null);
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <Header />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Knowledge Base</h1>
                <p className="text-neutral-500 dark:text-neutral-400">Manage RAG embeddings and knowledge per agent</p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Knowledge
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search knowledge base..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Agent Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap">Filter by agent:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedAgent === null
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    All
                  </button>
                  {Object.entries(AGENTS).map(([id, agent]) => (
                    <button
                      key={id}
                      onClick={() => setSelectedAgent(id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedAgent === id
                          ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {agent.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{items.length}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Items</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {items.filter(i => i.agents.length === 0).length}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Global Knowledge</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {items.filter(i => i.agents.length > 0).length}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Agent-Specific</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {new Set(items.flatMap(i => i.tags)).size}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Unique Tags</p>
                </div>
              </div>
            </div>
          </div>

          {/* Knowledge Items Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button 
                onClick={() => fetchItems()}
                className="mt-3 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                {searchQuery ? 'No matching results' : 'No knowledge items yet'}
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add your first knowledge item to get started with RAG'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Knowledge
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <KnowledgeCard
                  key={item.id}
                  item={item}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => deleteItem(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AddKnowledgeModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        editItem={editItem}
      />
    </div>
  );
}
