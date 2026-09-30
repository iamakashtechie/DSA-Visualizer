import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import problemsData from '../generated/problems.json';
import patternsData from '../generated/patterns.json';

interface Problem {
  id: string;
  patternSlug: string;
  title: string;
}

interface PatternData {
  slug: string;
  title: string;
  problemCount: number;
}

const problems = problemsData as Problem[];
const patterns = patternsData as PatternData[];

export function Progress() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[--text] mb-2">My Progress</h1>
        <p className="text-[--text-muted] text-sm">
          Track your progress across all {problems.length} problems.
          Progress is stored locally in your browser.
        </p>
      </div>

      <div className="space-y-6">
        {patterns.map((pattern) => {
          const patternProblems = problems.filter((p) => p.patternSlug === pattern.slug);
          return (
            <section key={pattern.slug} className="bg-[--surface] border border-[--border] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[--text]">{pattern.title}</h2>
                <Link
                  to={`/pattern/${pattern.slug}`}
                  className="flex items-center gap-1 text-xs text-[--accent] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus] rounded"
                >
                  View all <Icon name="arrow_forward" size={12} />
                </Link>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-1.5 bg-[--surface-2] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[--accent] rounded-full transition-all"
                    style={{ width: '0%' }}
                    role="progressbar"
                    aria-valuenow={0}
                    aria-valuemin={0}
                    aria-valuemax={patternProblems.length}
                    aria-label={`${pattern.title} progress`}
                  />
                </div>
                <span className="text-xs text-[--text-muted] shrink-0">
                  0 / {patternProblems.length}
                </span>
              </div>

              {/* Problem list */}
              <div className="space-y-1">
                {patternProblems.slice(0, 5).map((problem) => {
                  const [, problemSlug] = problem.id.split('/');
                  return (
                    <div key={problem.id} className="flex items-center gap-3 py-1">
                      <div
                        className="w-4 h-4 rounded border-2 border-[--border] shrink-0"
                        role="checkbox"
                        aria-checked="false"
                        aria-label={`Mark ${problem.title} as understood`}
                      />
                      <Link
                        to={`/pattern/${pattern.slug}/${problemSlug}`}
                        className="text-sm text-[--text] hover:text-[--accent] transition-colors flex-1 truncate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus] rounded"
                      >
                        {problem.title}
                      </Link>
                    </div>
                  );
                })}
                {patternProblems.length > 5 && (
                  <Link
                    to={`/pattern/${pattern.slug}`}
                    className="text-xs text-[--text-muted] hover:text-[--accent] transition-colors pt-1 inline-block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus] rounded"
                  >
                    +{patternProblems.length - 5} more →
                  </Link>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
