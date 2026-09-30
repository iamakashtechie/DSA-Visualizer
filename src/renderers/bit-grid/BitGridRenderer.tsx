import { motion } from 'framer-motion';
import { BitGridState } from '../../traces/lib/types';
import { getCellColors } from '../array-pointers/ArrayPointersRenderer';

export function BitGridRenderer({ state }: { state: BitGridState }) {
  const BIT_WIDTH = 30;
  const BIT_HEIGHT = 40;
  const GAP = 4;
  
  // We'll show each number as a row of 32 bits
  const rows = state.numbers.length;
  const cols = 32;

  const width = Math.max(360, cols * (BIT_WIDTH + GAP) + 80);
  const height = rows * (BIT_HEIGHT + GAP + 30) + 40;
  
  const startX = 60;
  const startY = 40;

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden select-none touch-pan-x flex items-center justify-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, height, minWidth: width, display: 'block' }}
      >
        {state.numbers.map((num, r) => {
          const cy = startY + r * (BIT_HEIGHT + GAP + 30);
          
          return (
            <g key={`num-${r}`}>
              <text
                x={startX - 10}
                y={cy + BIT_HEIGHT / 2}
                textAnchor="end"
                dominantBaseline="central"
                fill="var(--text-muted)"
                fontSize="12"
                fontFamily="var(--font-mono)"
              >
                {num.label}
              </text>
              
              {/* Bits (from MSB to LSB, so index 31 down to 0) */}
              {Array.from({ length: 32 }).map((_, i) => {
                const bitIndex = 31 - i;
                const bitValue = num.bits[bitIndex];
                
                // Active bit gets pointer-a style
                const isActive = state.activeBitIndex === bitIndex;
                const stateColor = isActive ? 'pointer-a' : (bitValue === 1 ? 'success' : 'idle');
                const colors = getCellColors(stateColor);

                const cx = startX + i * (BIT_WIDTH + GAP);

                return (
                  <g key={`bit-${r}-${bitIndex}`} transform={`translate(${cx}, ${cy})`}>
                    <motion.rect
                      width={BIT_WIDTH}
                      height={BIT_HEIGHT}
                      rx={4}
                      initial={false}
                      animate={{ fill: colors.bg, stroke: colors.border }}
                      strokeWidth="2"
                    />
                    <text
                      x={BIT_WIDTH / 2}
                      y={BIT_HEIGHT / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={colors.text}
                      fontSize="14"
                      fontWeight="600"
                      fontFamily="var(--font-mono)"
                    >
                      {bitValue}
                    </text>
                    {/* Only show bit index on the first row */}
                    {r === 0 && (
                      <text
                        x={BIT_WIDTH / 2}
                        y={-8}
                        textAnchor="middle"
                        fill="var(--text-muted)"
                        fontSize="10"
                        fontFamily="var(--font-mono)"
                      >
                        {bitIndex}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
