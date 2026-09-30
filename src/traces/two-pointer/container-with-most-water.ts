import type { TraceModule } from '../lib/types';
import { buildCells, apState } from '../lib/helpers';

interface Input {
  height: number[];
}

export const trace: TraceModule<Input> = {
  renderer: 'array-pointers',
  inputSchema: {
    height: { type: 'int-array', label: 'Bar Heights', min: 2, max: 15 },
  },
  defaultInput: {
    height: [1, 8, 6, 2, 5, 4, 8, 3, 7],
  },
  samples: [
    { input: { height: [1, 8, 6, 2, 5, 4, 8, 3, 7] }, expected: 49 },
    { input: { height: [1, 1] }, expected: 1 },
  ],
  run: function* (input, L) {
    const { height } = input;

    yield {
      line: L('int left = 0, right = height.size() - 1;'),
      event: 'init',
      state: apState(buildCells(height), []),
      vars: {},
      note: 'Initialize pointers at both ends to maximize width.',
    };

    let left = 0;
    let right = height.length - 1;
    let maxWater = 0;

    yield {
      line: L('int maxWater = 0;'),
      event: 'init',
      state: apState(buildCells(height, { [left]: 'pointer-a', [right]: 'pointer-b' }), [
        { name: 'left', index: left, variant: 'a' },
        { name: 'right', index: right, variant: 'b' },
      ]),
      vars: { left, right, maxWater },
      note: 'maxWater tracks the largest container area found so far.',
    };

    while (left < right) {
      yield {
        line: L('while (left < right) {'),
        event: 'compare',
        state: apState(
          buildCells(height, { [left]: 'pointer-a', [right]: 'pointer-b' }),
          [
            { name: 'left', index: left, variant: 'a' },
            { name: 'right', index: right, variant: 'b' },
          ],
          { window: { left, right } },
        ),
        vars: { left, right, maxWater, width: null, h: null },
        note: `left < right, check container between ${left} and ${right}.`,
      };

      const width = right - left;
      yield {
        line: L('int width = right - left;'),
        event: 'compare',
        state: apState(
          buildCells(height, { [left]: 'pointer-a', [right]: 'pointer-b' }),
          [
            { name: 'left', index: left, variant: 'a' },
            { name: 'right', index: right, variant: 'b' },
          ],
          { window: { left, right } },
        ),
        vars: { left, right, maxWater, width, h: null },
        note: `Container width is ${width}.`,
      };

      const h = Math.min(height[left], height[right]);
      yield {
        line: L('int h = min(height[left], height[right]);'),
        event: 'compare',
        state: apState(
          buildCells(height, { [left]: 'pointer-a', [right]: 'pointer-b' }),
          [
            { name: 'left', index: left, variant: 'a' },
            { name: 'right', index: right, variant: 'b' },
          ],
          { window: { left, right } },
        ),
        vars: { left, right, maxWater, width, h },
        note: `Height is limited by the shorter line: min(${height[left]}, ${height[right]}) = ${h}.`,
      };

      const currentArea = width * h;
      maxWater = Math.max(maxWater, currentArea);
      yield {
        line: L('maxWater = max(maxWater, width * h);'),
        event: 'record',
        state: apState(
          buildCells(height, { [left]: 'pointer-a', [right]: 'pointer-b' }),
          [
            { name: 'left', index: left, variant: 'a' },
            { name: 'right', index: right, variant: 'b' },
          ],
          { window: { left, right } },
        ),
        vars: { left, right, maxWater, width, h },
        note: `Area is ${width} * ${h} = ${currentArea}. maxWater becomes ${maxWater}.`,
      };

      if (height[left] < height[right]) {
        yield {
          line: L('if (height[left] < height[right]) left++;'),
          event: 'compare',
          state: apState(buildCells(height, { [left]: 'pointer-a', [right]: 'pointer-b' }), [
            { name: 'left', index: left, variant: 'a' },
            { name: 'right', index: right, variant: 'b' },
          ]),
          vars: { left, right, maxWater, width, h },
          note: `Left line is shorter. Moving the left pointer right to try and find a taller line.`,
        };
        left++;
      } else {
        yield {
          line: L('else right--;'),
          event: 'compare',
          state: apState(buildCells(height, { [left]: 'pointer-a', [right]: 'pointer-b' }), [
            { name: 'left', index: left, variant: 'a' },
            { name: 'right', index: right, variant: 'b' },
          ]),
          vars: { left, right, maxWater, width, h },
          note: `Right line is shorter (or equal). Moving the right pointer left to try and find a taller line.`,
        };
        right--;
      }
    }

    yield {
      line: L('return maxWater;'),
      event: 'done',
      state: apState(buildCells(height), []),
      vars: { maxWater },
      note: 'Pointers crossed. We explored all candidate containers.',
      result: maxWater,
    };
  },
};
