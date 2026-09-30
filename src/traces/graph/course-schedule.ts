import type { TraceModule, Step } from '../lib/types';
import { GraphViewState, CellState } from '../lib/types';

interface Input {
  numCourses: number;
  prerequisites: [number, number][];
}

export const trace: TraceModule<Input> = {
  renderer: 'graph-view',
  inputSchema: {
    numCourses: { type: 'int', label: 'Number of Courses' },
    prerequisites: { type: 'json', label: 'Prerequisites (edges)' },
  },
  defaultInput: {
    numCourses: 4,
    prerequisites: [[1, 0], [2, 1], [3, 1], [3, 2]],
  },
  samples: [
    { input: { numCourses: 2, prerequisites: [[1, 0]] }, expected: true },
    { input: { numCourses: 2, prerequisites: [[1, 0], [0, 1]] }, expected: false },
  ],
  run: function* (input, L) {
    const { numCourses, prerequisites } = input;
    
    // Track node/edge states
    const nodeStates: Record<number, CellState> = {};
    for (let i = 0; i < numCourses; i++) nodeStates[i] = 'idle';
    
    // We map edges stringified so we can color them during traversal
    const edgeStates: Record<string, CellState> = {};
    for (const [v, u] of prerequisites) {
      edgeStates[`${u}-${v}`] = 'idle';
    }

    const getState = (qArray: number[], overrideNodeState?: [number, CellState]): GraphViewState => {
      const clonedNodeStates = { ...nodeStates };
      if (overrideNodeState) clonedNodeStates[overrideNodeState[0]] = overrideNodeState[1];

      return {
        renderer: 'graph-view',
        nodes: Array.from({ length: numCourses }).map((_, i) => ({
          id: i.toString(),
          label: i.toString(),
          state: clonedNodeStates[i]
        })),
        edges: prerequisites.map(([v, u]) => ({
          u: u.toString(),
          v: v.toString(),
          directed: true,
          state: edgeStates[`${u}-${v}`] || 'idle'
        })),
        queue: [...qArray]
      };
    };

    yield {
      line: L('vector<vector<int>> adj(numCourses);'),
      event: 'init',
      state: getState([]),
      vars: { numCourses },
      note: 'Initialize adjacency list and indegree arrays.',
    } as Step;

    const adj: number[][] = Array.from({ length: numCourses }, () => []);
    const indegree: number[] = Array(numCourses).fill(0);

    for (const [v, u] of prerequisites) {
      adj[u].push(v);
      indegree[v]++;
    }

    yield {
      line: L('for (auto& p : prerequisites) {'),
      event: 'record',
      state: getState([]),
      vars: { indegree: `[${indegree.join(', ')}]` },
      note: 'Build the graph: edge from prerequisite to dependent course.',
    } as Step;

    const q: number[] = [];
    for (let i = 0; i < numCourses; i++) {
      if (indegree[i] === 0) {
        q.push(i);
        nodeStates[i] = 'pointer-b'; // pending in queue
      }
    }

    yield {
      line: L('for (int i = 0; i < numCourses; i++)'),
      event: 'init',
      state: getState(q),
      vars: { indegree: `[${indegree.join(', ')}]` },
      note: 'Queue initialized with courses having 0 prerequisites.',
    } as Step;

    let processed = 0;

    while (q.length > 0) {
      yield {
        line: L('while (!q.empty()) {'),
        event: 'compare',
        state: getState(q),
        vars: { processed, queueSize: q.length },
        note: 'Check if queue has more courses to process.',
      } as Step;

      const cur = q.shift()!;
      processed++;
      nodeStates[cur] = 'pointer-a';

      yield {
        line: L('int cur = q.front(); q.pop();'),
        event: 'record',
        state: getState(q),
        vars: { cur, processed },
        note: `Process course ${cur}.`,
      } as Step;

      for (const next of adj[cur]) {
        yield {
          line: L('for (int next : adj[cur])'),
          event: 'compare',
          state: getState(q, [next, 'pointer-c']),
          vars: { cur, next },
          note: `Examine dependent course ${next}.`,
        } as Step;

        edgeStates[`${cur}-${next}`] = 'visited';
        indegree[next]--;

        yield {
          line: L('if (--indegree[next] == 0) q.push(next);'),
          event: 'record',
          state: getState(q, [next, 'pointer-c']),
          vars: { cur, next, indegreeNext: indegree[next] },
          note: `Decrement indegree of ${next} to ${indegree[next]}.`,
        } as Step;

        if (indegree[next] === 0) {
          q.push(next);
          nodeStates[next] = 'pointer-b';
          yield {
            line: L('if (--indegree[next] == 0) q.push(next);'),
            event: 'record',
            state: getState(q),
            vars: { cur, next },
            note: `${next} has no more prerequisites! Push to queue.`,
          } as Step;
        }
      }

      nodeStates[cur] = 'success'; // Fully processed
    }

    yield {
      line: L('return processed == numCourses;'),
      event: 'done',
      state: getState(q),
      vars: { processed, numCourses },
      note: processed === numCourses ? 'All courses processed, no cycles.' : 'Cycle detected! Not all courses were processed.',
      result: processed === numCourses,
    } as Step;
  },
};
