import type { TraceModule } from '../lib/types';
import { buildCells, apState } from '../lib/helpers';

interface Input {
  s: string;
  k: number;
}

export const trace: TraceModule<Input> = {
  renderer: 'array-pointers',
  inputSchema: {
    s: { type: 'string', label: 'String' },
    k: { type: 'int', label: 'k replacements', min: 0 },
  },
  defaultInput: {
    s: 'AABABBA',
    k: 1,
  },
  samples: [
    { input: { s: 'AABABBA', k: 1 }, expected: 4 },
    { input: { s: 'ABAB', k: 2 }, expected: 4 },
  ],
  run: function* (input, L) {
    const { s, k } = input;
    const arr = s.split('');

    yield {
      line: L('vector<int> freq(26, 0);'),
      event: 'init',
      state: apState(buildCells(arr), []),
      vars: { k },
      note: 'Initialize count array, maxf (max frequency), and pointers.',
    };

    let left = 0;
    let maxf = 0;
    const count = new Map<string, number>();

    for (let right = 0; right < s.length; right++) {
      const char = arr[right];
      count.set(char, (count.get(char) || 0) + 1);
      maxf = Math.max(maxf, count.get(char)!);

      yield {
        line: L('freq[s[right] - \'A\']++;'),
        event: 'record',
        state: apState(
          buildCells(arr, Array.from({length: right - left + 1}, (_, i) => [left + i, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
          [{ name: 'left', index: left, variant: 'a' }, { name: 'right', index: right, variant: 'b' }],
          { hash: Object.fromEntries(count.entries()) }
        ),
        vars: { left, right, maxf, char },
        note: `Add '${char}' to count. Update max frequency: ${maxf}.`,
      };

      if (right - left + 1 - maxf > k) {
        yield {
          line: L('if (windowSize - maxFreq > k) {'),
          event: 'compare',
          state: apState(
            buildCells(arr, Array.from({length: right - left + 1}, (_, i) => [left + i, 'danger'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
            [{ name: 'left', index: left, variant: 'a' }, { name: 'right', index: right, variant: 'b' }],
            { hash: Object.fromEntries(count.entries()) }
          ),
          vars: { left, right, maxf, k, windowSize: right - left + 1 },
          note: `Window size (${right - left + 1}) - maxf (${maxf}) > ${k}. Need to shrink window.`,
        };

        const leftChar = arr[left];
        count.set(leftChar, count.get(leftChar)! - 1);
        left++;

        yield {
          line: L('freq[s[left] - \'A\']--;'),
          event: 'move-pointer',
          state: apState(
            buildCells(arr, Array.from({length: right - left + 1}, (_, i) => [left + i, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
            [{ name: 'left', index: left, variant: 'a' }, { name: 'right', index: right, variant: 'b' }],
            { hash: Object.fromEntries(count.entries()) }
          ),
          vars: { left, right, maxf, k, leftChar },
          note: `Removed '${leftChar}' from count. Moved left pointer.`,
        };
      } else {
        yield {
          line: L('if (windowSize - maxFreq > k) {'),
          event: 'compare',
          state: apState(
            buildCells(arr, Array.from({length: right - left + 1}, (_, i) => [left + i, 'success'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
            [{ name: 'left', index: left, variant: 'a' }, { name: 'right', index: right, variant: 'b' }],
            { hash: Object.fromEntries(count.entries()) }
          ),
          vars: { left, right, maxf, k, windowSize: right - left + 1 },
          note: `Window size (${right - left + 1}) - maxf (${maxf}) <= ${k}. Valid window.`,
        };
      }
    }

    const res = s.length - left;
    yield {
      line: L('return maxLen;'),
      event: 'done',
      state: apState(buildCells(arr), [], { hash: Object.fromEntries(count.entries()) }),
      vars: { res },
      note: `Return maximum length: ${res}.`,
      result: res,
    };
  }
};
