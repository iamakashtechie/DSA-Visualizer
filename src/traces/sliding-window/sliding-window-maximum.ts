import type { TraceModule } from '../lib/types';
import { buildCells, apState } from '../lib/helpers';

interface Input {
  nums: number[];
  k: number;
}

export const trace: TraceModule<Input> = {
  renderer: 'array-pointers',
  inputSchema: {
    nums: { type: 'int-array', label: 'Array' },
    k: { type: 'int', label: 'k (Window Size)', min: 1 },
  },
  defaultInput: {
    nums: [1, 3, -1, -3, 5, 3, 6, 7],
    k: 3,
  },
  samples: [
    { input: { nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 }, expected: [3, 3, 5, 5, 6, 7] },
    { input: { nums: [1], k: 1 }, expected: [1] },
  ],
  run: function* (input, L) {
    const { nums, k } = input;
    
    yield {
      line: L('deque<int> dq;'),
      event: 'init',
      state: apState(buildCells(nums), [], { queue: [] }),
      vars: { k },
      note: 'Initialize double-ended queue to store indices.',
    };

    const q: number[] = [];
    const res: number[] = [];

    for (let i = 0; i < nums.length; i++) {
      yield {
        line: L('for (int i = 0; i < nums.size(); i++) {'),
        event: 'move-pointer',
        state: apState(
          buildCells(nums, Array.from({length: Math.min(i + 1, k)}, (_, j) => [i - Math.min(i + 1, k) + 1 + j, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
          [{ name: 'i', index: i, variant: 'a' }],
          { queue: q.map(idx => `${nums[idx]} (i:${idx})`) }
        ),
        vars: { i, num: nums[i] },
        note: `Process element ${nums[i]} at index ${i}.`,
      };

      if (q.length > 0 && q[0] === i - k) {
        const removed = q.shift()!;
        yield {
          line: L('if (!dq.empty() && dq.front() <= i - k) {'),
          event: 'dequeue',
          state: apState(
            buildCells(nums, Array.from({length: Math.min(i + 1, k)}, (_, j) => [i - Math.min(i + 1, k) + 1 + j, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
            [{ name: 'i', index: i, variant: 'a' }],
            { queue: q.map(idx => `${nums[idx]} (i:${idx})`) }
          ),
          vars: { i, removedIdx: removed, removedVal: nums[removed] },
          note: `Remove index ${removed} from deque as it's out of the current window.`,
        };
      } else {
        yield {
          line: L('if (!dq.empty() && dq.front() <= i - k) {'),
          event: 'compare',
          state: apState(
            buildCells(nums, Array.from({length: Math.min(i + 1, k)}, (_, j) => [i - Math.min(i + 1, k) + 1 + j, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
            [{ name: 'i', index: i, variant: 'a' }],
            { queue: q.map(idx => `${nums[idx]} (i:${idx})`) }
          ),
          vars: { i },
          note: `Deque front is still within the window bounds.`,
        };
      }

      while (q.length > 0 && nums[q[q.length - 1]] < nums[i]) {
        const removed = q.pop()!;
        yield {
          line: L('while (!dq.empty() && nums[dq.back()] < nums[i]) {'),
          event: 'dequeue',
          state: apState(
            buildCells(nums, Array.from({length: Math.min(i + 1, k)}, (_, j) => [i - Math.min(i + 1, k) + 1 + j, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
            [{ name: 'i', index: i, variant: 'a' }],
            { queue: q.map(idx => `${nums[idx]} (i:${idx})`) }
          ),
          vars: { i, removedIdx: removed, removedVal: nums[removed], curr: nums[i] },
          note: `Remove index ${removed} (${nums[removed]}) since it's smaller than current element ${nums[i]}.`,
        };
      }

      q.push(i);
      yield {
        line: L('dq.push_back(i);'),
        event: 'enqueue',
        state: apState(
          buildCells(nums, Array.from({length: Math.min(i + 1, k)}, (_, j) => [i - Math.min(i + 1, k) + 1 + j, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
          [{ name: 'i', index: i, variant: 'a' }],
          { queue: q.map(idx => `${nums[idx]} (i:${idx})`) }
        ),
        vars: { i, added: nums[i] },
        note: `Add current index ${i} (${nums[i]}) to deque.`,
      };

      if (i >= k - 1) {
        res.push(nums[q[0]]);
        yield {
          line: L('if (i >= k - 1) {'),
          event: 'record',
          state: apState(
            buildCells(nums, { ...Array.from({length: k}, (_, j) => [i - k + 1 + j, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {}), [q[0]]: 'success' }),
            [{ name: 'i', index: i, variant: 'a' }],
            { queue: q.map(idx => `${nums[idx]} (i:${idx})`), stack: res } 
          ),
          vars: { i, maxInWindow: nums[q[0]] },
          note: `Window is fully formed. Max is ${nums[q[0]]}. Add to result.`,
        };
      }
    }

    yield {
      line: L('return result;'),
      event: 'done',
      state: apState(buildCells(nums), [], { queue: q.map(idx => `${nums[idx]} (i:${idx})`), stack: res }),
      vars: { res: JSON.stringify(res) },
      note: `Return maximums for all sliding windows.`,
      result: res,
    };
  }
};
