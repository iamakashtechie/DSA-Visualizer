import { motion } from 'framer-motion';
import { LinkedListState } from '../../traces/lib/types';
import { getCellColors, getPointerColor } from '../array-pointers/ArrayPointersRenderer'; // Reuse existing color mapping

export function LinkedListRenderer({ state }: { state: LinkedListState }) {
  // We'll draw this using SVG.
  // Nodes will be laid out horizontally. If there's a cycle, we draw a curved arrow back.
  
  const NODE_RADIUS = 20;
  const X_SPACING = 80;
  const Y_OFFSET = 60;
  
  // Calculate positions
  const positions = new Map<string, { x: number; y: number }>();
  
  
  // To handle cycles or branches, we should theoretically traverse, but for simplicity
  // we just lay them out in the order they appear in state.nodes
  state.nodes.forEach((node, i) => {
    positions.set(node.id, { x: 40 + i * X_SPACING, y: Y_OFFSET });
  });

  const width = Math.max(360, 80 + state.nodes.length * X_SPACING);
  const height = 140;

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden select-none touch-pan-x flex items-center justify-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, height, minWidth: width, display: 'block' }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-muted)" />
          </marker>
        </defs>

        {/* Draw Edges */}
        {state.nodes.map((node) => {
          if (!node.next) return null;
          const pos1 = positions.get(node.id);
          const pos2 = positions.get(node.next);
          if (!pos1 || !pos2) return null;

          const isForward = pos2.x > pos1.x;
          
          if (isForward) {
            // Straight line
            return (
              <line
                key={`${node.id}-${node.next}`}
                x1={pos1.x + NODE_RADIUS}
                y1={pos1.y}
                x2={pos2.x - NODE_RADIUS - 2}
                y2={pos2.y}
                stroke="var(--text-muted)"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          } else {
            // Cycle / Back edge (draw a curved path below the nodes)
            const d = `M ${pos1.x} ${pos1.y + NODE_RADIUS} C ${pos1.x} ${pos1.y + 60}, ${pos2.x} ${pos2.y + 60}, ${pos2.x} ${pos2.y + NODE_RADIUS + 2}`;
            return (
              <path
                key={`${node.id}-${node.next}`}
                d={d}
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          }
        })}

        {/* Draw Nodes */}
        {state.nodes.map((node) => {
          const pos = positions.get(node.id)!;
          const colors = getCellColors(node.state);

          return (
            <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
              <motion.circle
                r={NODE_RADIUS}
                initial={false}
                animate={{ fill: colors.bg, stroke: colors.border }}
                strokeWidth="2"
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fill={colors.text}
                fontSize="14"
                fontWeight="500"
                fontFamily="var(--font-mono)"
              >
                {node.value}
              </text>

              {/* Draw Pointers */}
              {node.pointers && node.pointers.map((ptr, pIdx) => {
                const pColor = getPointerColor(ptr.variant);
                const pY = -NODE_RADIUS - 10 - pIdx * 20;
                return (
                  <g key={ptr.name}>
                    <motion.text
                      x={0}
                      y={pY - 4}
                      textAnchor="middle"
                      fill={pColor}
                      fontSize="12"
                      fontWeight="600"
                      fontFamily="var(--font-mono)"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {ptr.name}
                    </motion.text>
                    <motion.path
                      d={`M 0 ${pY} L 4 ${pY - 6} L -4 ${pY - 6} Z`}
                      fill={pColor}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
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
