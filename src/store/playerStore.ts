import { create } from 'zustand';
import type { Step } from '../traces/lib/types';

interface PlayerState {
  steps: Step[];
  stepIndex: number;
  isPlaying: boolean;
  /** Playback speed multiplier. Supported: 0.25, 0.5, 1, 2, 4 */
  speed: number;
  /** True when a trace was loaded but hit the 3,000-step cap */
  capped: boolean;

  // ── Actions ──
  setSteps: (steps: Step[], capped?: boolean) => void;
  setStepIndex: (i: number) => void;
  setIsPlaying: (v: boolean) => void;
  setSpeed: (v: number) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  end: () => void;
  seek: (i: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  steps: [],
  stepIndex: 0,
  isPlaying: false,
  speed: 1,
  capped: false,

  setSteps: (steps, capped = false) =>
    set({ steps, stepIndex: 0, isPlaying: false, capped }),

  setStepIndex: (i) => set({ stepIndex: i }),

  setIsPlaying: (v) => set({ isPlaying: v }),

  setSpeed: (v) => set({ speed: v }),

  next: () =>
    set((s) => ({
      stepIndex: Math.min(s.stepIndex + 1, s.steps.length - 1),
    })),

  prev: () =>
    set((s) => ({
      stepIndex: Math.max(s.stepIndex - 1, 0),
    })),

  reset: () => set({ stepIndex: 0, isPlaying: false }),

  end: () =>
    set((s) => ({ stepIndex: s.steps.length - 1, isPlaying: false })),

  seek: (i) => {
    const { steps } = get();
    set({ stepIndex: Math.max(0, Math.min(i, steps.length - 1)) });
  },
}));
