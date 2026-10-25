import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KnowledgeArticle } from '../../types';
import { BookOpen, Search, Eye, ThumbsUp, Calendar, User, X, Check } from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const { knowledgeArticles } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [readingArticle, setReadingArticle] = useState<KnowledgeArticle | null>(null);
  const [votedArticles, setVotedArticles] = useState<Record<number, boolean>>({});

  const categories = ['all', 'Network & Remote Access', 'HelpDesk & Equipment Policies', 'Email & Accounts'];

  const filteredArticles = knowledgeArticles.filter((a) => {
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleVote = (id: number) => {
    setVotedArticles((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          IT Self-Service Knowledge Base
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Guides, troubleshooting walkthroughs, software installation, and IT operational policies.
        </p>
      </div>

      {/* Search & Categories Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides, VPN setup, error codes, printer issues..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Guides' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            onClick={() => setReadingArticle(article)}
            className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                <span className="text-blue-600 dark:text-blue-400">{article.category}</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {article.views} views
                </span>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors leading-snug">
                {article.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                {article.summary}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                {article.author}
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:underline">
                Read Guide →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Read Article Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
              <span className="text-[10px] uppercase font-extrabold text-blue-600 tracking-wider">
                {readingArticle.category}
              </span>
              <button
                onClick={() => setReadingArticle(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {readingArticle.title}
                </h2>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                  <span>Author: {readingArticle.author}</span>
                  <span>•</span>
                  <span>Updated: {readingArticle.last_updated}</span>
                  <span>•</span>
                  <span>{readingArticle.views} Total Views</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {readingArticle.summary}
              </div>

              <div className="text-xs text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap leading-relaxed space-y-2 border-t border-slate-100 dark:border-slate-700/60 pt-4">
                {readingArticle.content}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">
                Was this IT guide helpful?
              </span>
              <button
                onClick={() => handleVote(readingArticle.id)}
                disabled={votedArticles[readingArticle.id]}
                className="px-4 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                {votedArticles[readingArticle.id] ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Thanks for feedback!</span>
                  </>
                ) : (
                  <>
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Yes, helpful ({readingArticle.helpful_count})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
