import type { TraceModule } from '../lib/types';
import { buildCells, apState } from '../lib/helpers';

interface Input {
  s: string;
}

export const trace: TraceModule<Input> = {
  renderer: 'array-pointers',
  inputSchema: {
    s: { type: 'string', label: 'String' },
  },
  defaultInput: {
    s: 'abcabcbb',
  },
  samples: [
    { input: { s: 'abcabcbb' }, expected: 3 },
    { input: { s: 'bbbbb' }, expected: 1 },
    { input: { s: 'pwwkew' }, expected: 3 },
  ],
  run: function* (input, L) {
    const { s } = input;
    const arr = s.split('');
    
    yield {
      line: L('int left = 0, maxLen = 0;'),
      event: 'init',
      state: apState(buildCells(arr), []),
      vars: { left: 0, maxLength: 0 },
      note: 'Initialize left pointer and maxLength to 0.',
    };

    let left = 0;
    let maxLength = 0;
    const charMap = new Map<string, number>();

    for (let right = 0; right < s.length; right++) {
      const char = arr[right];

      yield {
        line: L('for (int right = 0; right < s.size(); right++) {'),
        event: 'move-pointer',
        state: apState(
          buildCells(arr, Array.from({length: right - left}, (_, i) => [left + i, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
          [
            { name: 'left', index: left, variant: 'a' },
            { name: 'right', index: right, variant: 'b' }
          ],
          { hash: Object.fromEntries(charMap.entries()) }
        ),
        vars: { left, right, maxLength, char },
        note: `Move right pointer to index ${right} (char '${char}').`,
      };

      if (charMap.has(char) && charMap.get(char)! >= left) {
        yield {
          line: L('if (lastSeen.count(c) && lastSeen[c] >= left) {'),
          event: 'compare',
          state: apState(
            buildCells(arr, Array.from({length: right - left + 1}, (_, i) => [left + i, 'danger'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
            [
              { name: 'left', index: left, variant: 'a' },
              { name: 'right', index: right, variant: 'b' }
            ],
            { hash: Object.fromEntries(charMap.entries()) }
          ),
          vars: { left, right, maxLength, char },
          note: `Duplicate '${char}' found in current window at index ${charMap.get(char)}.`,
        };

        left = charMap.get(char)! + 1;

        yield {
          line: L('left = lastSeen[c] + 1;'),
          event: 'move-pointer',
          state: apState(
            buildCells(arr, Array.from({length: right - left + 1}, (_, i) => [left + i, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
            [
              { name: 'left', index: left, variant: 'a' },
              { name: 'right', index: right, variant: 'b' }
            ],
            { hash: Object.fromEntries(charMap.entries()) }
          ),
          vars: { left, right, maxLength, char },
          note: `Move left pointer to ${left} to exclude the duplicate.`,
        };
      } else {
        yield {
          line: L('if (lastSeen.count(c) && lastSeen[c] >= left) {'),
          event: 'compare',
          state: apState(
            buildCells(arr, Array.from({length: right - left + 1}, (_, i) => [left + i, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
            [
              { name: 'left', index: left, variant: 'a' },
              { name: 'right', index: right, variant: 'b' }
            ],
            { hash: Object.fromEntries(charMap.entries()) }
          ),
          vars: { left, right, maxLength, char },
          note: `No duplicate found in the current window.`,
        };
      }

      charMap.set(char, right);
      yield {
        line: L('lastSeen[c] = right;'),
        event: 'record',
        state: apState(
          buildCells(arr, Array.from({length: right - left + 1}, (_, i) => [left + i, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
          [
            { name: 'left', index: left, variant: 'a' },
            { name: 'right', index: right, variant: 'b' }
          ],
          { hash: Object.fromEntries(charMap.entries()) }
        ),
        vars: { left, right, maxLength, char },
        note: `Record index ${right} for character '${char}'.`,
      };

      if (right - left + 1 > maxLength) {
        maxLength = right - left + 1;
        yield {
          line: L('maxLen = max(maxLen, right - left + 1);'),
          event: 'calc',
          state: apState(
            buildCells(arr, Array.from({length: right - left + 1}, (_, i) => [left + i, 'success'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
            [
              { name: 'left', index: left, variant: 'a' },
              { name: 'right', index: right, variant: 'b' }
            ],
            { hash: Object.fromEntries(charMap.entries()) }
          ),
          vars: { left, right, maxLength, char },
          note: `Found new max length: ${maxLength}.`,
        };
      } else {
         yield {
          line: L('maxLen = max(maxLen, right - left + 1);'),
          event: 'calc',
          state: apState(
            buildCells(arr, Array.from({length: right - left + 1}, (_, i) => [left + i, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
            [
              { name: 'left', index: left, variant: 'a' },
              { name: 'right', index: right, variant: 'b' }
            ],
            { hash: Object.fromEntries(charMap.entries()) }
          ),
          vars: { left, right, maxLength, char },
          note: `Max length remains ${maxLength}.`,
        };       
      }
    }

    yield {
      line: L('return maxLen;'),
      event: 'done',
      state: apState(buildCells(arr), [], { hash: Object.fromEntries(charMap.entries()) }),
      vars: { left, maxLength },
      note: `Return max length: ${maxLength}.`,
      result: maxLength,
    };
  }
};
