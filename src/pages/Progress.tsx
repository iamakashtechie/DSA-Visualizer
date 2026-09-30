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

import { useProgressStore } from '../store/progressStore';

export function Progress() {
  const completed = useProgressStore((s) => s.completed);
  const toggleCompleted = useProgressStore((s) => s.toggleCompleted);

  const totalCompleted = Object.values(completed).filter(Boolean).length;
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[--text] mb-2">My Progress</h1>
        <p className="text-[--text-muted] text-sm">
          Track your progress across all {problems.length} problems.
          You have completed {totalCompleted} so far. Progress is stored locally in your browser.
        </p>
      </div>

      <div className="space-y-6">
        {patterns.map((pattern) => {
          const patternProblems = problems.filter((p) => p.patternSlug === pattern.slug);
          const completedCount = patternProblems.filter((p) => completed[p.id]).length;
          const percent = patternProblems.length > 0 ? (completedCount / patternProblems.length) * 100 : 0;
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
                    style={{ width: `${percent}%` }}
                    role="progressbar"
                    aria-valuenow={completedCount}
                    aria-valuemin={0}
                    aria-valuemax={patternProblems.length}
                    aria-label={`${pattern.title} progress`}
                  />
                </div>
                <span className="text-xs text-[--text-muted] shrink-0">
                  {completedCount} / {patternProblems.length}
                </span>
              </div>

              {/* Problem list */}
              <div className="space-y-1">
                {patternProblems.map((problem) => {
                  const [, problemSlug] = problem.id.split('/');
                  const isDone = completed[problem.id] || false;
                  return (
                    <div key={problem.id} className="flex items-center gap-3 py-1">
                      <button
                        onClick={() => toggleCompleted(problem.id)}
                        className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus] ${
                          isDone
                            ? 'bg-[--viz-success] border-[--viz-success] text-[--surface]'
                            : 'border-[--border] hover:border-[--text-muted]'
                        }`}
                        role="checkbox"
                        aria-checked={isDone}
                        aria-label={`Mark ${problem.title} as understood`}
                      >
                        {isDone && <Icon name="check" size={12} />}
                      </button>
                      <Link
                        to={`/pattern/${pattern.slug}/${problemSlug}`}
                        className="text-sm text-[--text] hover:text-[--accent] transition-colors flex-1 truncate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus] rounded"
                      >
                        {problem.title}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
