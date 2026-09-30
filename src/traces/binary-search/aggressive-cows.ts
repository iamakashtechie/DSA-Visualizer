import type { TraceModule, ArrayPointersState, Step } from '../lib/types';

export const trace: TraceModule<{ stalls: number[]; cows: number }> = {
  renderer: 'array-pointers',
  inputSchema: {
    stalls: { type: 'int-array', label: 'Stalls' },
    cows: { type: 'int', label: 'Cows' }
  },
  defaultInput: { stalls: [1, 2, 4, 8, 9], cows: 3 },
  samples: [
    { input: { stalls: [1, 2, 4, 8, 9], cows: 3 }, expected: 3 },
    { input: { stalls: [10, 1, 2, 7, 5], cows: 3 }, expected: 4 }
  ],
  run: function* ({ stalls, cows }, L) {
    const sortedStalls = [...stalls].sort((a, b) => a - b);
    const cells = sortedStalls.map((v) => ({ value: v, state: 'idle' as const }));
    const state: ArrayPointersState = { renderer: 'array-pointers', array: cells, pointers: [] };

    yield {
      line: L('sort(stalls.begin(), stalls.end());'),
      event: 'record',
      state: structuredClone(state),
      vars: { stalls: JSON.stringify(sortedStalls), cows },
      note: 'Sort stalls in ascending coordinate order.'
    } as Step;

    let lo = 1;
    let hi = sortedStalls[sortedStalls.length - 1] - sortedStalls[0];
    yield {
      line: L('int lo = 1, hi = stalls.back() - stalls.front();'),
      event: 'init',
      state: structuredClone(state),
      vars: { lo, hi, cows },
      note: `Search range for min distance: lo = 1, hi = ${hi}.`
    } as Step;

    while (lo < hi) {
      yield {
        line: L('while (lo < hi) {'),
        event: 'compare',
        state: structuredClone(state),
        vars: { lo, hi, cows },
        note: `Check binary search condition: lo (${lo}) < hi (${hi}).`
      } as Step;

      const mid = Math.floor(lo + (hi - lo + 1) / 2);
      yield {
        line: L('int mid = lo + (hi - lo + 1) / 2;          // bias up: we want the largest feasible distance'),
        event: 'calc',
        state: structuredClone(state),
        vars: { lo, hi, mid, cows },
        note: `Test candidate distance mid = ${mid} (biased up to find maximum).`
      } as Step;

      let count = 1;
      let last = sortedStalls[0];
      for (let i = 1; i < sortedStalls.length; i++) {
        if (sortedStalls[i] - last >= mid) {
          count++;
          last = sortedStalls[i];
        }
      }

      yield {
        line: L('if (canPlace(stalls, cows, mid)) lo = mid; // feasible, try to push distance larger'),
        event: 'compare',
        state: structuredClone(state),
        vars: { lo, hi, mid, count, cows },
        note: `canPlace check: can place ${count} cows with distance >= ${mid} (need ${cows}).`
      } as Step;

      if (count >= cows) {
        lo = mid;
        yield {
          line: L('if (canPlace(stalls, cows, mid)) lo = mid; // feasible, try to push distance larger'),
          event: 'record',
          state: structuredClone(state),
          vars: { lo, hi, mid },
          note: `Distance ${mid} is feasible! Try to push distance larger: lo = ${lo}.`
        } as Step;
      } else {
        hi = mid - 1;
        yield {
          line: L('else hi = mid - 1;'),
          event: 'record',
          state: structuredClone(state),
          vars: { lo, hi, mid },
          note: `Distance ${mid} impossible. Reduce search space: hi = ${hi}.`
        } as Step;
      }
    }

    yield {
      line: L('return lo;'),
      event: 'done',
      state: structuredClone(state),
      vars: { lo },
      result: lo,
      note: `Optimal largest minimum distance is ${lo}.`
    } as Step;
  }
};
