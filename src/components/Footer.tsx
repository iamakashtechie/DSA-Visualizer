import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[--border] bg-[--surface]">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[--text-muted]">
        <p>
          <span className="font-semibold text-[--accent]">DSA Visualizer</span>
          {' '}— Learn patterns through step-by-step C++ visualizations
        </p>
        <nav className="flex gap-4" aria-label="Footer links">
          <Link to="/progress" className="hover:text-[--text] transition-colors">Progress</Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[--text] transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
