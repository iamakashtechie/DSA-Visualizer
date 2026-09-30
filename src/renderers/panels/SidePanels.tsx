import { PanelState } from '../../traces/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export function SidePanels({ state }: { state: PanelState }) {
  const hasStack = state.stack !== undefined;
  const hasQueue = state.queue !== undefined;
  const hasHeap = state.heap !== undefined;
  const hasHash = state.hash !== undefined;

  if (!hasStack && !hasQueue && !hasHeap && !hasHash) return null;

  return (
    <div className="flex flex-wrap gap-4 mt-4 w-full">
      {hasStack && (
        <div className="flex flex-col border border-[--border] bg-[--surface-2] rounded-lg p-3 min-w-[120px] flex-1">
          <h3 className="text-xs font-semibold text-[--text-muted] mb-2 uppercase tracking-wider text-center">Stack</h3>
          <div className="flex flex-col-reverse items-center gap-1 justify-end min-h-[100px]">
            <AnimatePresence>
              {state.stack!.map((item, idx) => (
                <motion.div
                  key={`${idx}-${item}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="w-full text-center py-1 px-2 rounded bg-[--surface] border border-[--border] text-sm font-mono text-[--text]"
                >
                  {item}
                </motion.div>
              ))}
              {state.stack!.length === 0 && (
                <span className="text-xs text-[--text-muted] italic">empty</span>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {hasQueue && (
        <div className="flex flex-col border border-[--border] bg-[--surface-2] rounded-lg p-3 min-w-[120px] flex-1">
          <h3 className="text-xs font-semibold text-[--text-muted] mb-2 uppercase tracking-wider text-center">Queue</h3>
          <div className="flex items-center gap-1 min-h-[40px] overflow-x-auto pb-2">
            <AnimatePresence>
              {state.queue!.map((item, idx) => (
                <motion.div
                  key={`${idx}-${item}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="min-w-[40px] text-center py-1 px-2 rounded bg-[--surface] border border-[--border] text-sm font-mono text-[--text]"
                >
                  {item}
                </motion.div>
              ))}
              {state.queue!.length === 0 && (
                <span className="text-xs text-[--text-muted] italic w-full text-center">empty</span>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {hasHeap && (
        <div className="flex flex-col border border-[--border] bg-[--surface-2] rounded-lg p-3 min-w-[120px] flex-1">
          <h3 className="text-xs font-semibold text-[--text-muted] mb-2 uppercase tracking-wider text-center">Heap (Array)</h3>
          <div className="flex items-center gap-1 min-h-[40px] overflow-x-auto pb-2">
            <AnimatePresence>
              {state.heap!.map((item, idx) => (
                <motion.div
                  key={`${idx}-${item}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="min-w-[40px] text-center py-1 px-2 rounded bg-[--viz-pointer-a] text-[--surface] font-mono text-sm shadow-sm"
                >
                  {item}
                </motion.div>
              ))}
              {state.heap!.length === 0 && (
                <span className="text-xs text-[--text-muted] italic w-full text-center">empty</span>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {hasHash && (
        <div className="flex flex-col border border-[--border] bg-[--surface-2] rounded-lg p-3 min-w-[160px] flex-1">
          <h3 className="text-xs font-semibold text-[--text-muted] mb-2 uppercase tracking-wider text-center">Hash Map</h3>
          <div className="flex flex-col gap-1 text-sm font-mono">
            {Object.entries(state.hash!).length === 0 ? (
              <span className="text-xs text-[--text-muted] italic w-full text-center">empty</span>
            ) : (
              Object.entries(state.hash!).map(([key, val]) => (
                <div key={key} className="flex justify-between border-b border-[--border] last:border-0 pb-1">
                  <span className="text-[--viz-pointer-a]">{key}</span>
                  <span className="text-[--text]">{val}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
