import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';

interface Pattern {
  slug: string;
  title: string;
  description: string;
  problemCount: number;
  groups: string[];
}

// Static import — generated at build time
import patternsData from '../generated/patterns.json';
import problemsData from '../generated/problems.json';

const patterns = patternsData as Pattern[];

const PATTERN_ICONS: Record<string, string> = {
  'two-pointer': 'compare_arrows',
  'sliding-window': 'view_carousel',
  'binary-search': 'manage_search',
  'backtracking': 'account_tree',
  'greedy': 'trending_up',
  'bit-manipulation': 'memory',
  'graph': 'hub',
  'dp': 'table_chart',
};

const PATTERN_COLORS: Record<string, string> = {
  'two-pointer': 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
  'sliding-window': 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
  'binary-search': 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
  'backtracking': 'from-orange-500/10 to-orange-500/5 border-orange-500/20',
  'greedy': 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20',
  'bit-manipulation': 'from-red-500/10 to-red-500/5 border-red-500/20',
  'graph': 'from-teal-500/10 to-teal-500/5 border-teal-500/20',
  'dp': 'from-indigo-500/10 to-indigo-500/5 border-indigo-500/20',
};

const PATTERN_ICON_COLORS: Record<string, string> = {
  'two-pointer': 'text-blue-500',
  'sliding-window': 'text-purple-500',
  'binary-search': 'text-emerald-500',
  'backtracking': 'text-orange-500',
  'greedy': 'text-yellow-500',
  'bit-manipulation': 'text-red-500',
  'graph': 'text-teal-500',
  'dp': 'text-indigo-500',
};

export function Home() {
  const totalProblems = (problemsData as unknown[]).length;

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* Hero */}
      <section className="text-center mb-14">
        <h1 className="text-3xl sm:text-4xl font-bold text-[--text] mb-4 leading-tight">
          Master DSA Patterns Through
          <br />
          <span className="text-[--accent]">Step-by-Step Visualizations</span>
        </h1>
        <p className="text-[--text-muted] text-base sm:text-lg max-w-2xl mx-auto mb-6">
          {totalProblems} C++ problems across 8 core patterns. See every pointer move, every
          decision — line by line.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/pattern/two-pointer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[--accent] text-[--accent-contrast] font-medium text-sm hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus]"
          >
            Start with Two Pointer
            <Icon name="arrow_forward" size={16} />
          </Link>
          <Link
            to="/progress"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[--surface-2] text-[--text] font-medium text-sm hover:bg-[--border] transition-colors border border-[--border] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus]"
          >
            <Icon name="bar_chart" size={16} />
            My Progress
          </Link>
        </div>
      </section>

      {/* Pattern cards */}
      <section aria-label="DSA Patterns">
        <h2 className="text-sm font-semibold text-[--text-muted] uppercase tracking-wider mb-5">
          8 Core Patterns
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {patterns.map((pattern) => {
            const color = PATTERN_COLORS[pattern.slug] ?? 'from-gray-500/10 to-gray-500/5 border-gray-500/20';
            const iconColor = PATTERN_ICON_COLORS[pattern.slug] ?? 'text-[--accent]';
            const icon = PATTERN_ICONS[pattern.slug] ?? 'code';

            return (
              <Link
                key={pattern.slug}
                to={`/pattern/${pattern.slug}`}
                className={`group relative flex flex-col p-5 rounded-xl border bg-gradient-to-br ${color} hover:shadow-md transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus]`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`flex items-center justify-center w-10 h-10 rounded-lg bg-[--bg]/60 ${iconColor}`}>
                    <Icon name={icon} size={22} />
                  </span>
                  <span className="text-xs font-medium text-[--text-muted] bg-[--bg]/60 px-2 py-0.5 rounded-full">
                    {pattern.problemCount} problems
                  </span>
                </div>

                <h3 className="font-semibold text-[--text] mb-1.5 text-sm">{pattern.title}</h3>
                <p className="text-xs text-[--text-muted] leading-relaxed flex-1">{pattern.description}</p>

                <div className="flex items-center gap-1 mt-4 text-xs font-medium text-[--accent] group-hover:gap-2 transition-all">
                  Explore pattern
                  <Icon name="arrow_forward" size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick stats */}
      <section className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Problems', value: totalProblems },
          { label: 'Patterns', value: 8 },
          { label: 'Renderers', value: 8 },
          { label: 'Flagships', value: 41 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[--surface] border border-[--border] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[--accent]">{value}</div>
            <div className="text-xs text-[--text-muted] mt-1">{label}</div>
          </div>
        ))}
      </section>
    </main>
  );
}
