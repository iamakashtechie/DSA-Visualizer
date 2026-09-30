import { motion } from 'framer-motion';
import { DPTableState } from '../../traces/lib/types';
import { getCellColors, getPointerColor } from '../array-pointers/ArrayPointersRenderer';

export function DPTableRenderer({ state }: { state: DPTableState }) {
  const CELL_SIZE = 40;
  const GAP = 4;
  const LABEL_SPACE = 30;

  const rows = state.table.length;
  const cols = rows > 0 ? state.table[0].length : 0;

  const hasRowLabels = state.rowLabels && state.rowLabels.length === rows;
  const hasColLabels = state.colLabels && state.colLabels.length === cols;

  const width = Math.max(360, (hasRowLabels ? LABEL_SPACE : 0) + cols * (CELL_SIZE + GAP) + 40);
  const height = (hasColLabels ? LABEL_SPACE : 0) + rows * (CELL_SIZE + GAP) + 40;
  
  const startX = hasRowLabels ? LABEL_SPACE + 20 : 20;
  const startY = hasColLabels ? LABEL_SPACE + 20 : 20;

  return (
    <div className="w-full overflow-x-auto overflow-y-auto select-none touch-pan-x touch-pan-y flex items-center justify-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, height, minWidth: width, display: 'block' }}
      >
        {/* Draw Column Labels */}
        {hasColLabels && state.colLabels!.map((label, c) => (
          <text
            key={`col-${c}`}
            x={startX + c * (CELL_SIZE + GAP) + CELL_SIZE / 2}
            y={startY - 10}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize="12"
            fontFamily="var(--font-mono)"
          >
            {label}
          </text>
        ))}

        {/* Draw Row Labels */}
        {hasRowLabels && state.rowLabels!.map((label, r) => (
          <text
            key={`row-${r}`}
            x={startX - 10}
            y={startY + r * (CELL_SIZE + GAP) + CELL_SIZE / 2}
            textAnchor="end"
            dominantBaseline="central"
            fill="var(--text-muted)"
            fontSize="12"
            fontFamily="var(--font-mono)"
          >
            {label}
          </text>
        ))}

        {/* Draw Cells */}
        {state.table.map((row, r) =>
          row.map((cell, c) => {
            const colors = getCellColors(cell.state);
            const cx = startX + c * (CELL_SIZE + GAP);
            const cy = startY + r * (CELL_SIZE + GAP);

            return (
              <g key={`${r}-${c}`} transform={`translate(${cx}, ${cy})`}>
                <motion.rect
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={4}
                  initial={false}
                  animate={{ fill: colors.bg, stroke: colors.border }}
                  strokeWidth="2"
                />
                <text
                  x={CELL_SIZE / 2}
                  y={CELL_SIZE / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={colors.text}
                  fontSize="14"
                  fontWeight="500"
                  fontFamily="var(--font-mono)"
                >
                  {cell.value}
                </text>
              </g>
            );
          })
        )}

        {/* Draw Pointers */}
        {state.pointers && state.pointers.map((ptr) => {
          const cx = startX + ptr.c * (CELL_SIZE + GAP) + CELL_SIZE / 2;
          const cy = startY + ptr.r * (CELL_SIZE + GAP) + CELL_SIZE; // Pointing to the bottom of the cell
          const pColor = getPointerColor(ptr.variant);
          
          return (
            <g key={ptr.name} transform={`translate(${cx}, ${cy})`}>
              <motion.path
                d={`M 0 0 L 4 6 L -4 6 Z`}
                fill={pColor}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              />
              <motion.text
                x={0}
                y={18}
                textAnchor="middle"
                fill={pColor}
                fontSize="12"
                fontWeight="600"
                fontFamily="var(--font-mono)"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {ptr.name}
              </motion.text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
