import type { TraceModule, Step } from '../lib/types';
import { RecursionTreeState, CellState } from '../lib/types';

interface Input {
  nums: number[];
}

export const trace: TraceModule<Input> = {
  renderer: 'recursion-tree',
  inputSchema: {
    nums: { type: 'int-array', label: 'Set elements', min: 1, max: 5 },
  },
  defaultInput: {
    nums: [1, 2, 3],
  },
  samples: [
    { input: { nums: [1, 2] }, expected: [[], [1], [1,2], [2]] },
  ],
  run: function* (input, L) {
    const { nums } = input;
    const res: number[][] = [];
    const path: number[] = [];

    let nodeIdCounter = 0;
    
    // We will build a tree of function calls
    const nodes: Record<string, { value: string; state: CellState; children: string[] }> = {};
    
    const getState = (rootId: string, currentId: string, activePath: number[]): RecursionTreeState => {
      // Mark current as active
      const clonedNodes = JSON.parse(JSON.stringify(nodes));
      if (clonedNodes[currentId]) {
        clonedNodes[currentId].state = 'pointer-a';
      }
      return {
        renderer: 'recursion-tree',
        nodes: clonedNodes,
        rootId,
        stack: activePath.length > 0 ? activePath : ['[]']
      };
    };

    yield {
      line: L('vector<vector<int>> res;'),
      event: 'init',
      state: { renderer: 'recursion-tree', nodes: {}, stack: [] },
      vars: { nums: `[${nums.join(',')}]` },
      note: 'Initialize result and path.',
    } as Step;

    const rootId = 'n0';
    nodes[rootId] = { value: '[]', state: 'idle', children: [] };
    nodeIdCounter++;

    yield {
      line: L('backtrack(nums, 0, path, res);'),
      event: 'compare',
      state: getState(rootId, rootId, path),
      vars: { start: 0, path: `[${path.join(',')}]` },
      note: 'Initial backtrack call with start = 0.',
    } as Step;

    function* backtrack(start: number, parentId: string): Generator<Step> {
      // res.push_back
      res.push([...path]);
      
      yield {
        line: L('res.push_back(path);'),
        event: 'record',
        state: getState(rootId, parentId, path),
        vars: { start, path: `[${path.join(',')}]` },
        note: `Record current path [${path.join(',')}] as a valid subset.`,
      };

      for (let i = start; i < nums.length; i++) {
        yield {
          line: L('for (int i = start; i < nums.size(); i++) {'),
          event: 'compare',
          state: getState(rootId, parentId, path),
          vars: { start, i, path: `[${path.join(',')}]` },
          note: `Considering element ${nums[i]} at index ${i}.`,
        };

        path.push(nums[i]);
        const childId = `n${nodeIdCounter++}`;
        nodes[childId] = { value: `[${path.join(',')}]`, state: 'idle', children: [] };
        nodes[parentId].children.push(childId);

        yield {
          line: L('path.push_back(nums[i]);              // choose'),
          event: 'record',
          state: getState(rootId, parentId, path),
          vars: { start, i, path: `[${path.join(',')}]` },
          note: `Choose ${nums[i]}.`,
        };

        yield {
          line: L('backtrack(nums, i + 1, path, res);     // explore'),
          event: 'compare',
          state: getState(rootId, childId, path),
          vars: { start: i + 1, path: `[${path.join(',')}]` },
          note: `Explore further with start = ${i + 1}.`,
        };

        yield* backtrack(i + 1, childId);

        path.pop();
        yield {
          line: L('path.pop_back();                       // un-choose (backtrack)'),
          event: 'record',
          state: getState(rootId, parentId, path),
          vars: { start, i, path: `[${path.join(',')}]` },
          note: `Un-choose ${nums[i]} and backtrack.`,
        };
      }
    }

    yield* backtrack(0, rootId);

    // mark all nodes success at the end
    for (const key in nodes) nodes[key].state = 'success';

    yield {
      line: L('return res;'),
      event: 'done',
      state: { renderer: 'recursion-tree', nodes, rootId },
      vars: {},
      note: `All subsets found! Total: ${res.length}.`,
      result: res,
    } as Step;
  },
};
