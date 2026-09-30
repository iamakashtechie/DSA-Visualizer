import { motion } from 'framer-motion';
import { GridBoardState } from '../../traces/lib/types';
import { getCellColors, getPointerColor } from '../array-pointers/ArrayPointersRenderer';

export function GridBoardRenderer({ state }: { state: GridBoardState }) {
  const CELL_SIZE = 40;
  const GAP = 4;

  const rows = state.grid.length;
  const cols = rows > 0 ? state.grid[0].length : 0;

  const width = Math.max(360, cols * (CELL_SIZE + GAP) + 40);
  const height = rows * (CELL_SIZE + GAP) + 60;
  
  const startX = (width - cols * (CELL_SIZE + GAP)) / 2;
  const startY = 30;

  return (
    <div className="w-full overflow-x-auto overflow-y-auto select-none touch-pan-x touch-pan-y flex items-center justify-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, height, minWidth: width, display: 'block' }}
      >
        {/* Draw Cells */}
        {state.grid.map((row, r) =>
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
                  fontSize="16"
                  fontWeight="600"
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
          const cy = startY + ptr.r * (CELL_SIZE + GAP) + CELL_SIZE;
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
