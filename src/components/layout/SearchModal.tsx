import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import { Search, CornerDownLeft, Sparkles } from 'lucide-react';
import type { SearchResult } from '../../services/search/searchTypes';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const { query, setQuery, results } = useGlobalSearch();
  const [activeIndex, setActiveIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setActiveIndex(0);
      setQuery('');
    }
  }, [isOpen, setQuery]);

  // Handle global key events (Esc to close, Arrow keys, Enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[activeIndex]) {
          handleSelect(results[activeIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, activeIndex, onClose]);

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSelect = (result: SearchResult) => {
    onClose();
    // Navigate to page. Depending on entity we can append search queries or navigate to the list
    navigate(result.route);
  };

  if (!isOpen) return null;

  // Group results by entityType for display
  const groups: Record<string, SearchResult[]> = {};
  results.forEach((res) => {
    const type = res.entityType;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(res);
  });

  // Keep a flat list mapping to retrieve activeIndex item index quickly
  const flatDisplayList: SearchResult[] = [];
  const renderedGroups = Object.entries(groups).map(([type, items]) => {
    const startIdx = flatDisplayList.length;
    flatDisplayList.push(...items);

    return (
      <div key={type} className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-emerald px-2">
          {type === 'ModuleEntry' ? 'Custom Module Logs' : `${type}s`}
        </h4>
        <div className="space-y-1">
          {items.map((item, idx) => {
            const currentFlatIdx = startIdx + idx;
            const isActive = currentFlatIdx === activeIndex;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setActiveIndex(currentFlatIdx)}
                className={`w-full text-left flex items-center justify-between p-3.5 rounded-2xl border text-sm transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-brand-emerald/10 border-brand-emerald/30 shadow-subtle'
                    : 'bg-transparent border-transparent hover:bg-brand-border/40'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-brand-text truncate">{item.title}</p>
                  <p className="text-xs text-brand-text-muted mt-0.5 truncate flex items-center gap-1.5">
                    {item.date && <span className="font-mono text-[10px] bg-brand-border px-1.5 py-0.5 rounded-md">{item.date}</span>}
                    <span>{item.matchedText}</span>
                  </p>
                </div>
                {isActive && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-brand-emerald bg-brand-emerald-light/30 px-2 py-1 rounded-md border border-brand-emerald/10 animate-fade-in">
                    Select <CornerDownLeft className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  });

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-start justify-center pt-[12vh] p-4 animate-fade-in"
    >
      <div
        ref={containerRef}
        className="w-full max-w-2xl bg-brand-bg-card border border-brand-border rounded-3xl shadow-soft overflow-hidden flex flex-col max-h-[70vh] scale-98 hover:scale-100 transition-all duration-200"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-6 py-4.5 border-b border-brand-border bg-brand-bg-card">
          <Search className="w-5 h-5 text-brand-text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks, expenses, memories, collections, and custom modules..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none text-brand-text placeholder-brand-text-muted/60 focus:outline-none text-base"
          />
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 max-h-[50vh]">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-brand-text-muted space-y-2">
              <Sparkles className="w-8 h-8 text-brand-emerald/40 mx-auto animate-pulse" />
              <p className="text-sm font-medium">Type to search anything in your Padhivu workbook</p>
              <p className="text-xs text-brand-text-muted/70">Fuzzy matching active for category, tags, notes, and custom entries</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-brand-text-muted space-y-1">
              <p className="text-sm font-medium">No results found for "{query}"</p>
              <p className="text-xs text-brand-text-muted/70">Try searching for generic category names or tags</p>
            </div>
          ) : (
            renderedGroups
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-6 py-3 border-t border-brand-border bg-brand-bg flex items-center justify-between text-[10px] text-brand-text-muted font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><kbd className="bg-brand-border px-1.5 py-0.5 rounded-md border border-brand-border">esc</kbd> close</span>
            <span className="flex items-center gap-1"><kbd className="bg-brand-border px-1.5 py-0.5 rounded-md border border-brand-border">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-brand-border px-1.5 py-0.5 rounded-md border border-brand-border">enter</kbd> select</span>
          </div>
          <span className="text-brand-emerald">Local Search Index</span>
        </div>
      </div>
    </div>
  );
}
