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
    nums: [1, 12, -5, -6, 50, 3],
    k: 4,
  },
  samples: [
    { input: { nums: [1, 12, -5, -6, 50, 3], k: 4 }, expected: 12.75 },
    { input: { nums: [5], k: 1 }, expected: 5 },
  ],
  run: function* (input, L) {
    const { nums, k } = input;

    yield {
      line: L('long long windowSum = 0;'),
      event: 'init',
      state: apState(buildCells(nums), []),
      vars: { k },
      note: 'Initialize the sum variable to 0.',
    };
    
    let sum = 0;
    
    for (let i = 0; i < k; i++) {
      sum += nums[i];
      yield {
        line: L('for (int i = 0; i < k; i++) {'),
        event: 'init',
        state: apState(buildCells(nums, { [i]: 'window' }), [{ name: 'i', index: i, variant: 'a' }]),
        vars: { k, sum },
        note: `Add nums[${i}] to sum to build the initial window of size ${k}.`,
      };
    }
    
    let maxSum = sum;
    
    yield {
      line: L('long long maxSum = windowSum;'),
      event: 'init',
      state: apState(buildCells(nums, Array.from({length: k}, (_, i) => [i, 'window'] as const).reduce((a, [i, v]) => ({...a, [i]: v}), {})), []),
      vars: { k, sum, maxSum },
      note: 'Initialize maxSum with the sum of the first window.',
    };

    for (let i = k; i < nums.length; i++) {
      yield {
        line: L('for (int i = k; i < n; i++) {'),
        event: 'compare',
        state: apState(
          buildCells(nums, 
            Array.from({length: k}, (_, j) => [i - k + j, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})
          ), 
          [{ name: 'i', index: i, variant: 'a' }]
        ),
        vars: { k, sum, maxSum, i },
        note: `Slide the window. Next element to add is nums[${i}], element to remove is nums[${i - k}].`,
      };

      sum = sum + nums[i] - nums[i - k];
      
      yield {
        line: L('windowSum += nums[i] - nums[i - k];'),
        event: 'calc',
        state: apState(
          buildCells(nums, 
            Array.from({length: k}, (_, j) => [i - k + 1 + j, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})
          ), 
          [{ name: 'i', index: i, variant: 'a' }]
        ),
        vars: { k, sum, maxSum, i },
        note: `Updated sum: ${sum}.`,
      };

      if (sum > maxSum) {
        maxSum = sum;
        yield {
          line: L('maxSum = max(maxSum, windowSum);'),
          event: 'calc',
          state: apState(
            buildCells(nums, 
              Array.from({length: k}, (_, j) => [i - k + 1 + j, 'success'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})
            ), 
            [{ name: 'i', index: i, variant: 'a' }]
          ),
          vars: { k, sum, maxSum, i },
          note: `Found new maxSum: ${maxSum}.`,
        };
      } else {
        yield {
          line: L('maxSum = max(maxSum, windowSum);'),
          event: 'calc',
          state: apState(
            buildCells(nums, 
              Array.from({length: k}, (_, j) => [i - k + 1 + j, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})
            ), 
            [{ name: 'i', index: i, variant: 'a' }]
          ),
          vars: { k, sum, maxSum, i },
          note: `maxSum remains ${maxSum}.`,
        };
      }
    }

    yield {
      line: L('return (double)maxSum / k;'),
      event: 'done',
      state: apState(buildCells(nums), []),
      vars: { k, sum, maxSum },
      note: `Return maxSum / k: ${maxSum / k}.`,
      result: maxSum / k,
    };
  }
};
