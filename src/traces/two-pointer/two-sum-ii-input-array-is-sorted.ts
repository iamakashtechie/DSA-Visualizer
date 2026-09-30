import type { TraceModule } from '../lib/types';
import { buildCells, apState } from '../lib/helpers';

interface Input {
  numbers: number[];
  target: number;
}

export const trace: TraceModule<Input> = {
  renderer: 'array-pointers',
  inputSchema: {
    numbers: { type: 'int-array', label: 'Sorted Array', min: 1, max: 15 },
    target: { type: 'int', label: 'Target Sum' },
  },
  defaultInput: {
    numbers: [2, 7, 11, 15],
    target: 9,
  },
  samples: [
    { input: { numbers: [2, 7, 11, 15], target: 9 }, expected: [1, 2] },
    { input: { numbers: [2, 3, 4], target: 6 }, expected: [1, 3] },
    { input: { numbers: [-1, 0], target: -1 }, expected: [1, 2] },
  ],
  run: function* (input, L) {
    const { numbers, target } = input;

    yield {
      line: L('int left = 0, right = numbers.size() - 1;'),
      event: 'init',
      state: apState(buildCells(numbers), []),
      vars: { target },
      note: 'Initialize two pointers at opposite ends of the sorted array.',
    };

    let left = 0;
    let right = numbers.length - 1;

    while (left < right) {
      yield {
        line: L('while (left < right) {'),
        event: 'compare',
        state: apState(buildCells(numbers, { [left]: 'pointer-a', [right]: 'pointer-b' }), [
          { name: 'left', index: left, variant: 'a' },
          { name: 'right', index: right, variant: 'b' },
        ]),
        vars: { target, left, right, sum: null },
        note: `left (${left}) < right (${right}), loop continues.`,
      };

      const sum = numbers[left] + numbers[right];

      yield {
        line: L('int sum = numbers[left] + numbers[right];'),
        event: 'compare',
        state: apState(buildCells(numbers, { [left]: 'pointer-a', [right]: 'pointer-b' }), [
          { name: 'left', index: left, variant: 'a' },
          { name: 'right', index: right, variant: 'b' },
        ]),
        vars: { target, left, right, sum },
        note: `Sum is ${numbers[left]} + ${numbers[right]} = ${sum}.`,
      };

      if (sum === target) {
        yield {
          line: L('if (sum == target) {'),
          event: 'compare',
          state: apState(buildCells(numbers, { [left]: 'success', [right]: 'success' }), [
            { name: 'left', index: left, variant: 'a' },
            { name: 'right', index: right, variant: 'b' },
          ]),
          vars: { target, left, right, sum },
          note: `Sum matches the target (${target})! We found our pair.`,
        };

        yield {
          line: L('return {left + 1, right + 1};'),
          event: 'found',
          state: apState(buildCells(numbers, { [left]: 'success', [right]: 'success' }), [
            { name: 'left', index: left, variant: 'a' },
            { name: 'right', index: right, variant: 'b' },
          ]),
          vars: { target, left, right, sum },
          note: `Return 1-based indices: [${left + 1}, ${right + 1}].`,
          result: [left + 1, right + 1],
        };
        return;
      } else if (sum < target) {
        yield {
          line: L('} else if (sum < target) {'),
          event: 'compare',
          state: apState(buildCells(numbers, { [left]: 'pointer-a', [right]: 'pointer-b' }), [
            { name: 'left', index: left, variant: 'a' },
            { name: 'right', index: right, variant: 'b' },
          ]),
          vars: { target, left, right, sum },
          note: `Sum (${sum}) is less than target (${target}).`,
        };

        left++;

        yield {
          line: L('left++;  // need a bigger sum'),
          event: 'move-pointer',
          state: apState(buildCells(numbers, { [left]: 'pointer-a', [right]: 'pointer-b' }), [
            { name: 'left', index: left, variant: 'a' },
            { name: 'right', index: right, variant: 'b' },
          ]),
          vars: { target, left, right, sum },
          note: `To increase the sum, we move the left pointer to the right.`,
        };
      } else {
        yield {
          line: L('} else {'),
          event: 'compare',
          state: apState(buildCells(numbers, { [left]: 'pointer-a', [right]: 'pointer-b' }), [
            { name: 'left', index: left, variant: 'a' },
            { name: 'right', index: right, variant: 'b' },
          ]),
          vars: { target, left, right, sum },
          note: `Sum (${sum}) is greater than target (${target}).`,
        };

        right--;

        yield {
          line: L('right--; // need a smaller sum'),
          event: 'move-pointer',
          state: apState(buildCells(numbers, { [left]: 'pointer-a', [right]: 'pointer-b' }), [
            { name: 'left', index: left, variant: 'a' },
            { name: 'right', index: right, variant: 'b' },
          ]),
          vars: { target, left, right, sum },
          note: `To decrease the sum, we move the right pointer to the left.`,
        };
      }
    }

    yield {
      line: L('return {}; // no solution found'),
      event: 'done',
      state: apState(buildCells(numbers), []),
      vars: { target, left, right },
      note: `Pointers crossed without finding target. Return empty array.`,
      result: [],
    };
  },
};
