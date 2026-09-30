import type { TraceModule } from '../lib/types';
import { buildCells, apState } from '../lib/helpers';

interface Input {
  s: string;
  t: string;
}

export const trace: TraceModule<Input> = {
  renderer: 'array-pointers',
  inputSchema: {
    s: { type: 'string', label: 'String S' },
    t: { type: 'string', label: 'String T' },
  },
  defaultInput: {
    s: 'ADOBECODEBANC',
    t: 'ABC',
  },
  samples: [
    { input: { s: 'ADOBECODEBANC', t: 'ABC' }, expected: 'BANC' },
    { input: { s: 'a', t: 'a' }, expected: 'a' },
    { input: { s: 'a', t: 'aa' }, expected: '' },
  ],
  run: function* (input, L) {
    const { s, t } = input;
    const arr = s.split('');

    if (s.length === 0 || t.length === 0) {
      yield {
        line: L('if (s.empty() || t.empty()) return "";'),
        event: 'done',
        state: apState(buildCells(arr), []),
        vars: { s, t },
        note: 'Empty strings provided, return "".',
        result: '',
      };
      return;
    }

    const dictT = new Map<string, number>();
    for (const char of t) {
      dictT.set(char, (dictT.get(char) || 0) + 1);
    }
    const required = dictT.size;

    yield {
      line: L('unordered_map<char, int> need;'),
      event: 'init',
      state: apState(buildCells(arr), [], { hash: Object.fromEntries(dictT.entries()) }),
      vars: { required },
      note: `Build frequency map for string t. Required unique chars: ${required}.`,
    };

    let left = 0;
    let right = 0;
    let formed = 0;
    const windowCounts = new Map<string, number>();
    let ans = [-1, 0, 0]; // length, left, right

    yield {
      line: L('int left = 0, minLen = INT_MAX, minStart = 0;'),
      event: 'init',
      state: apState(buildCells(arr), [{ name: 'left', index: left, variant: 'a' }, { name: 'right', index: right, variant: 'b' }], { hash: Object.fromEntries(windowCounts.entries()) }),
      vars: { left, right, formed },
      note: 'Initialize sliding window pointers.',
    };

    while (right < s.length) {
      const char = arr[right];
      windowCounts.set(char, (windowCounts.get(char) || 0) + 1);

      yield {
        line: L('window[c]++;'),
        event: 'record',
        state: apState(
          buildCells(arr, Array.from({length: right - left + 1}, (_, i) => [left + i, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
          [{ name: 'left', index: left, variant: 'a' }, { name: 'right', index: right, variant: 'b' }],
          { hash: Object.fromEntries(windowCounts.entries()) }
        ),
        vars: { left, right, formed, char },
        note: `Add char '${char}' to window counts.`,
      };

      if (dictT.has(char) && windowCounts.get(char) === dictT.get(char)) {
        formed++;
        yield {
          line: L('if (need.count(c) && window[c] == need[c]) {'),
          event: 'calc',
          state: apState(
            buildCells(arr, Array.from({length: right - left + 1}, (_, i) => [left + i, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
            [{ name: 'left', index: left, variant: 'a' }, { name: 'right', index: right, variant: 'b' }],
            { hash: Object.fromEntries(windowCounts.entries()) }
          ),
          vars: { left, right, formed, required },
          note: `Formed requirement for '${char}'. Total formed: ${formed}/${required}.`,
        };
      }

      while (left <= right && formed === required) {
        const c = arr[left];

        yield {
          line: L('while (formed == required) {'),
          event: 'compare',
          state: apState(
            buildCells(arr, Array.from({length: right - left + 1}, (_, i) => [left + i, 'success'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
            [{ name: 'left', index: left, variant: 'a' }, { name: 'right', index: right, variant: 'b' }],
            { hash: Object.fromEntries(windowCounts.entries()) }
          ),
          vars: { left, right, formed, required },
          note: `Valid window found! Check if it's the minimum.`,
        };

        if (ans[0] === -1 || right - left + 1 < ans[0]) {
          ans[0] = right - left + 1;
          ans[1] = left;
          ans[2] = right;
          yield {
            line: L('minLen = right - left + 1;'),
            event: 'record',
            state: apState(
              buildCells(arr, Array.from({length: right - left + 1}, (_, i) => [left + i, 'success'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
              [{ name: 'left', index: left, variant: 'a' }, { name: 'right', index: right, variant: 'b' }],
              { hash: Object.fromEntries(windowCounts.entries()) }
            ),
            vars: { left, right, minLen: ans[0] },
            note: `New minimum window of length ${ans[0]}.`,
          };
        }

        windowCounts.set(c, windowCounts.get(c)! - 1);
        
        yield {
          line: L('window[leftChar]--;'),
          event: 'record',
          state: apState(
            buildCells(arr, Array.from({length: right - left + 1}, (_, i) => [left + i, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
            [{ name: 'left', index: left, variant: 'a' }, { name: 'right', index: right, variant: 'b' }],
            { hash: Object.fromEntries(windowCounts.entries()) }
          ),
          vars: { left, right, formed, c },
          note: `Remove '${c}' from window counts.`,
        };

        if (dictT.has(c) && windowCounts.get(c)! < dictT.get(c)!) {
          formed--;
          yield {
            line: L('if (need.count(leftChar) && window[leftChar] < need[leftChar]) {'),
            event: 'calc',
            state: apState(
              buildCells(arr, Array.from({length: right - left + 1}, (_, i) => [left + i, 'danger'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
              [{ name: 'left', index: left, variant: 'a' }, { name: 'right', index: right, variant: 'b' }],
              { hash: Object.fromEntries(windowCounts.entries()) }
            ),
            vars: { left, right, formed, required },
            note: `Window no longer valid. Total formed: ${formed}/${required}.`,
          };
        }

        left++;
        
        yield {
          line: L('left++;'),
          event: 'move-pointer',
          state: apState(
            buildCells(arr, Array.from({length: right - left + 1}, (_, i) => [left + i, 'window'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {})),
            [{ name: 'left', index: left, variant: 'a' }, { name: 'right', index: right, variant: 'b' }],
            { hash: Object.fromEntries(windowCounts.entries()) }
          ),
          vars: { left, right, formed, required },
          note: `Move left pointer.`,
        };
      }
      
      right++;
    }

    const res = ans[0] === -1 ? "" : s.substring(ans[1], ans[2] + 1);
    yield {
      line: L('return (minLen == INT_MAX) ? "" : s.substr(minStart, minLen);'),
      event: 'done',
      state: apState(
        buildCells(arr, ans[0] !== -1 ? Array.from({length: ans[0]}, (_, i) => [ans[1] + i, 'success'] as const).reduce((a, [idx, v]) => ({...a, [idx]: v}), {}) : {}), 
        []
      ),
      vars: { res },
      note: `Return minimum window: "${res}".`,
      result: res,
    };
  }
};
