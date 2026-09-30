import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
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

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    </>
  );
}
