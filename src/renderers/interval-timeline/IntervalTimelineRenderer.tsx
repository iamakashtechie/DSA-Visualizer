import { motion } from 'framer-motion';
import { IntervalTimelineState } from '../../traces/lib/types';
import { getCellColors } from '../array-pointers/ArrayPointersRenderer';

export function IntervalTimelineRenderer({ state }: { state: IntervalTimelineState }) {
  // Find min and max to scale the timeline
  let minStart = Infinity;
  let maxEnd = -Infinity;
  for (const interval of state.intervals) {
    if (interval.start < minStart) minStart = interval.start;
    if (interval.end > maxEnd) maxEnd = interval.end;
  }
  
  if (minStart === Infinity) {
    minStart = 0;
    maxEnd = 10;
  }
  
  // Add padding
  minStart -= 1;
  maxEnd += 1;
  const range = maxEnd - minStart;

  const ROW_HEIGHT = 40;
  const Y_START = 40;
  const width = Math.max(360, 600);
  const height = Y_START + state.intervals.length * ROW_HEIGHT + 40;

  const getX = (val: number) => {
    return 20 + ((val - minStart) / range) * (width - 40);
  };

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden select-none touch-pan-x flex items-center justify-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, height, minWidth: width, display: 'block' }}
      >
        {/* Draw axis */}
        <line x1={20} y1={20} x2={width - 20} y2={20} stroke="var(--border)" strokeWidth="2" />
        
        {/* Draw ticks */}
        {Array.from({ length: range + 1 }).map((_, i) => {
          const val = minStart + i;
          const x = getX(val);
          return (
            <g key={`tick-${val}`}>
              <line x1={x} y1={15} x2={x} y2={25} stroke="var(--text-muted)" strokeWidth="2" />
              <text x={x} y={10} textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)">
                {val}
              </text>
            </g>
          );
        })}

        {/* Draw sweep line if present */}
        {state.sweepLine !== undefined && (
          <motion.line
            initial={false}
            animate={{ x1: getX(state.sweepLine), x2: getX(state.sweepLine) }}
            y1={15}
            y2={height - 20}
            stroke="var(--accent)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        )}

        {/* Draw intervals */}
        {state.intervals.map((interval, idx) => {
          const y = Y_START + idx * ROW_HEIGHT;
          const x1 = getX(interval.start);
          const x2 = getX(interval.end);
          const colors = getCellColors(interval.state);

          return (
            <g key={interval.id}>
              <motion.rect
                initial={false}
                animate={{
                  x: x1,
                  y,
                  width: Math.max(2, x2 - x1),
                  fill: colors.bg,
                  stroke: colors.border
                }}
                height={24}
                rx={4}
                strokeWidth="2"
              />
              <motion.text
                initial={false}
                animate={{ x: x1 + (x2 - x1) / 2, y: y + 12 }}
                textAnchor="middle"
                dominantBaseline="central"
                fill={colors.text}
                fontSize="12"
                fontWeight="500"
                fontFamily="var(--font-mono)"
              >
                [{interval.start}, {interval.end}]
              </motion.text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
