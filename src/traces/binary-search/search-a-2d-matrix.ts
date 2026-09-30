import type { TraceModule, ArrayPointersState, Step } from '../lib/types';

export const trace: TraceModule<{ matrix: number[][]; target: number }> = {
  renderer: 'array-pointers',
  inputSchema: {
    matrix: { type: 'int-grid', label: 'Matrix' },
    target: { type: 'int', label: 'Target' }
  },
  defaultInput: { matrix: [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target: 3 },
  samples: [
    { input: { matrix: [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target: 3 }, expected: true },
    { input: { matrix: [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target: 13 }, expected: false }
  ],
  run: function* ({ matrix, target }, L) {
    const flattened = matrix.flat();
    const cells = flattened.map((v) => ({ value: v, state: 'idle' as const }));
    const state: ArrayPointersState = { renderer: 'array-pointers', array: cells, pointers: [] };

    const m = matrix.length;
    const n = matrix[0].length;
    yield {
      line: L('int m = matrix.size(), n = matrix[0].size();'),
      event: 'init',
      state: structuredClone(state),
      vars: { m, n },
      note: `Dimensions: ${m} rows × ${n} columns (${m * n} elements total).`
    } as Step;

    let lo = 0;
    let hi = m * n - 1;
    state.pointers = [
      { name: 'lo', index: lo, variant: 'a' },
      { name: 'hi', index: hi, variant: 'b' }
    ];
    yield {
      line: L('int lo = 0, hi = m * n - 1;'),
      event: 'init',
      state: structuredClone(state),
      vars: { m, n, lo, hi },
      note: `Binary search bounds: lo = 0, hi = ${hi}.`
    } as Step;

    while (lo <= hi) {
      yield {
        line: L('while (lo <= hi) {'),
        event: 'compare',
        state: structuredClone(state),
        vars: { m, n, lo, hi },
        note: `Check loop condition: lo (${lo}) <= hi (${hi}).`
      } as Step;

      const mid = Math.floor(lo + (hi - lo) / 2);
      state.pointers = [
        { name: 'lo', index: lo, variant: 'a' },
        { name: 'hi', index: hi, variant: 'b' },
        { name: 'mid', index: mid, variant: 'c' }
      ];
      yield {
        line: L('int mid = lo + (hi - lo) / 2;'),
        event: 'calc',
        state: structuredClone(state),
        vars: { m, n, lo, hi, mid },
        note: `mid = ${lo} + (${hi} - ${lo}) / 2 = ${mid}.`
      } as Step;

      const r = Math.floor(mid / n);
      const c = mid % n;
      const val = matrix[r][c];
      yield {
        line: L('int val = matrix[mid / n][mid % n];       // map 1D index -> 2D coordinate'),
        event: 'calc',
        state: structuredClone(state),
        vars: { m, n, lo, hi, mid, val, r, c },
        note: `Map 1D index ${mid} to 2D matrix[${r}][${c}] = ${val}.`
      } as Step;

      yield {
        line: L('if (val == target) return true;'),
        event: 'compare',
        state: structuredClone(state),
        vars: { m, n, lo, hi, mid, val },
        note: `Compare val (${val}) with target (${target}).`
      } as Step;

      if (val === target) {
        state.array[mid].state = 'success';
        yield {
          line: L('if (val == target) return true;'),
          event: 'done',
          state: structuredClone(state),
          vars: { m, n, lo, hi, mid, val },
          result: true,
          note: `Found target ${target} at matrix[${r}][${c}]. Return true.`
        } as Step;
        return;
      } else if (val < target) {
        yield {
          line: L('else if (val < target) lo = mid + 1;'),
          event: 'compare',
          state: structuredClone(state),
          vars: { m, n, lo, hi, mid, val },
          note: `val (${val}) < target (${target}), search right half.`
        } as Step;
        lo = mid + 1;
        state.pointers = [
          { name: 'lo', index: lo, variant: 'a' },
          { name: 'hi', index: hi, variant: 'b' }
        ];
        yield {
          line: L('else if (val < target) lo = mid + 1;'),
          event: 'move-pointer',
          state: structuredClone(state),
          vars: { m, n, lo, hi },
          note: `Move lo to mid + 1 = ${lo}.`
        } as Step;
      } else {
        yield {
          line: L('else hi = mid - 1;'),
          event: 'compare',
          state: structuredClone(state),
          vars: { m, n, lo, hi, mid, val },
          note: `val (${val}) > target (${target}), search left half.`
        } as Step;
        hi = mid - 1;
        state.pointers = [
          { name: 'lo', index: lo, variant: 'a' },
          { name: 'hi', index: hi, variant: 'b' }
        ];
        yield {
          line: L('else hi = mid - 1;'),
          event: 'move-pointer',
          state: structuredClone(state),
          vars: { m, n, lo, hi },
          note: `Move hi to mid - 1 = ${hi}.`
        } as Step;
      }
    }

    yield {
      line: L('return false;'),
      event: 'done',
      state: structuredClone(state),
      vars: { m, n, lo, hi },
      result: false,
      note: `lo (${lo}) > hi (${hi}). Target not in matrix. Return false.`
    } as Step;
  }
};
