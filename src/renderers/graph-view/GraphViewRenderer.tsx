import { motion } from 'framer-motion';
import { GraphViewState } from '../../traces/lib/types';
import { getCellColors } from '../array-pointers/ArrayPointersRenderer';

export function GraphViewRenderer({ state }: { state: GraphViewState }) {
  // Simple circle layout for generic graphs (assuming node names can be mapped to a circle)
  const NODE_RADIUS = 20;
  
  const nodesCount = state.nodes.length;
  const cx = 180;
  const cy = 110;
  const r = 80;

  const width = Math.max(360, 360);
  const height = 220;

  const positions = new Map<string, { x: number; y: number }>();
  
  state.nodes.forEach((node, i) => {
    const angle = (i / nodesCount) * 2 * Math.PI - Math.PI / 2;
    positions.set(node.id, {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    });
  });

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden select-none touch-pan-x flex items-center justify-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, height, minWidth: width, display: 'block' }}
      >
        <defs>
          <marker id="graph-arrowhead" markerWidth="10" markerHeight="7" refX="21" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-muted)" />
          </marker>
        </defs>

        {/* Draw Edges */}
        {state.edges.map((edge, idx) => {
          const p1 = positions.get(edge.u);
          const p2 = positions.get(edge.v);
          if (!p1 || !p2) return null;
          
          const colors = getCellColors(edge.state);

          return (
            <line
              key={`edge-${idx}-${edge.u}-${edge.v}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={colors.border === 'var(--border)' ? 'var(--text-muted)' : colors.border}
              strokeWidth="2"
              markerEnd={edge.directed ? 'url(#graph-arrowhead)' : undefined}
            />
          );
        })}

        {/* Draw Nodes */}
        {state.nodes.map((node) => {
          const pos = positions.get(node.id);
          if (!pos) return null;
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
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
