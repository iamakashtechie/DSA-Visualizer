import type { ArrayPointersState, Pointer } from '../../traces/lib/types';

interface ArrayPointersRendererProps {
  state: ArrayPointersState;
}

// ── Layout constants ──────────────────────────────────────────────────────────
const CELL_W = 52;
const CELL_H = 48;
const CELL_GAP = 8;
const CELL_R = 8; // border-radius
const INDEX_Y_OFFSET = 16; // below cell bottom
const POINTER_ZONE = 44; // height above cells for pointer labels + arrows
const TOTAL_H = POINTER_ZONE + CELL_H + INDEX_Y_OFFSET + 8;

// ── Color map (CSS variables — work in SVG via style prop) ───────────────────
const CELL_FILLS: Record<string, string> = {
  idle: 'var(--viz-idle)',
  active: 'var(--viz-active)',
  'pointer-a': 'var(--viz-pointer-a)',
  'pointer-b': 'var(--viz-pointer-b)',
  'pointer-c': 'var(--viz-pointer-c)',
  window: 'var(--viz-window)',
  visited: 'var(--viz-visited)',
  success: 'var(--viz-success)',
  danger: 'var(--viz-danger)',
  muted: 'var(--viz-muted)',
};

const CELL_TEXT_COLORS: Record<string, string> = {
  idle: 'var(--text)',
  active: '#fff',
  'pointer-a': '#fff',
  'pointer-b': '#fff',
  'pointer-c': '#fff',
  window: 'var(--text)',
  visited: 'var(--text)',
  success: '#fff',
  danger: '#fff',
  muted: 'var(--text-muted)',
};

const POINTER_COLORS: Record<string, string> = {
  a: 'var(--viz-pointer-a)',
  b: 'var(--viz-pointer-b)',
  c: 'var(--viz-pointer-c)',
};

// Non-color cues for accessibility
const CELL_STROKE: Record<string, string> = {
  'pointer-a': 'var(--viz-pointer-a)',
  'pointer-b': 'var(--viz-pointer-b)',
  'pointer-c': 'var(--viz-pointer-c)',
  window: 'var(--viz-active)',
  success: 'var(--viz-success)',
  danger: 'var(--viz-danger)',
};

const CELL_STROKE_DASH: Record<string, string> = {
  window: '4,2',
};

function cellX(index: number): number {
  return index * (CELL_W + CELL_GAP);
}

function cellCX(index: number): number {
  return cellX(index) + CELL_W / 2;
}

function PointerArrow({ pointer }: { pointer: Pointer }) {
  const cx = cellCX(pointer.index);
  const arrowTipY = POINTER_ZONE - 4;
  const arrowBaseY = arrowTipY - 12;
  const labelY = arrowBaseY - 6;
  const color = POINTER_COLORS[pointer.variant] ?? 'var(--accent)';

  return (
    <g>
      {/* Label */}
      <text
        x={cx}
        y={labelY}
        textAnchor="middle"
        style={{ fill: color, fontSize: 11, fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}
      >
        {pointer.name}
      </text>
      {/* Arrow line */}
      <line
        x1={cx}
        y1={arrowBaseY}
        x2={cx}
        y2={arrowTipY}
        style={{ stroke: color, strokeWidth: 2 }}
      />
      {/* Arrow head */}
      <polygon
        points={`${cx - 5},${arrowTipY} ${cx + 5},${arrowTipY} ${cx},${arrowTipY + 7}`}
        style={{ fill: color }}
      />
    </g>
  );
}

export function ArrayPointersRenderer({ state }: ArrayPointersRendererProps) {
  const { array, pointers, window: win } = state;
  const n = array.length;
  const totalW = n * CELL_W + Math.max(0, n - 1) * CELL_GAP;

  // Max comfortable width without padding: cap at 800
  const viewW = Math.max(totalW, 200);
  const viewH = TOTAL_H;

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      role="img"
      aria-label={`Array with ${n} elements`}
      className="w-full max-w-full"
      style={{ maxHeight: '220px', overflow: 'visible' }}
    >
      {/* Window highlight (behind cells) */}
      {win && (
        <rect
          x={cellX(win.left) - 4}
          y={POINTER_ZONE - 4}
          width={(win.right - win.left + 1) * (CELL_W + CELL_GAP) - CELL_GAP + 8}
          height={CELL_H + 8}
          rx={CELL_R + 2}
          style={{
            fill: 'var(--viz-window)',
            stroke: 'var(--viz-active)',
            strokeWidth: 1.5,
            strokeDasharray: '4,2',
            opacity: 0.5,
          }}
        />
      )}

      {/* Cells */}
      {array.map((cell, i) => {
        const x = cellX(i);
        const y = POINTER_ZONE;
        const fill = CELL_FILLS[cell.state] ?? CELL_FILLS.idle;
        const textColor = CELL_TEXT_COLORS[cell.state] ?? CELL_TEXT_COLORS.idle;
        const stroke = CELL_STROKE[cell.state];
        const strokeDash = CELL_STROKE_DASH[cell.state];

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={CELL_W}
              height={CELL_H}
              rx={CELL_R}
              style={{
                fill,
                stroke: stroke ?? 'var(--border)',
                strokeWidth: stroke ? 2 : 1,
                strokeDasharray: strokeDash,
                transition: 'fill 0.2s ease',
              }}
            />
            {/* Value */}
            <text
              x={x + CELL_W / 2}
              y={y + CELL_H / 2 + 1}
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fill: textColor,
                fontSize: String(cell.value).length > 3 ? 11 : 14,
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: cell.state !== 'idle' && cell.state !== 'muted' ? 700 : 400,
                transition: 'fill 0.2s ease',
              }}
            >
              {cell.value}
            </text>
            {/* Index label */}
            <text
              x={x + CELL_W / 2}
              y={y + CELL_H + INDEX_Y_OFFSET}
              textAnchor="middle"
              style={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'monospace' }}
            >
              {i}
            </text>
          </g>
        );
      })}

      {/* Pointer arrows (rendered above cells) */}
      {pointers.map((ptr) => (
        <PointerArrow key={ptr.name} pointer={ptr} />
      ))}
    </svg>
  );
}
