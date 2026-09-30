import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CodePanel } from '../components/CodePanel';
import { Badge } from '../components/Badge';
import { Icon } from '../components/Icon';
import { usePlayerStore } from '../store/playerStore';
import { useProgressStore } from '../store/progressStore';
import { traceRegistry } from '../traces/registry';
import { createL } from '../traces/lib/lineResolver';
import { collectSteps } from '../traces/lib/helpers';
import { ArrayPointersRenderer } from '../renderers/array-pointers/ArrayPointersRenderer';
import { LinkedListRenderer } from '../renderers/linked-list/LinkedListRenderer';
import { DPTableRenderer } from '../renderers/dp-table/DPTableRenderer';
import { IntervalTimelineRenderer } from '../renderers/interval-timeline/IntervalTimelineRenderer';
import { GridBoardRenderer } from '../renderers/grid-board/GridBoardRenderer';
import { RecursionTreeRenderer } from '../renderers/recursion-tree/RecursionTreeRenderer';
import { GraphViewRenderer } from '../renderers/graph-view/GraphViewRenderer';
import { BitGridRenderer } from '../renderers/bit-grid/BitGridRenderer';
import { SidePanels } from '../renderers/panels/SidePanels';
import { Player } from '../components/Player';
import { VariablesPanel } from '../components/VariablesPanel';
import { CustomInputPanel } from '../components/CustomInputPanel';

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

  const problemId = `${patternSlug}/${problemSlug}`;
  const problem = problems.find((p) => p.id === problemId);
  const pattern = patterns.find((p) => p.slug === patternSlug);

  const traceModule = traceRegistry[problemId];

  const setSteps = usePlayerStore((s) => s.setSteps);
  const reset = usePlayerStore((s) => s.reset);
  const stepIndex = usePlayerStore((s) => s.stepIndex);
  const steps = usePlayerStore((s) => s.steps);
  const seek = usePlayerStore((s) => s.seek);

  const completed = useProgressStore((s) => s.completed[problemId] || false);
  const toggleCompleted = useProgressStore((s) => s.toggleCompleted);

  const [searchParams, setSearchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [customInput, setCustomInput] = useState<any>(null);
  const [urlInputError, setUrlInputError] = useState(false);

  useEffect(() => {
    if (!traceModule || !problem?.cpp) {
      reset();
      return;
    }
    try {
      const L = createL(problem.cpp);
      
      let inputToUse = traceModule.defaultInput;
      const inputParam = searchParams.get('input');
      // let urlHasError = false;
      if (inputParam) {
        try {
          // searchParams.get() already decodes the URI component
          // Additionally, backward compatibility check: if it starts with %7B it might be double encoded, but JSON.parse will throw and we handle it
          let parsed;
          try {
            parsed = JSON.parse(inputParam);
          } catch (e) {
            // Try decoding once more in case it was double encoded by the older implementation
            parsed = JSON.parse(decodeURIComponent(inputParam));
          }
          inputToUse = parsed;
          if (customInput === null) {
            setCustomInput(inputToUse);
          }
          setUrlInputError(false);
        } catch (e) {
          console.error("Invalid custom input in URL:", e);
          setUrlInputError(true);
        }
      } else if (customInput) {
        inputToUse = customInput;
        setUrlInputError(false);
      } else {
        setCustomInput(traceModule.defaultInput);
        setUrlInputError(false);
      }

      const generator = traceModule.run(inputToUse, L);
      const { steps, capped } = collectSteps(generator);
      setSteps(steps, capped);

      const stepParam = searchParams.get('step');
      if (stepParam) {
        const parsed = parseInt(stepParam, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < steps.length) {
          seek(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to run trace:', err);
      reset();
    }
    return () => reset();
  }, [traceModule, problem, reset, setSteps, seek, searchParams, customInput]);

  const handleCustomInputSubmit = (input: any) => {
    setCustomInput(input);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('input', JSON.stringify(input));
    newParams.delete('step');
    setSearchParams(newParams, { replace: true });
  };

  // Sync step changes to URL
  useEffect(() => {
    if (steps.length > 0 && stepIndex > 0) {
      setSearchParams({ step: stepIndex.toString() }, { replace: true });
    } else if (steps.length > 0 && stepIndex === 0) {
      setSearchParams({}, { replace: true });
    }
  }, [stepIndex, steps.length, setSearchParams]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const currentStep = steps[stepIndex];

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
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3 flex-wrap flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[--text]">{problem.title}</h1>
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
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[--border] bg-[--surface] text-sm font-medium text-[--text-muted] hover:text-[--text] hover:border-[--text-muted]/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus]"
            >
              <Icon name={copied ? 'check' : 'share'} size={18} />
              {copied ? 'Copied' : 'Share'}
            </button>
            <button
              onClick={() => toggleCompleted(problemId)}
              className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus] ${
                completed
                  ? 'bg-[--viz-success]/10 border-[--viz-success]/20 text-[--viz-success]'
                  : 'bg-[--surface] border-[--border] text-[--text-muted] hover:text-[--text] hover:border-[--text-muted]/40'
              }`}
            >
              <Icon name={completed ? 'check_circle' : 'radio_button_unchecked'} size={18} />
              {completed ? 'Understood' : 'Mark as understood'}
            </button>
          </div>
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

      {urlInputError && (
        <div className="mb-6 p-4 rounded-xl bg-[--viz-danger]/10 border border-[--viz-danger]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[--viz-danger]">
            <Icon name="error" size={20} />
            <p>The custom input in the URL is invalid or malformed. Using default input instead.</p>
          </div>
          <button
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.delete('input');
              setSearchParams(newParams, { replace: true });
              setUrlInputError(false);
            }}
            className="text-xs px-3 py-1.5 rounded bg-[--viz-danger]/20 text-[--viz-danger] hover:bg-[--viz-danger]/30 transition-colors font-medium whitespace-nowrap"
          >
            Clear URL Input
          </button>
        </div>
      )}

      {/* Two-column layout on desktop */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Visualization stage */}
        <div className="lg:w-[58%] lg:shrink-0 flex flex-col gap-4">
          {traceModule && currentStep ? (
            <>
              {currentStep.state.renderer === 'array-pointers' && (
                <div className="p-4 rounded-xl border border-[--border] bg-[--surface] flex items-center justify-center min-h-[220px]">
                  <ArrayPointersRenderer state={currentStep.state} />
                </div>
              )}
              {currentStep.state.renderer === 'linked-list' && (
                <div className="p-4 rounded-xl border border-[--border] bg-[--surface] flex items-center justify-center min-h-[220px]">
                  <LinkedListRenderer state={currentStep.state} />
                </div>
              )}
              {currentStep.state.renderer === 'dp-table' && (
                <div className="p-4 rounded-xl border border-[--border] bg-[--surface] flex items-center justify-center min-h-[220px]">
                  <DPTableRenderer state={currentStep.state} />
                </div>
              )}
              {currentStep.state.renderer === 'interval-timeline' && (
                <div className="p-4 rounded-xl border border-[--border] bg-[--surface] flex items-center justify-center min-h-[220px]">
                  <IntervalTimelineRenderer state={currentStep.state} />
                </div>
              )}
              {currentStep.state.renderer === 'grid-board' && (
                <div className="p-4 rounded-xl border border-[--border] bg-[--surface] flex items-center justify-center min-h-[220px]">
                  <GridBoardRenderer state={currentStep.state} />
                </div>
              )}
              {currentStep.state.renderer === 'recursion-tree' && (
                <div className="p-4 rounded-xl border border-[--border] bg-[--surface] flex items-center justify-center min-h-[220px]">
                  <RecursionTreeRenderer state={currentStep.state} />
                </div>
              )}
              {currentStep.state.renderer === 'graph-view' && (
                <div className="p-4 rounded-xl border border-[--border] bg-[--surface] flex items-center justify-center min-h-[220px]">
                  <GraphViewRenderer state={currentStep.state} />
                </div>
              )}
              {currentStep.state.renderer === 'bit-grid' && (
                <div className="p-4 rounded-xl border border-[--border] bg-[--surface] flex items-center justify-center min-h-[220px]">
                  <BitGridRenderer state={currentStep.state} />
                </div>
              )}
              <SidePanels state={currentStep.state} />
              <Player />
              <VariablesPanel vars={currentStep.vars} />
              <CustomInputPanel 
                schema={traceModule.inputSchema}
                defaultInput={traceModule.defaultInput}
                onSubmit={handleCustomInputSubmit}
              />
            </>
          ) : (
            <div className="rounded-xl border border-[--border] border-dashed bg-[--surface] flex flex-col items-center justify-center text-center py-16 px-6">
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[--surface-2] text-[--accent] mb-4">
                <Icon name="play_circle" size={32} />
              </span>
              <h2 className="text-base font-semibold text-[--text] mb-2">Visualization Coming Soon</h2>
              <p className="text-sm text-[--text-muted] max-w-xs">
                Step-by-step animation of this algorithm will be available in a future milestone.
                The C++ code and explanation are available now.
              </p>
            </div>
          )}

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
              <CodePanel code={problem.cpp} language="cpp" activeLine={currentStep?.line} />
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
