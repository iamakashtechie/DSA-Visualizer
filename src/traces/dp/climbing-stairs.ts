import type { TraceModule, Step } from '../lib/types';
import { DPTableState } from '../lib/types';

interface Input {
  n: number;
}

export const trace: TraceModule<Input> = {
  renderer: 'dp-table',
  inputSchema: {
    n: { type: 'int', label: 'Steps (n)', min: 1, max: 10 },
  },
  defaultInput: {
    n: 5,
  },
  samples: [
    { input: { n: 2 }, expected: 2 },
    { input: { n: 3 }, expected: 3 },
    { input: { n: 5 }, expected: 8 },
  ],
  run: function* (input, L) {
    const { n } = input;

    // Helper to generate the table state
    const getState = (dp: number[], pointers?: { i?: number }): DPTableState => {
      const table = [
        dp.map((val, idx) => ({
          id: `cell-${idx}`,
          value: val === -1 ? '' : val,
          state: (pointers?.i === idx ? 'pointer-a' : (val !== -1 ? 'success' : 'idle')) as any,
        }))
      ];
      const colLabels = Array.from({ length: n + 1 }, (_, i) => `i=${i}`);
      
      const ptrs = [];
      if (pointers?.i !== undefined && pointers.i >= 0 && pointers.i <= n) {
        ptrs.push({ r: 0, c: pointers.i, variant: 'a' as const, name: 'i' });
      }

      return {
        renderer: 'dp-table',
        table,
        colLabels,
        rowLabels: ['dp'],
        pointers: ptrs,
      };
    };

    yield {
      line: L('if (n <= 2) return n;'),
      event: 'init',
      state: getState(Array(n + 1).fill(-1)),
      vars: { n },
      note: 'Base case check: if n <= 2, the answer is just n.',
    } as Step;

    if (n <= 2) {
      yield {
        line: L('if (n <= 2) return n;'),
        event: 'done',
        state: getState(Array(n + 1).fill(-1)),
        vars: { n },
        note: 'n is small enough to return directly.',
        result: n,
      } as Step;
      return;
    }

    const dp = Array(n + 1).fill(-1);
    
    yield {
      line: L('vector<int> dp(n + 1);'),
      event: 'init',
      state: getState(dp),
      vars: { n },
      note: 'Initialize DP table of size n+1.',
    } as Step;

    dp[1] = 1;
    yield {
      line: L('dp[1] = 1;'),
      event: 'record',
      state: getState(dp),
      vars: { n },
      note: '1 way to climb 1 step.',
    } as Step;

    dp[2] = 2;
    yield {
      line: L('dp[2] = 2;'),
      event: 'record',
      state: getState(dp),
      vars: { n },
      note: '2 ways to climb 2 steps (1+1 or 2).',
    } as Step;

    for (let i = 3; i <= n; i++) {
      yield {
        line: L('for (int i = 3; i <= n; i++) {'),
        event: 'compare',
        state: getState(dp, { i }),
        vars: { n, i },
        note: `Calculating ways for step ${i}.`,
      } as Step;

      dp[i] = dp[i - 1] + dp[i - 2];
      
      yield {
        line: L('dp[i] = dp[i - 1] + dp[i - 2];'),
        event: 'record',
        state: getState(dp, { i }),
        vars: { n, i },
        note: `dp[${i}] = dp[${i-1}] (${dp[i-1]}) + dp[${i-2}] (${dp[i-2]}) = ${dp[i]}.`,
      } as Step;
    }

    yield {
      line: L('return dp[n];'),
      event: 'done',
      state: getState(dp),
      vars: { n },
      note: 'Loop finished. Return the last element.',
      result: dp[n],
    } as Step;
  },
};
