import type { TraceModule, Step, ArrayPointersState, ArrayCell } from '../lib/types';

export const trace: TraceModule<{ height: number[] }> = {
  renderer: 'array-pointers',
  inputSchema: {
    height: { type: 'int-array', label: 'Elevation Heights', min: 0, max: 20 }
  },
  defaultInput: {
    height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
  },
  samples: [
    { input: { height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] }, expected: 6 },
    { input: { height: [4, 2, 0, 3, 2, 5] }, expected: 9 }
  ],
  run: function* (input, L) {
    const { height } = input;
    const array: ArrayCell[] = height.map(val => ({ value: val, state: 'idle' }));
    
    const getState = (
      left: number, 
      right: number, 
      leftMax: number, 
      rightMax: number, 
      water: number, 
      active?: number,
      fill?: number
    ): ArrayPointersState => {
      const cloned = JSON.parse(JSON.stringify(array));
      if (left < cloned.length) cloned[left].state = 'pointer-a';
      if (right >= 0 && right < cloned.length) {
          if (cloned[right].state === 'pointer-a') cloned[right].state = 'success';
          else cloned[right].state = 'pointer-b';
      }
      if (active !== undefined && cloned[active]) cloned[active].state = 'active';
      if (fill !== undefined && cloned[fill]) cloned[fill].state = 'visited'; // showing filled water
      
      const pointers = [];
      if (left < cloned.length) pointers.push({ name: 'left', index: left, variant: 'a' as const });
      if (right >= 0 && right < cloned.length) pointers.push({ name: 'right', index: right, variant: 'b' as const });

      return {
        renderer: 'array-pointers',
        array: cloned,
        pointers,
        hash: { leftMax, rightMax, water }
      };
    };

    yield {
      line: L('int left = 0, right = height.size() - 1;'),
      event: 'init',
      state: getState(0, height.length - 1, 0, 0, 0),
      vars: {},
      note: 'Initialize left and right pointers at the ends of the array.'
    } as Step;

    let left = 0;
    let right = height.length - 1;
    let leftMax = 0;
    let rightMax = 0;
    let water = 0;

    yield {
      line: L('int leftMax = 0, rightMax = 0, water = 0;'),
      event: 'init',
      state: getState(left, right, leftMax, rightMax, water),
      vars: { left, right, leftMax, rightMax, water },
      note: 'Initialize variables to track maximums and total water.'
    } as Step;

    while (left < right) {
      yield {
        line: L('while (left < right) {'),
        event: 'compare',
        state: getState(left, right, leftMax, rightMax, water),
        vars: { left, right, leftMax, rightMax, water },
        note: 'Check if pointers have not met.'
      } as Step;

      yield {
        line: L('if (height[left] < height[right]) {'),
        event: 'compare',
        state: getState(left, right, leftMax, rightMax, water),
        vars: { left, right, leftMax, rightMax, water },
        note: 'Compare heights at left and right pointers. The smaller side determines trapped water.'
      } as Step;

      if (height[left] < height[right]) {
        yield {
          line: L('if (height[left] >= leftMax) leftMax = height[left];'),
          event: 'compare',
          state: getState(left, right, leftMax, rightMax, water, left),
          vars: { left, right, leftMax, rightMax, water },
          note: 'Check if current left height updates the left maximum.'
        } as Step;

        if (height[left] >= leftMax) {
          leftMax = height[left];
          yield {
            line: L('if (height[left] >= leftMax) leftMax = height[left];'),
            event: 'record',
            state: getState(left, right, leftMax, rightMax, water, left),
            vars: { left, right, leftMax, rightMax, water },
            note: 'Update leftMax since current height is greater or equal.'
          } as Step;
        } else {
          const trapped = leftMax - height[left];
          water += trapped;
          yield {
            line: L('else water += leftMax - height[left];'),
            event: 'record',
            state: getState(left, right, leftMax, rightMax, water, left, left),
            vars: { left, right, leftMax, rightMax, water },
            note: `Add trapped water (${leftMax} - ${height[left]} = ${trapped}).`
          } as Step;
        }

        left++;
        yield {
          line: L('left++;'),
          event: 'move-pointer',
          state: getState(left, right, leftMax, rightMax, water),
          vars: { left, right, leftMax, rightMax, water },
          note: 'Advance left pointer.'
        } as Step;

      } else {
        yield {
          line: L('if (height[right] >= rightMax) rightMax = height[right];'),
          event: 'compare',
          state: getState(left, right, leftMax, rightMax, water, right),
          vars: { left, right, leftMax, rightMax, water },
          note: 'Right side is smaller or equal. Check if it updates rightMax.'
        } as Step;

        if (height[right] >= rightMax) {
          rightMax = height[right];
          yield {
            line: L('if (height[right] >= rightMax) rightMax = height[right];'),
            event: 'record',
            state: getState(left, right, leftMax, rightMax, water, right),
            vars: { left, right, leftMax, rightMax, water },
            note: 'Update rightMax since current height is greater or equal.'
          } as Step;
        } else {
          const trapped = rightMax - height[right];
          water += trapped;
          yield {
            line: L('else water += rightMax - height[right];'),
            event: 'record',
            state: getState(left, right, leftMax, rightMax, water, right, right),
            vars: { left, right, leftMax, rightMax, water },
            note: `Add trapped water (${rightMax} - ${height[right]} = ${trapped}).`
          } as Step;
        }

        right--;
        yield {
          line: L('right--;'),
          event: 'move-pointer',
          state: getState(left, right, leftMax, rightMax, water),
          vars: { left, right, leftMax, rightMax, water },
          note: 'Move right pointer inward.'
        } as Step;
      }
    }

    yield {
      line: L('return water;'),
      event: 'done',
      state: getState(left, right, leftMax, rightMax, water),
      vars: { left, right, leftMax, rightMax, water },
      note: 'Pointers met. Return total trapped water.',
      result: water
    } as Step;
  }
};
