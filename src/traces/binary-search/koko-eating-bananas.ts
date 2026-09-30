import type { TraceModule, ArrayPointersState, Step } from '../lib/types';

export const trace: TraceModule<{ piles: number[]; h: number }> = {
  renderer: 'array-pointers',
  inputSchema: {
    piles: { type: 'int-array', label: 'Piles' },
    h: { type: 'int', label: 'Hours' }
  },
  defaultInput: { piles: [3, 6, 7, 11], h: 8 },
  samples: [
    { input: { piles: [3, 6, 7, 11], h: 8 }, expected: 4 },
    { input: { piles: [30, 11, 23, 4, 20], h: 5 }, expected: 30 },
    { input: { piles: [30, 11, 23, 4, 20], h: 6 }, expected: 23 }
  ],
  run: function* ({ piles, h }, L) {
    const cells = piles.map((v) => ({ value: v, state: 'idle' as const }));
    const state: ArrayPointersState = { renderer: 'array-pointers', array: cells, pointers: [] };

    let lo = 1;
    let hi = Math.max(...piles);
    yield {
      line: L('int lo = 1, hi = *max_element(piles.begin(), piles.end());'),
      event: 'init',
      state: structuredClone(state),
      vars: { lo, hi, h },
      note: `Search range for speed k: lo = 1, hi = max pile (${hi}).`
    } as Step;

    while (lo < hi) {
      yield {
        line: L('while (lo < hi) {'),
        event: 'compare',
        state: structuredClone(state),
        vars: { lo, hi, h },
        note: `Check speed range: lo (${lo}) < hi (${hi}).`
      } as Step;

      const mid = Math.floor(lo + (hi - lo) / 2);
      yield {
        line: L('int mid = lo + (hi - lo) / 2;'),
        event: 'calc',
        state: structuredClone(state),
        vars: { lo, hi, mid, h },
        note: `Test eating speed k = ${mid}.`
      } as Step;

      let hours = 0;
      for (const p of piles) {
        hours += Math.ceil(p / mid);
      }

      yield {
        line: L('if (hoursNeeded(piles, mid) <= h) hi = mid;  // feasible, try slower speed'),
        event: 'compare',
        state: structuredClone(state),
        vars: { lo, hi, mid, hours, h },
        note: `Hours needed at speed ${mid}: ${hours} hrs (limit h = ${h}).`
      } as Step;

      if (hours <= h) {
        hi = mid;
        yield {
          line: L('if (hoursNeeded(piles, mid) <= h) hi = mid;  // feasible, try slower speed'),
          event: 'record',
          state: structuredClone(state),
          vars: { lo, hi, mid },
          note: `Speed ${mid} is feasible (${hours} <= ${h}). Try even slower: hi = ${hi}.`
        } as Step;
      } else {
        lo = mid + 1;
        yield {
          line: L('else lo = mid + 1;                            // too slow, need more speed'),
          event: 'record',
          state: structuredClone(state),
          vars: { lo, hi, mid },
          note: `Speed ${mid} too slow (${hours} > ${h}). Must eat faster: lo = ${lo}.`
        } as Step;
      }
    }

    yield {
      line: L('return lo;'),
      event: 'done',
      state: structuredClone(state),
      vars: { lo },
      result: lo,
      note: `Minimum integer eating speed is ${lo} bananas/hour.`
    } as Step;
  }
};
