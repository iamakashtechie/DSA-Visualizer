import { motion } from 'framer-motion';
import { RecursionTreeState } from '../../traces/lib/types';
import { getCellColors } from '../array-pointers/ArrayPointersRenderer';

export function RecursionTreeRenderer({ state }: { state: RecursionTreeState }) {
  // Simple layout: assign x, y to each node recursively
  const NODE_RADIUS = 20;
  const Y_SPACING = 60;
  const X_SPACING = 40;

  const positions = new Map<string, { x: number; y: number }>();
  let currentX = 0;
  let maxDepth = 0;

  const assignPositions = (id: string, depth: number) => {
    const node = state.nodes[id];
    if (!node) return;
    
    if (depth > maxDepth) maxDepth = depth;

    if (node.children.length === 0) {
      positions.set(id, { x: currentX, y: depth * Y_SPACING });
      currentX += X_SPACING;
    } else {
      let minX = Infinity;
      let maxX = -Infinity;
      
      for (const childId of node.children) {
        assignPositions(childId, depth + 1);
        const childPos = positions.get(childId);
        if (childPos) {
          if (childPos.x < minX) minX = childPos.x;
          if (childPos.x > maxX) maxX = childPos.x;
        }
      }
      
      positions.set(id, { x: (minX + maxX) / 2, y: depth * Y_SPACING });
    }
  };

  if (state.rootId) {
    assignPositions(state.rootId, 0);
  } else {
    // Just layout whatever is there linearly if no root (fallback)
    Object.keys(state.nodes).forEach((id, i) => {
      positions.set(id, { x: i * X_SPACING, y: 0 });
    });
  }

  // Calculate SVG bounds
  let minX = Infinity, maxX = -Infinity;
  positions.forEach(pos => {
    if (pos.x < minX) minX = pos.x;
    if (pos.x > maxX) maxX = pos.x;
  });
  
  if (minX === Infinity) { minX = 0; maxX = 300; maxDepth = 0; }

  const viewWidth = Math.max(360, maxX - minX + 60);
  const viewHeight = maxDepth * Y_SPACING + 60;
  
  // Center it if it's smaller than 360
  const offsetX = viewWidth > (maxX - minX + 60) ? (viewWidth - (maxX - minX)) / 2 - minX : 30 - minX;
  const offsetY = 30;

  return (
    <div className="w-full overflow-x-auto overflow-y-auto select-none touch-pan-x touch-pan-y flex items-center justify-center">
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        style={{ width: viewWidth, height: viewHeight, minWidth: viewWidth, display: 'block' }}
      >
        {/* Draw Edges */}
        {Object.entries(state.nodes).map(([id, node]) => {
          const p1 = positions.get(id);
          if (!p1) return null;
          
          return node.children.map(childId => {
            const p2 = positions.get(childId);
            if (!p2) return null;
            
            return (
              <line
                key={`${id}-${childId}`}
                x1={p1.x + offsetX}
                y1={p1.y + offsetY + NODE_RADIUS}
                x2={p2.x + offsetX}
                y2={p2.y + offsetY - NODE_RADIUS}
                stroke="var(--text-muted)"
                strokeWidth="2"
              />
            );
          });
        })}

        {/* Draw Nodes */}
        {Object.entries(state.nodes).map(([id, node]) => {
          const pos = positions.get(id);
          if (!pos) return null;
          const colors = getCellColors(node.state);

          return (
            <g key={id} transform={`translate(${pos.x + offsetX}, ${pos.y + offsetY})`}>
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
                fontSize="12"
                fontWeight="500"
                fontFamily="var(--font-mono)"
              >
                {node.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
