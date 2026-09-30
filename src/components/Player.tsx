import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { Icon } from './Icon';

const SPEEDS = [0.25, 0.5, 1, 2, 4] as const;

export function Player() {
  const steps = usePlayerStore((s) => s.steps);
  const stepIndex = usePlayerStore((s) => s.stepIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const speed = usePlayerStore((s) => s.speed);
  const capped = usePlayerStore((s) => s.capped);

  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const reset = usePlayerStore((s) => s.reset);
  const end = usePlayerStore((s) => s.end);
  const seek = usePlayerStore((s) => s.seek);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
  const setSpeed = usePlayerStore((s) => s.setSpeed);

  const stepIndexRef = useRef(stepIndex);
  stepIndexRef.current = stepIndex;
  const stepsLenRef = useRef(steps.length);
  stepsLenRef.current = steps.length;

  // ── Auto-play timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) return;
    const delay = Math.round(800 / speed);
    const id = setInterval(() => {
      if (stepIndexRef.current >= stepsLenRef.current - 1) {
        setIsPlaying(false);
      } else {
        next();
      }
    }, delay);
    return () => clearInterval(id);
  }, [isPlaying, speed, next, setIsPlaying]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      // Don't interfere with input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (steps.length === 0) return;
        if (stepIndexRef.current >= stepsLenRef.current - 1) {
          seek(0);
          setIsPlaying(true);
        } else {
          setIsPlaying(!isPlaying);
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.code === 'Home') {
        e.preventDefault();
        reset();
      } else if (e.code === 'End') {
        e.preventDefault();
        end();
      }
    },
    [steps.length, isPlaying, next, prev, reset, end, seek, setIsPlaying],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  if (steps.length === 0) return null;

  const atStart = stepIndex === 0;
  const atEnd = stepIndex === steps.length - 1;
  const currentStep = steps[stepIndex];

  function cycleSpeed() {
    const idx = SPEEDS.indexOf(speed as typeof SPEEDS[number]);
    setSpeed(SPEEDS[(idx + 1) % SPEEDS.length]);
  }

  return (
    <div className="flex flex-col gap-3 bg-[--surface] border border-[--border] rounded-xl p-3">
      {/* ── Step note ── */}
      {currentStep && (
        <p className="text-sm text-[--text] leading-snug min-h-[2.5rem] px-1">
          {currentStep.note}
        </p>
      )}

      {/* ── Scrubber ── */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[--text-muted] w-14 shrink-0 text-right tabular-nums">
          {stepIndex + 1} / {steps.length}
        </span>
        <input
          type="range"
          min={0}
          max={steps.length - 1}
          value={stepIndex}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Step position"
          className="flex-1 accent-[--accent] h-1.5 cursor-pointer"
        />
        {capped && (
          <span className="text-xs text-[--viz-danger] shrink-0" title="Trace was capped at 3,000 steps">
            cap
          </span>
        )}
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {/* Jump to start */}
          <ControlButton
            onClick={reset}
            disabled={atStart}
            aria-label="Jump to start (Home)"
            title="Jump to start (Home)"
          >
            <Icon name="first_page" size={20} />
          </ControlButton>

          {/* Step back */}
          <ControlButton
            onClick={prev}
            disabled={atStart}
            aria-label="Step back (←)"
            title="Step back (←)"
          >
            <Icon name="skip_previous" size={20} />
          </ControlButton>

          {/* Play / Pause */}
          <ControlButton
            onClick={() => {
              if (atEnd) { seek(0); setIsPlaying(true); }
              else setIsPlaying(!isPlaying);
            }}
            aria-label={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            primary
          >
            <Icon name={isPlaying ? 'pause' : 'play_arrow'} size={22} />
          </ControlButton>

          {/* Step forward */}
          <ControlButton
            onClick={next}
            disabled={atEnd}
            aria-label="Step forward (→)"
            title="Step forward (→)"
          >
            <Icon name="skip_next" size={20} />
          </ControlButton>

          {/* Jump to end */}
          <ControlButton
            onClick={end}
            disabled={atEnd}
            aria-label="Jump to end (End)"
            title="Jump to end (End)"
          >
            <Icon name="last_page" size={20} />
          </ControlButton>
        </div>

        {/* Speed */}
        <button
          onClick={cycleSpeed}
          aria-label={`Playback speed: ${speed}× (click to change)`}
          title="Cycle playback speed"
          className="text-xs font-medium text-[--text-muted] hover:text-[--text] px-2 py-1 rounded-md hover:bg-[--surface-2] transition-colors focus-visible:outline-2 focus-visible:outline-[--focus] min-w-[3rem] text-center"
        >
          {speed}×
        </button>
      </div>

      {/* ── Counters ── */}
      {currentStep?.counters && Object.keys(currentStep.counters).length > 0 && (
        <div className="flex gap-3 flex-wrap border-t border-[--border] pt-2">
          {Object.entries(currentStep.counters).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-[--text-muted]">
              <span className="capitalize">{key}:</span>
              <span className="font-mono font-semibold text-[--text]">{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────

interface ControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  primary?: boolean;
  children: React.ReactNode;
}

function ControlButton({ primary, children, disabled, ...props }: ControlButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`flex items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[--focus] disabled:opacity-40 disabled:cursor-not-allowed
        ${
          primary
            ? 'w-10 h-10 bg-[--accent] text-[--accent-contrast] hover:opacity-90'
            : 'w-9 h-9 text-[--text-muted] hover:text-[--text] hover:bg-[--surface-2]'
        }`}
    >
      {children}
    </button>
  );
}
