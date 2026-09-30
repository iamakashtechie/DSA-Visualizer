import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import problemsData from '../generated/problems.json';

interface Problem {
  id: string;
  patternSlug: string;
  title: string;
  groupTitle: string;
}

const problems = problemsData as Problem[];

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const filtered = query.trim() === ''
    ? []
    : problems.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.groupTitle.toLowerCase().includes(query.toLowerCase()) ||
        p.patternSlug.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered.length > 0) {
          const p = filtered[selectedIndex];
          const [, slug] = p.id.split('/');
          navigate(`/pattern/${p.patternSlug}/${slug}`);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filtered, selectedIndex, navigate, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[--bg]/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[--surface] border border-[--border] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center px-4 py-3 border-b border-[--border]">
          <Icon name="search" size={20} className="text-[--text-muted]" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none px-3 py-1 text-[--text] placeholder:text-[--text-muted]"
            placeholder="Search problems..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={onClose}
            className="text-[--text-muted] hover:text-[--text] px-2 py-1 text-xs rounded border border-[--border]"
          >
            ESC
          </button>
        </div>

        {query && (
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-[--text-muted] text-sm">
                No problems found for "{query}"
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {filtered.map((p, i) => {
                  const [, slug] = p.id.split('/');
                  return (
                    <button
                      key={p.id}
                      className={`flex flex-col items-start px-4 py-3 rounded-lg text-left transition-colors ${
                        i === selectedIndex
                          ? 'bg-[--accent] text-[--accent-contrast]'
                          : 'hover:bg-[--surface-2] text-[--text]'
                      }`}
                      onClick={() => {
                        navigate(`/pattern/${p.patternSlug}/${slug}`);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(i)}
                    >
                      <div className={`font-medium ${i === selectedIndex ? 'text-[--accent-contrast]' : 'text-[--text]'}`}>
                        {p.title}
                      </div>
                      <div className={`text-xs mt-0.5 ${i === selectedIndex ? 'text-[--accent-contrast]/80' : 'text-[--text-muted]'}`}>
                        {p.groupTitle} • {p.patternSlug.replace('-', ' ')}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
