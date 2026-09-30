import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { CodePanel } from '../components/CodePanel';
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
  approach?: string;
  cpp: string;
  time?: string;
  space?: string;
  complexityRaw?: string;
}

interface PatternData {
  slug: string;
  title: string;
}

import patternsData from '../generated/patterns.json';
import problemsData from '../generated/problems.json';

const patterns = patternsData as PatternData[];
const problems = problemsData as Problem[];

type Tab = 'code' | 'notes';

export function Problem() {
  const { patternSlug, problemSlug } = useParams<{ patternSlug: string; problemSlug: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('code');

  const problem = problems.find((p) => p.id === `${patternSlug}/${problemSlug}`);
  const pattern = patterns.find((p) => p.slug === patternSlug);

  if (!problem || !pattern) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-[--text-muted] mb-4">Problem not found.</p>
        <Link to={`/pattern/${patternSlug}`} className="text-[--accent] underline">
          ← Back to {pattern?.title ?? 'Pattern'}
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[--text-muted] mb-5 flex-wrap" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-[--text] transition-colors">Home</Link>
        <Icon name="chevron_right" size={14} aria-hidden />
        <Link to={`/pattern/${patternSlug}`} className="hover:text-[--text] transition-colors">
          {pattern.title}
        </Link>
        <Icon name="chevron_right" size={14} aria-hidden />
        <span className="text-[--text] truncate max-w-[200px]">{problem.title}</span>
      </nav>

      {/* Problem header */}
      <div className="mb-6">
        <div className="flex items-start gap-3 flex-wrap mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-[--text] flex-1 min-w-0">{problem.title}</h1>
          {problem.url && (
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[--border] bg-[--surface] text-xs font-medium text-[--text-muted] hover:text-[--accent] hover:border-[--accent]/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus]"
            >
              <Icon name="open_in_new" size={13} />
              {problem.sourceLabel}
              {problem.lcNumber ? ` #${problem.lcNumber}` : ''}
            </a>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="accent">{pattern.title}</Badge>
          <Badge variant="muted">{problem.groupTitle}</Badge>
          {problem.time && (
            <Badge variant="muted">
              <span className="text-[--text-muted]">Time:</span>&nbsp;{problem.time}
            </Badge>
          )}
          {problem.space && (
            <Badge variant="muted">
              <span className="text-[--text-muted]">Space:</span>&nbsp;{problem.space}
            </Badge>
          )}
        </div>
      </div>

      {/* Two-column layout on desktop */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Visualization stage */}
        <div className="lg:w-[58%] lg:shrink-0">
          {/* Visualization coming soon */}
          <div className="rounded-xl border border-[--border] border-dashed bg-[--surface] flex flex-col items-center justify-center text-center py-16 px-6 mb-4">
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[--surface-2] text-[--accent] mb-4">
              <Icon name="play_circle" size={32} />
            </span>
            <h2 className="text-base font-semibold text-[--text] mb-2">Visualization Coming Soon</h2>
            <p className="text-sm text-[--text-muted] max-w-xs">
              Step-by-step animation of this algorithm will be available in a future milestone.
              The C++ code and explanation are available now.
            </p>
          </div>

          {/* Description */}
          {problem.description && (
            <div className="p-4 rounded-xl bg-[--surface] border border-[--border]">
              <h2 className="text-sm font-semibold text-[--text] mb-2">Problem</h2>
              <p className="text-sm text-[--text-muted] leading-relaxed">{problem.description}</p>
            </div>
          )}
        </div>

        {/* Right: Tabs — Code / Notes */}
        <div className="flex-1 min-w-0">
          {/* Tab bar */}
          <div
            className="flex border-b border-[--border] mb-4"
            role="tablist"
            aria-label="Problem content tabs"
          >
            {(['code', 'notes'] as Tab[]).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`tab-panel-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-[--focus] -mb-px ${
                  activeTab === tab
                    ? 'border-[--accent] text-[--accent]'
                    : 'border-transparent text-[--text-muted] hover:text-[--text]'
                }`}
              >
                {tab === 'code' ? 'Code' : 'Notes'}
              </button>
            ))}
          </div>

          {/* Code tab */}
          <div
            id="tab-panel-code"
            role="tabpanel"
            aria-labelledby="tab-code"
            hidden={activeTab !== 'code'}
          >
            {problem.cpp ? (
              <CodePanel code={problem.cpp} language="cpp" />
            ) : (
              <p className="text-sm text-[--text-muted]">No code available.</p>
            )}
          </div>

          {/* Notes tab */}
          <div
            id="tab-panel-notes"
            role="tabpanel"
            aria-labelledby="tab-notes"
            hidden={activeTab !== 'notes'}
          >
            <div className="space-y-4">
              {problem.description && (
                <section>
                  <h3 className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider mb-2">
                    Description
                  </h3>
                  <p className="text-sm text-[--text] leading-relaxed">{problem.description}</p>
                </section>
              )}

              {problem.approach && (
                <section>
                  <h3 className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider mb-2">
                    Approach / Intuition
                  </h3>
                  <p className="text-sm text-[--text] leading-relaxed">{problem.approach}</p>
                </section>
              )}

              {(problem.time || problem.space) && (
                <section>
                  <h3 className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider mb-2">
                    Complexity
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    {problem.time && (
                      <div className="px-3 py-2 bg-[--surface] border border-[--border] rounded-lg">
                        <div className="text-xs text-[--text-muted] mb-0.5">Time</div>
                        <div className="text-sm font-mono font-medium text-[--text]">{problem.time}</div>
                      </div>
                    )}
                    {problem.space && (
                      <div className="px-3 py-2 bg-[--surface] border border-[--border] rounded-lg">
                        <div className="text-xs text-[--text-muted] mb-0.5">Space</div>
                        <div className="text-sm font-mono font-medium text-[--text]">{problem.space}</div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {problem.url && (
                <section>
                  <h3 className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider mb-2">
                    Source
                  </h3>
                  <a
                    href={problem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[--border] bg-[--surface] text-sm text-[--accent] hover:border-[--accent]/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus]"
                  >
                    <Icon name="open_in_new" size={14} />
                    {problem.sourceLabel}
                    {problem.lcNumber ? ` — Problem #${problem.lcNumber}` : ''}: {problem.title}
                  </a>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
