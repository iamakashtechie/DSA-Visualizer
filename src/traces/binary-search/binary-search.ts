import type { TraceModule } from '../lib/types';
import { buildCells, apState } from '../lib/helpers';

interface Input {
  nums: number[];
  target: number;
}

export const trace: TraceModule<Input> = {
  renderer: 'array-pointers',
  inputSchema: {
    nums: { type: 'int-array', label: 'Sorted Array', min: 1, max: 15 },
    target: { type: 'int', label: 'Target to search' },
  },
  defaultInput: {
    nums: [-1, 0, 3, 5, 9, 12],
    target: 9,
  },
  samples: [
    { input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 }, expected: 4 },
    { input: { nums: [-1, 0, 3, 5, 9, 12], target: 2 }, expected: -1 },
  ],
  run: function* (input, L) {
    const { nums, target } = input;

    yield {
      line: L('int lo = 0, hi = nums.size() - 1;'),
      event: 'init',
      state: apState(buildCells(nums), []),
      vars: { target },
      note: 'Initialize lo and hi to cover the entire search space.',
    };

    let lo = 0;
    let hi = nums.length - 1;

    while (lo <= hi) {
      yield {
        line: L('while (lo <= hi) {'),
        event: 'compare',
        state: apState(
          buildCells(nums, { [lo]: 'pointer-a', [hi]: 'pointer-b' }),
          [
            { name: 'lo', index: lo, variant: 'a' },
            { name: 'hi', index: hi, variant: 'b' },
          ],
          { window: { left: lo, right: hi } },
        ),
        vars: { target, lo, hi, mid: null },
        note: `Search space is valid (lo <= hi). Window is [${lo}, ${hi}].`,
      };

      const mid = Math.floor(lo + (hi - lo) / 2);

      yield {
        line: L('int mid = lo + (hi - lo) / 2;'),
        event: 'compare',
        state: apState(
          buildCells(nums, { [lo]: 'pointer-a', [hi]: 'pointer-b', [mid]: 'pointer-c' }),
          [
            { name: 'lo', index: lo, variant: 'a' },
            { name: 'hi', index: hi, variant: 'b' },
            { name: 'mid', index: mid, variant: 'c' },
          ],
          { window: { left: lo, right: hi } },
        ),
        vars: { target, lo, hi, mid },
        note: `Calculate middle index: ${mid}. Checking value ${nums[mid]}.`,
      };

      if (nums[mid] === target) {
        yield {
          line: L('if (nums[mid] == target) return mid;'),
          event: 'found',
          state: apState(buildCells(nums, { [mid]: 'success' }), [
            { name: 'mid', index: mid, variant: 'c' },
          ]),
          vars: { target, lo, hi, mid },
          note: `Found target (${target}) at index ${mid}!`,
          result: mid,
        };
        return;
      } else if (nums[mid] < target) {
        yield {
          line: L('else if (nums[mid] < target) lo = mid + 1;'),
          event: 'compare',
          state: apState(
            buildCells(nums, { [lo]: 'pointer-a', [hi]: 'pointer-b', [mid]: 'pointer-c' }),
            [
              { name: 'lo', index: lo, variant: 'a' },
              { name: 'hi', index: hi, variant: 'b' },
              { name: 'mid', index: mid, variant: 'c' },
            ],
            { window: { left: lo, right: hi } },
          ),
          vars: { target, lo, hi, mid },
          note: `${nums[mid]} < ${target}. Target must be in the right half.`,
        };

        lo = mid + 1;

        yield {
          line: L('else if (nums[mid] < target) lo = mid + 1;'),
          event: 'move-pointer',
          state: apState(
            buildCells(nums, { [lo]: 'pointer-a', [hi]: 'pointer-b' }),
            [
              { name: 'lo', index: lo, variant: 'a' },
              { name: 'hi', index: hi, variant: 'b' },
            ],
            { window: { left: lo, right: hi } },
          ),
          vars: { target, lo, hi, mid },
          note: `Shrink window from left. New lo is ${lo}.`,
        };
      } else {
        yield {
          line: L('else hi = mid - 1;'),
          event: 'compare',
          state: apState(
            buildCells(nums, { [lo]: 'pointer-a', [hi]: 'pointer-b', [mid]: 'pointer-c' }),
            [
              { name: 'lo', index: lo, variant: 'a' },
              { name: 'hi', index: hi, variant: 'b' },
              { name: 'mid', index: mid, variant: 'c' },
            ],
            { window: { left: lo, right: hi } },
          ),
          vars: { target, lo, hi, mid },
          note: `${nums[mid]} > ${target}. Target must be in the left half.`,
        };

        hi = mid - 1;

        yield {
          line: L('else hi = mid - 1;'),
          event: 'move-pointer',
          state: apState(
            buildCells(nums, { [lo]: 'pointer-a', [hi]: 'pointer-b' }),
            [
              { name: 'lo', index: lo, variant: 'a' },
              { name: 'hi', index: hi, variant: 'b' },
            ],
            { window: { left: lo, right: hi } },
          ),
          vars: { target, lo, hi, mid },
          note: `Shrink window from right. New hi is ${hi}.`,
        };
      }
    }

    yield {
      line: L('return -1;'),
      event: 'done',
      state: apState(buildCells(nums), []),
      vars: { target, lo, hi },
      note: `lo (${lo}) > hi (${hi}). Search space exhausted, target not found.`,
      result: -1,
    };
  },
};
