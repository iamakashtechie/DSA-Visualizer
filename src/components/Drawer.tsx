import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from './Icon';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  patterns: Array<{ slug: string; label: string }>;
}

export function Drawer({ open, onClose, patterns }: DrawerProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Focus trap — focus the close button when opened
  useEffect(() => {
    if (open) {
      ref.current?.querySelector<HTMLElement>('button')?.focus();
    }
  }, [open]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 bg-[--bg] border-l border-[--border] flex flex-col lg:hidden transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-[--border] shrink-0">
          <span className="font-semibold text-[--text] text-sm">Patterns</span>
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-[--text-muted] hover:text-[--text] hover:bg-[--surface-2] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus]"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Pattern links">
          {patterns.map((p) => (
            <NavLink
              key={p.slug}
              to={`/pattern/${p.slug}`}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus] ${
                  isActive
                    ? 'bg-[--accent] text-[--accent-contrast]'
                    : 'text-[--text] hover:bg-[--surface-2]'
                }`
              }
            >
              {p.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-[--border] shrink-0">
          <NavLink
            to="/progress"
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-[--text-muted] hover:text-[--text] transition-colors"
          >
            <Icon name="bar_chart" size={18} />
            Progress
          </NavLink>
        </div>
      </div>
    </>
  );
}
