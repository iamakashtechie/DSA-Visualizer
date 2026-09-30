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
  // Actual C++:
  //   int climbStairs(int n) {
  //     if (n <= 1) return 1;
  //     int prev2 = 1, prev1 = 1; // ways to reach step 0 and step 1
  //     for (int i = 2; i <= n; i++) {
  //         int cur = prev1 + prev2;
  //         prev2 = prev1;
  //         prev1 = cur;
  //     }
  //     return prev1;
  //   }
  run: function* (input, L) {
    const { n } = input;

    // Helper to render a 2-cell "prev2 | prev1" DP table
    const getState = (prev2: number | null, prev1: number | null, step: number): DPTableState => {
      const table = [
        [
          {
            id: 'prev2',
            value: prev2 === null ? '' : prev2,
            state: 'idle' as const,
          },
          {
            id: 'prev1',
            value: prev1 === null ? '' : prev1,
            state: 'pointer-a' as const,
          },
        ],
      ];
      return {
        renderer: 'dp-table',
        table,
        colLabels: ['prev2', 'prev1'],
        rowLabels: [`i=${step}`],
        pointers: [],
      };
    };

    yield {
      line: L('if (n <= 1) return 1;'),
      event: 'init',
      state: getState(null, null, 0),
      vars: { n },
      note: 'Base case: if n ≤ 1, there is exactly 1 way.',
    } as Step;

    if (n <= 1) {
      yield {
        line: L('if (n <= 1) return 1;'),
        event: 'done',
        state: getState(null, 1, 1),
        vars: { n },
        note: 'n ≤ 1, return 1 immediately.',
        result: 1,
      } as Step;
      return;
    }

    let prev2 = 1;
    let prev1 = 1;

    yield {
      line: L('int prev2 = 1, prev1 = 1;'),
      event: 'init',
      state: getState(prev2, prev1, 1),
      vars: { n, prev2, prev1 },
      note: 'prev2 = ways to step 0, prev1 = ways to step 1, both start at 1.',
    } as Step;

    for (let i = 2; i <= n; i++) {
      yield {
        line: L('for (int i = 2; i <= n; i++) {'),
        event: 'compare',
        state: getState(prev2, prev1, i),
        vars: { n, i, prev2, prev1 },
        note: `Starting step ${i}: ways = prev1 (${prev1}) + prev2 (${prev2}).`,
      } as Step;

      const cur = prev1 + prev2;

      yield {
        line: L('int cur = prev1 + prev2;'),
        event: 'record',
        state: getState(prev2, prev1, i),
        vars: { n, i, prev2, prev1, cur },
        note: `cur = ${prev1} + ${prev2} = ${cur} ways to reach step ${i}.`,
      } as Step;

      prev2 = prev1;
      prev1 = cur;

      yield {
        line: L('prev1 = cur;'),
        event: 'write',
        state: getState(prev2, prev1, i),
        vars: { n, i, prev2, prev1 },
        note: 'Slide the window: prev2 ← old prev1, prev1 ← cur.',
      } as Step;
    }

    yield {
      line: L('return prev1;'),
      event: 'done',
      state: getState(prev2, prev1, n),
      vars: { n, prev2, prev1 },
      note: `Answer: ${prev1} distinct ways to climb ${n} steps.`,
      result: prev1,
    } as Step;
  },
};
