// ── Cell / Pointer types ─────────────────────────────────────────────────────

export type CellState =
  | 'idle'
  | 'active'
  | 'pointer-a'
  | 'pointer-b'
  | 'pointer-c'
  | 'window'
  | 'visited'
  | 'success'
  | 'danger'
  | 'muted';

export interface ArrayCell {
  value: number | string;
  state: CellState;
}

export interface Pointer {
  /** Display label: "left", "right", "lo", "mid", "hi", etc. */
  name: string;
  index: number;
  /** Color variant: a = green, b = red, c = yellow/amber */
  variant: 'a' | 'b' | 'c';
}

// ── Renderer state union ─────────────────────────────────────────────────────

export interface ArrayPointersState {
  renderer: 'array-pointers';
  array: ArrayCell[];
  pointers: Pointer[];
  window?: { left: number; right: number };
  outputArray?: ArrayCell[];
  /** Optional side panels */
  hashMap?: Record<string, number | string>;
  stack?: Array<number | string>;
}

/** Extend as more renderers are added in M2 */
export type RendererState = ArrayPointersState;

// ── Event vocabulary ─────────────────────────────────────────────────────────

export type EventKind =
  | 'init'
  | 'compare'
  | 'move-pointer'
  | 'swap'
  | 'write'
  | 'expand'
  | 'shrink'
  | 'record'
  | 'choose'
  | 'explore'
  | 'unchoose'
  | 'prune'
  | 'visit'
  | 'enqueue'
  | 'dequeue'
  | 'relax'
  | 'union'
  | 'fill-cell'
  | 'bit-op'
  | 'found'
  | 'done';

// ── Step ─────────────────────────────────────────────────────────────────────

export interface Step {
  /** 1-based line number inside the displayed C++ block */
  line: number;
  event: EventKind;
  state: RendererState;
  /** C++ variable names → current values shown in the Variables panel */
  vars: Record<string, string | number | boolean | null | undefined>;
  /** One short "why" caption (~90 chars) */
  note: string;
  counters?: Record<string, number>;
  /** Only on the final step */
  result?: unknown;
}

// ── Trace module contract ────────────────────────────────────────────────────

export type LineResolver = (needle: string, nth?: number) => number;

export interface InputField {
  type: 'int-array' | 'int' | 'string' | 'int-grid';
  label: string;
  description?: string;
  /** Inclusive maximum length/value for the cap check */
  max?: number;
  min?: number;
}

export type InputSchema = Record<string, InputField>;

export interface TraceModule<TInput = any> {
  renderer: 'array-pointers';
  inputSchema: InputSchema;
  defaultInput: TInput;
  samples: Array<{ input: TInput; expected: unknown }>;
  run: (input: TInput, L: LineResolver) => Generator<Step>;
}
