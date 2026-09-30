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

// ── Side Panels ──────────────────────────────────────────────────────────────
export interface PanelState {
  stack?: Array<number | string>;
  queue?: Array<number | string>;
  hash?: Record<string, number | string>;
  heap?: Array<number | string>;
}

// ── Renderer States ──────────────────────────────────────────────────────────

export interface ArrayPointersState extends PanelState {
  renderer: 'array-pointers';
  array: ArrayCell[];
  pointers: Pointer[];
  window?: { left: number; right: number };
}

export interface LinkedListNode {
  id: string;
  value: string | number;
  state: CellState;
  next?: string; // id of next node
  pointers?: Pointer[]; // pointers pointing to this node
}

export interface LinkedListState extends PanelState {
  renderer: 'linked-list';
  nodes: LinkedListNode[];
  head?: string;
}

export interface DPTableState extends PanelState {
  renderer: 'dp-table';
  table: ArrayCell[][]; // 2D grid of cells
  rowLabels?: string[];
  colLabels?: string[];
  pointers?: { r: number; c: number; variant: 'a' | 'b' | 'c'; name: string }[];
}

export interface GridBoardState extends PanelState {
  renderer: 'grid-board';
  grid: ArrayCell[][];
  pointers?: { r: number; c: number; variant: 'a' | 'b' | 'c'; name: string }[];
}

export interface RecursionTreeState extends PanelState {
  renderer: 'recursion-tree';
  nodes: Record<string, { value: string | number; state: CellState; children: string[] }>;
  rootId?: string;
}

export interface IntervalTimelineState extends PanelState {
  renderer: 'interval-timeline';
  intervals: { start: number; end: number; state: CellState; id: string }[];
  sweepLine?: number;
}

export interface GraphViewState extends PanelState {
  renderer: 'graph-view';
  nodes: { id: string; label: string; state: CellState }[];
  edges: { u: string; v: string; state: CellState; directed?: boolean; weight?: number }[];
}

export interface BitGridState extends PanelState {
  renderer: 'bit-grid';
  numbers: { label: string; value: number; bits: number[] }[];
  activeBitIndex?: number;
}

export type RendererState =
  | ArrayPointersState
  | LinkedListState
  | DPTableState
  | GridBoardState
  | RecursionTreeState
  | IntervalTimelineState
  | GraphViewState
  | BitGridState;

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
  type: 'int-array' | 'int' | 'string' | 'int-grid' | 'json';
  label: string;
  description?: string;
  /** Inclusive maximum length/value for the cap check */
  max?: number;
  min?: number;
}

export type InputSchema = Record<string, InputField>;

export interface TraceModule<TInput = any> {
  renderer: RendererState['renderer'];
  inputSchema: InputSchema;
  defaultInput: TInput;
  samples: Array<{ input: TInput; expected: unknown }>;
  run: (input: TInput, L: LineResolver) => Generator<Step>;
}
