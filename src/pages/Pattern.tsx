import { useParams, Link, NavLink } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Icon } from '../components/Icon';

interface Problem {
  id: string;
  patternSlug: string;
  groupTitle: string;
  order: number;
  title: string;
  lcNumber?: number;
  sourceLabel: 'LeetCode' | 'GfG';
  url: string;
  description: string;
}

interface PatternData {
  slug: string;
  title: string;
  description: string;
  problemCount: number;
  groups: string[];
  templates?: string;
}

import patternsData from '../generated/patterns.json';
import problemsData from '../generated/problems.json';

const patterns = patternsData as PatternData[];
const problems = problemsData as Problem[];

export function Pattern() {
  const { patternSlug } = useParams<{ patternSlug: string }>();
  const pattern = patterns.find((p) => p.slug === patternSlug);

  if (!pattern) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-[--text-muted]">Pattern not found.</p>
        <Link to="/" className="text-[--accent] underline mt-2 inline-block">← Back to Home</Link>
      </main>
    );
  }

  const patternProblems = problems.filter((p) => p.patternSlug === patternSlug);

  // Group by groupTitle, preserving order from pattern.groups
  const groupOrder = pattern.groups.length ? pattern.groups : ['General'];
  const grouped = new Map<string, Problem[]>();
  for (const g of groupOrder) grouped.set(g, []);
  for (const p of patternProblems) {
    if (!grouped.has(p.groupTitle)) grouped.set(p.groupTitle, []);
    grouped.get(p.groupTitle)!.push(p);
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[--text-muted] mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-[--text] transition-colors">Home</Link>
        <Icon name="chevron_right" size={14} aria-hidden />
        <span className="text-[--text]">{pattern.title}</span>
      </nav>

      {/* Pattern header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[--text] mb-2">{pattern.title}</h1>
        <p className="text-[--text-muted] text-base mb-4">{pattern.description}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="accent">{pattern.problemCount} problems</Badge>
          <Badge variant="muted">{pattern.groups.length} sub-patterns</Badge>
        </div>
      </div>

      {/* Binary Search: show templates */}
      {pattern.templates && (
        <section className="mb-8 p-4 bg-[--surface] border border-[--border] rounded-xl">
          <h2 className="text-sm font-semibold text-[--text] mb-3 flex items-center gap-2">
            <Icon name="code" size={16} className="text-[--accent]" />
            Templates
          </h2>
          <pre className="text-xs text-[--text-muted] overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
            {pattern.templates}
          </pre>
        </section>
      )}

      {/* Problems by group */}
      <section>
        <h2 className="text-sm font-semibold text-[--text-muted] uppercase tracking-wider mb-4">
          Problems by Sub-Pattern
        </h2>
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([groupTitle, groupProblems]) => {
            if (!groupProblems.length) return null;
            return (
              <div key={groupTitle}>
                <h3 className="text-sm font-semibold text-[--text] mb-3 pb-2 border-b border-[--border]">
                  {groupTitle}
                </h3>
                <div className="space-y-2">
                  {groupProblems.map((problem) => {
                    const [, problemSlug] = problem.id.split('/');
                    return (
                      <NavLink
                        key={problem.id}
                        to={`/pattern/${patternSlug}/${problemSlug}`}
                        className={({ isActive }) =>
                          `group flex items-center gap-3 p-3 rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus] ${
                            isActive
                              ? 'bg-[--surface-2] border-[--accent]/30'
                              : 'bg-[--surface] border-[--border] hover:border-[--accent]/30 hover:bg-[--surface-2]'
                          }`
                        }
                      >
                        {/* Order number */}
                        <span className="text-xs text-[--text-muted] w-6 shrink-0 text-right font-mono">
                          {problem.order}
                        </span>

                        {/* Title */}
                        <span className="flex-1 text-sm font-medium text-[--text] truncate">
                          {problem.title}
                        </span>

                        {/* LC number */}
                        {problem.lcNumber && (
                          <span className="text-xs text-[--text-muted] shrink-0">#{problem.lcNumber}</span>
                        )}

                        {/* Coming soon badge */}
                        <Badge variant="muted" size="sm">
                          <Icon name="schedule" size={10} />
                          Visualization soon
                        </Badge>

                        {/* Source link */}
                        {problem.url && (
                          <a
                            href={problem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${problem.sourceLabel} link for ${problem.title}`}
                            onClick={(e) => e.stopPropagation()}
                            className="shrink-0 text-xs text-[--text-muted] hover:text-[--accent] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus] rounded"
                          >
                            <Icon name="open_in_new" size={14} />
                          </a>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
