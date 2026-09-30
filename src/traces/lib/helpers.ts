import type { Step, ArrayCell, Pointer, ArrayPointersState, CellState } from './types';

/** Maximum steps any trace may produce before being truncated. */
export const MAX_STEPS = 3_000;

/** Maximum array length for custom input (keeps the visual readable). */
export const MAX_ARRAY_LENGTH = 16;

/** Maximum grid size (rows × cols) for custom input. */
export const MAX_GRID_SIZE = 8;

/**
 * Run a generator and collect all steps, capped at MAX_STEPS.
 * Returns the steps array and whether the cap was hit.
 */
export function collectSteps(gen: Generator<Step>): { steps: Step[]; capped: boolean } {
  const steps: Step[] = [];
  for (const step of gen) {
    steps.push(step);
    if (steps.length >= MAX_STEPS) {
      return { steps, capped: true };
    }
  }
  return { steps, capped: false };
}

// ── Array-pointers state builders ────────────────────────────────────────────

/**
 * Build an ArrayCell array from raw values, marking the pointer positions
 * with pointer-a / pointer-b / pointer-c states.
 */
export function buildCells(
  values: ReadonlyArray<number | string>,
  overrides: Partial<Record<number, CellState>> = {},
): ArrayCell[] {
  return values.map((value, i) => ({
    value,
    state: overrides[i] ?? 'idle',
  }));
}

/** Shorthand to produce an ArrayPointersState. */
export function apState(
  array: ArrayCell[],
  pointers: Pointer[],
  extra: Partial<Omit<ArrayPointersState, 'renderer' | 'array' | 'pointers'>> = {},
): ArrayPointersState {
  return { renderer: 'array-pointers', array, pointers, ...extra };
}
