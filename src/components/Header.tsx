import { Link, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Icon } from './Icon';
import { Drawer } from './Drawer';

const PATTERNS = [
  { slug: 'two-pointer', label: 'Two Pointer' },
  { slug: 'sliding-window', label: 'Sliding Window' },
  { slug: 'binary-search', label: 'Binary Search' },
  { slug: 'backtracking', label: 'Backtracking' },
  { slug: 'greedy', label: 'Greedy' },
  { slug: 'bit-manipulation', label: 'Bit Manipulation' },
  { slug: 'graph', label: 'Graph' },
  { slug: 'dp', label: 'Dynamic Programming' },
];

import { SearchModal } from './SearchModal';

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && Math.max(e.key.toLowerCase().charCodeAt(0), 'k'.charCodeAt(0)) === 'k'.charCodeAt(0) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[--bg]/90 backdrop-blur border-b border-[--border]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-[--text] text-sm shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus] rounded"
          >
            <span className="text-[--accent] font-bold text-base">DSA</span>
            <span className="text-[--text-muted] hidden sm:inline">Visualizer</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-4 flex-1 overflow-hidden" aria-label="Patterns">
            {PATTERNS.map((p) => (
              <NavLink
                key={p.slug}
                to={`/pattern/${p.slug}`}
                className={({ isActive }) =>
                  `px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus] ${
                    isActive
                      ? 'bg-[--accent] text-[--accent-contrast]'
                      : 'text-[--text-muted] hover:text-[--text] hover:bg-[--surface-2]'
                  }`
                }
              >
                {p.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex-1 lg:hidden" />

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 mr-2 rounded-lg border border-[--border] bg-[--surface-2] text-[--text-muted] text-sm hover:text-[--text] hover:border-[--text-muted]/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus]"
            >
              <Icon name="search" size={16} />
              <span>Search...</span>
              <kbd className="hidden sm:inline-block ml-2 text-[10px] font-sans font-semibold bg-[--surface] border border-[--border] rounded px-1.5 py-0.5">
                {navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'}
              </kbd>
            </button>
            <button
              className="lg:hidden flex items-center justify-center w-9 h-9 mr-1 rounded-lg text-[--text-muted] hover:text-[--text] hover:bg-[--surface-2] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus]"
              onClick={() => setSearchOpen(true)}
            >
              <Icon name="search" size={20} />
            </button>
            <ThemeToggle />
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-[--text-muted] hover:text-[--text] hover:bg-[--surface-2] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus]"
              aria-label="Open navigation menu"
              onClick={() => setDrawerOpen(true)}
            >
              <Icon name="menu" size={20} />
            </button>
          </div>
        </div>
      </header>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} patterns={PATTERNS} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
