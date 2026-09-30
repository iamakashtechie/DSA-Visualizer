import type { TraceModule, ArrayPointersState, Step } from '../lib/types';

export const trace: TraceModule<{ nums: number[]; target: number }> = {
  renderer: 'array-pointers',
  inputSchema: {
    nums: { type: 'int-array', label: 'Array' },
    target: { type: 'int', label: 'Target' }
  },
  defaultInput: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 },
  samples: [
    { input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 }, expected: 4 },
    { input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 3 }, expected: -1 },
    { input: { nums: [1], target: 0 }, expected: -1 }
  ],
  run: function* ({ nums, target }, L) {
    const cells = nums.map((v) => ({ value: v, state: 'idle' as const }));
    const state: ArrayPointersState = { renderer: 'array-pointers', array: cells, pointers: [] };

    let lo = 0;
    let hi = nums.length - 1;
    state.pointers = [
      { name: 'lo', index: lo, variant: 'a' },
      { name: 'hi', index: hi, variant: 'b' }
    ];
    yield {
      line: L('int lo = 0, hi = nums.size() - 1;'),
      event: 'init',
      state: structuredClone(state),
      vars: { lo, hi },
      note: `Initialize lo = 0, hi = ${hi}.`
    } as Step;

    while (lo <= hi) {
      yield {
        line: L('while (lo <= hi) {'),
        event: 'compare',
        state: structuredClone(state),
        vars: { lo, hi },
        note: `Check search interval: lo (${lo}) <= hi (${hi}).`
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
        vars: { lo, hi, mid },
        note: `Calculate mid = ${lo} + (${hi} - ${lo}) / 2 = ${mid}.`
      } as Step;

      yield {
        line: L('if (nums[mid] == target) return mid;'),
        event: 'compare',
        state: structuredClone(state),
        vars: { lo, hi, mid, 'nums[mid]': nums[mid] },
        note: `Check if nums[${mid}] (${nums[mid]}) == target (${target}).`
      } as Step;

      if (nums[mid] === target) {
        state.array[mid].state = 'success';
        yield {
          line: L('if (nums[mid] == target) return mid;'),
          event: 'done',
          state: structuredClone(state),
          vars: { lo, hi, mid },
          result: mid,
          note: `Target ${target} found at index ${mid}. Return ${mid}.`
        } as Step;
        return;
      }

      yield {
        line: L('if (nums[lo] <= nums[mid]) {           // left half [lo..mid] is sorted'),
        event: 'compare',
        state: structuredClone(state),
        vars: { lo, hi, mid, 'nums[lo]': nums[lo], 'nums[mid]': nums[mid] },
        note: `Check if left half [${lo}..${mid}] is sorted: nums[${lo}] (${nums[lo]}) <= nums[${mid}] (${nums[mid]}).`
      } as Step;

      if (nums[lo] <= nums[mid]) {
        yield {
          line: L('if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;'),
          event: 'compare',
          state: structuredClone(state),
          vars: { lo, hi, mid },
          note: `Is target (${target}) within left half [${nums[lo]}, ${nums[mid]})?`
        } as Step;

        if (nums[lo] <= target && target < nums[mid]) {
          hi = mid - 1;
          state.pointers = [
            { name: 'lo', index: lo, variant: 'a' },
            { name: 'hi', index: hi, variant: 'b' }
          ];
          yield {
            line: L('if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;'),
            event: 'move-pointer',
            state: structuredClone(state),
            vars: { lo, hi },
            note: `Target is in left half. Adjust hi = mid - 1 = ${hi}.`
          } as Step;
        } else {
          lo = mid + 1;
          state.pointers = [
            { name: 'lo', index: lo, variant: 'a' },
            { name: 'hi', index: hi, variant: 'b' }
          ];
          yield {
            line: L('else lo = mid + 1;'),
            event: 'move-pointer',
            state: structuredClone(state),
            vars: { lo, hi },
            note: `Target is not in left half. Adjust lo = mid + 1 = ${lo}.`
          } as Step;
        }
      } else {
        yield {
          line: L('if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;'),
          event: 'compare',
          state: structuredClone(state),
          vars: { lo, hi, mid },
          note: `Right half is sorted. Is target (${target}) within (nums[${mid}], nums[${hi}]]?`
        } as Step;

        if (nums[mid] < target && target <= nums[hi]) {
          lo = mid + 1;
          state.pointers = [
            { name: 'lo', index: lo, variant: 'a' },
            { name: 'hi', index: hi, variant: 'b' }
          ];
          yield {
            line: L('if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;'),
            event: 'move-pointer',
            state: structuredClone(state),
            vars: { lo, hi },
            note: `Target is in right half. Adjust lo = mid + 1 = ${lo}.`
          } as Step;
        } else {
          hi = mid - 1;
          state.pointers = [
            { name: 'lo', index: lo, variant: 'a' },
            { name: 'hi', index: hi, variant: 'b' }
          ];
          yield {
            line: L('else hi = mid - 1;'),
            event: 'move-pointer',
            state: structuredClone(state),
            vars: { lo, hi },
            note: `Target is not in right half. Adjust hi = mid - 1 = ${hi}.`
          } as Step;
        }
      }
    }

    yield {
      line: L('return -1;'),
      event: 'done',
      state: structuredClone(state),
      vars: { lo, hi },
      result: -1,
      note: `Target ${target} not found in array. Return -1.`
    } as Step;
  }
};
