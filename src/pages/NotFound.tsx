import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';

export function NotFound() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center text-center">
      <span className="text-[--accent] mb-4">
        <Icon name="search_off" size={56} aria-hidden />
      </span>
      <h1 className="text-2xl font-bold text-[--text] mb-2">Page not found</h1>
      <p className="text-[--text-muted] mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[--accent] text-[--accent-contrast] font-medium text-sm hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus]"
      >
        <Icon name="home" size={16} />
        Back to Home
      </Link>
    </main>
  );
}
