import type { TraceModule, Step, CellState } from '../lib/types';
import { apState, buildCells } from '../lib/helpers';

type A = { nums: number[]; target: number };
type M = { matrix: number[][]; target: number };

const array = (values: number[], pointers: Partial<Record<number, CellState>> = {}) =>
  apState(buildCells(values, pointers), Object.entries(pointers).filter(([, state]) => state === 'pointer-a' || state === 'pointer-b' || state === 'pointer-c').map(([index, state]) => ({
    name: state === 'pointer-a' ? 'lo' : state === 'pointer-b' ? 'hi' : 'mid',
    index: Number(index), variant: state === 'pointer-a' ? 'a' : state === 'pointer-b' ? 'b' : 'c',
  })));

const binaryInput = (label: string, defaultInput: A, samples: Array<{ input: A; expected: unknown }>,
  body: (input: A, L: (needle: string) => number) => Generator<Step>): TraceModule<A> => ({
  renderer: 'array-pointers', inputSchema: {
    nums: { type: 'int-array', label, min: 1, max: 16 }, target: { type: 'int', label: 'Target' },
  }, defaultInput, samples, run: body,
});

export const searchInsert = binaryInput('Sorted Array', { nums: [1, 3, 5, 6], target: 5 }, [
  { input: { nums: [1, 3, 5, 6], target: 5 }, expected: 2 },
  { input: { nums: [1, 3, 5, 6], target: 2 }, expected: 1 },
], function* ({ nums, target }, L) {
  let lo = 0, hi = nums.length;
  while (lo < hi) {
    const mid = Math.floor(lo + (hi - lo) / 2);
    yield { line: L('int mid = lo + (hi - lo) / 2;'), event: 'compare', state: array(nums, { [lo]: 'pointer-a', [Math.min(hi, nums.length - 1)]: 'pointer-b', [mid]: 'pointer-c' }), vars: { lo, hi, mid, target }, note: `Compare ${nums[mid]} with insertion target ${target}.` };
    if (nums[mid] < target) lo = mid + 1; else hi = mid;
    yield { line: L('else hi = mid; // nums[mid] >= target, mid is a candidate'), event: 'move-pointer', state: array(nums), vars: { lo, hi, target }, note: `Keep the half that can contain the first value >= ${target}.` };
  }
  yield { line: L('return lo;'), event: 'done', state: array(nums), vars: { lo, target }, note: `Insert position is ${lo}.`, result: lo };
});

export const searchRange = binaryInput('Sorted Array', { nums: [5, 7, 7, 8, 8, 10], target: 8 }, [
  { input: { nums: [5, 7, 7, 8, 8, 10], target: 8 }, expected: [3, 4] },
  { input: { nums: [5, 7, 7, 8, 8, 10], target: 6 }, expected: [-1, -1] },
], function* ({ nums, target }, L) {
  const lower = function* (needle: number): Generator<Step, number, void> {
    let lo = 0, hi = nums.length;
    while (lo < hi) { const mid = Math.floor((lo + hi) / 2); yield { line: L('int mid = lo + (hi - lo) / 2;'), event: 'compare', state: array(nums), vars: { lo, hi, mid, target: needle }, note: `Lower bound checks index ${mid}.` }; if (nums[mid] < needle) lo = mid + 1; else hi = mid; }
    return lo;
  };
  const first = yield* lower(target);
  if (first === nums.length || nums[first] !== target) { yield { line: L('if (first == (int)nums.size() || nums[first] != target) return {-1, -1};'), event: 'done', state: array(nums), vars: { first, target }, note: 'No occurrence starts at the lower bound.', result: [-1, -1] }; return; }
  const last = (yield* lower(target + 1)) - 1;
  yield { line: L('return {first, last};'), event: 'done', state: array(nums, { [first]: 'pointer-a', [last]: 'pointer-b' }), vars: { first, last, target }, note: `Range is [${first}, ${last}].`, result: [first, last] };
});

const boundaryTrace = (kind: 'min' | 'peak' | 'mountain'): TraceModule<{ nums: number[] }> => ({
  renderer: 'array-pointers', inputSchema: { nums: { type: 'int-array', label: 'Array', min: 1, max: 16 } },
  defaultInput: kind === 'min' ? { nums: [3, 4, 5, 1, 2] } : { nums: [1, 2, 3, 2, 1] },
  samples: kind === 'min' ? [{ input: { nums: [3, 4, 5, 1, 2] }, expected: 1 }, { input: { nums: [4, 5, 6, 1, 2, 3] }, expected: 1 }] : [{ input: { nums: [1, 2, 3, 2, 1] }, expected: 2 }, { input: { nums: [0, 2, 1] }, expected: 1 }],
  run: function* ({ nums }, L) {
    let lo = 0, hi = nums.length - 1;
    while (lo < hi) { const mid = Math.floor((lo + hi) / 2); yield { line: L('int mid = lo + (hi - lo) / 2;'), event: 'compare', state: array(nums, { [lo]: 'pointer-a', [hi]: 'pointer-b', [mid]: 'pointer-c' }), vars: { lo, hi, mid }, note: `Compare the boundary at mid ${mid}.` }; const goRight = kind === 'min' ? nums[mid] > nums[hi] : nums[mid] < nums[mid + 1]; if (goRight) lo = mid + 1; else hi = mid; yield { line: L(kind === 'min' ? 'if (nums[mid] > nums[hi]) lo = mid + 1;   // min is strictly to the right' : kind === 'mountain' ? 'if (arr[mid] < arr[mid + 1]) lo = mid + 1;' : 'if (nums[mid] < nums[mid + 1]) lo = mid + 1;'), event: 'move-pointer', state: array(nums), vars: { lo, hi }, note: goRight ? 'The answer lies to the right of mid.' : 'Mid remains a possible answer; move hi left.' }; }
    const result = kind === 'min' ? nums[lo] : lo;
    yield { line: L(kind === 'min' ? 'return nums[lo];' : 'return lo;'), event: 'done', state: array(nums, { [lo]: 'success' }), vars: { lo, result }, note: `Boundary search converged at index ${lo}.`, result };
  },
});

export const singleElement: TraceModule<{ nums: number[] }> = { renderer: 'array-pointers', inputSchema: { nums: { type: 'int-array', label: 'Paired Sorted Array', min: 1, max: 16 } }, defaultInput: { nums: [1, 1, 2, 3, 3] }, samples: [{ input: { nums: [1, 1, 2, 3, 3] }, expected: 2 }, { input: { nums: [1, 2, 2, 3, 3] }, expected: 1 }], run: function* ({ nums }, L) { let lo = 0, hi = nums.length - 1; while (lo < hi) { let mid = Math.floor((lo + hi) / 2); if (mid % 2) mid--; yield { line: L('if (mid % 2 == 1) mid--;              // force mid to even index'), event: 'compare', state: array(nums, { [lo]: 'pointer-a', [hi]: 'pointer-b', [mid]: 'pointer-c' }), vars: { lo, hi, mid }, note: `Align mid to the start of a pair at index ${mid}.` }; if (nums[mid] === nums[mid + 1]) lo = mid + 2; else hi = mid; } yield { line: L('return nums[lo];'), event: 'done', state: array(nums, { [lo]: 'success' }), vars: { lo }, note: `The broken pair identifies the unique value ${nums[lo]}.`, result: nums[lo] }; } };

export const rotatedWithDuplicates: TraceModule<A> = binaryInput('Rotated Array', { nums: [2, 5, 6, 0, 0, 1, 2], target: 0 }, [{ input: { nums: [2, 5, 6, 0, 0, 1, 2], target: 0 }, expected: true }, { input: { nums: [2, 5, 6, 0, 0, 1, 2], target: 3 }, expected: false }], function* ({ nums, target }, L) { let lo = 0, hi = nums.length - 1; while (lo <= hi) { const mid = Math.floor((lo + hi) / 2); yield { line: L('int mid = lo + (hi - lo) / 2;'), event: 'compare', state: array(nums, { [lo]: 'pointer-a', [hi]: 'pointer-b', [mid]: 'pointer-c' }), vars: { lo, hi, mid, target }, note: `Check rotated midpoint ${mid}.` }; if (nums[mid] === target) { yield { line: L('if (nums[mid] == target) return true;'), event: 'found', state: array(nums, { [mid]: 'success' }), vars: { mid, target }, note: 'Target found at the midpoint.', result: true }; return; } if (nums[lo] === nums[mid] && nums[mid] === nums[hi]) { lo++; hi--; } else if (nums[lo] <= nums[mid]) { if (nums[lo] <= target && target < nums[mid]) hi = mid - 1; else lo = mid + 1; } else { if (nums[mid] < target && target <= nums[hi]) lo = mid + 1; else hi = mid - 1; } } yield { line: L('return false;'), event: 'done', state: array(nums), vars: { lo, hi, target }, note: 'All viable rotated windows were eliminated.', result: false }; });

export const findMin = boundaryTrace('min');
export const findPeak = boundaryTrace('peak');
export const peakIndex = boundaryTrace('mountain');

const capacityTrace = (kind: 'ship' | 'split' | 'books'): TraceModule<any> => ({ renderer: 'array-pointers', inputSchema: { nums: { type: 'int-array', label: kind === 'books' ? 'Pages' : 'Values', min: 1, max: 16 }, groups: { type: 'int', label: kind === 'ship' ? 'Days' : 'Groups', min: 1, max: 16 } }, defaultInput: kind === 'ship' ? { nums: [1, 2, 3, 1, 1], groups: 4 } : kind === 'split' ? { nums: [7, 2, 5, 10, 8], groups: 2 } : { nums: [12, 34, 67, 90], groups: 2 }, samples: kind === 'ship' ? [{ input: { nums: [1, 2, 3, 1, 1], groups: 4 }, expected: 3 }, { input: { nums: [3, 2, 2, 4, 1, 4], groups: 3 }, expected: 6 }] : kind === 'split' ? [{ input: { nums: [7, 2, 5, 10, 8], groups: 2 }, expected: 18 }, { input: { nums: [1, 4, 4], groups: 3 }, expected: 4 }] : [{ input: { nums: [12, 34, 67, 90], groups: 2 }, expected: 113 }, { input: { nums: [10, 20, 30], groups: 2 }, expected: 30 }], run: function* ({ nums, groups }, L) { const count = (cap: number) => { let used = 1, current = 0; for (const value of nums) { if (current + value > cap) { used++; current = 0; } current += value; } return used; }; let lo = Math.max(...nums), hi = nums.reduce((a: number, b: number) => a + b, 0); while (lo < hi) { const mid = Math.floor((lo + hi) / 2); yield { line: L(kind === 'split' ? 'long long mid = lo + (hi - lo) / 2;' : 'int mid = lo + (hi - lo) / 2;'), event: 'compare', state: array(nums), vars: { lo, hi, mid, groups, used: count(mid) }, note: `Capacity ${mid} needs ${count(mid)} groups.` }; if (count(mid) <= groups) hi = mid; else lo = mid + 1; } yield { line: L(kind === 'ship' ? 'return lo;' : kind === 'split' ? 'return (int)lo;' : 'return lo;'), event: 'done', state: array(nums, { 0: 'success' }), vars: { lo, groups }, note: `Minimum feasible capacity is ${lo}.`, result: lo }; } });

export const shipCapacity = capacityTrace('ship');
export const splitArray = capacityTrace('split');
export const bookAllocation = capacityTrace('books');

const placementTrace = (kind: 'cows' | 'balls'): TraceModule<{ positions: number[]; count: number }> => ({ renderer: 'array-pointers', inputSchema: { positions: { type: 'int-array', label: 'Sorted Positions', min: 2, max: 16 }, count: { type: 'int', label: kind === 'cows' ? 'Cows' : 'Balls', min: 2, max: 16 } }, defaultInput: { positions: [1, 2, 4, 8, 9], count: 3 }, samples: [{ input: { positions: [1, 2, 4, 8, 9], count: 3 }, expected: 3 }, { input: { positions: [10, 20, 30, 40], count: 2 }, expected: 30 }], run: function* ({ positions, count }, L) { const values = [...positions].sort((a, b) => a - b); let lo = 1, hi = values.at(-1)! - values[0]; while (lo < hi) { const mid = Math.floor((lo + hi + 1) / 2); let placed = 1, last = values[0]; for (let i = 1; i < values.length; i++) if (values[i] - last >= mid) { placed++; last = values[i]; } yield { line: L('int mid = lo + (hi - lo + 1) / 2;'), event: 'compare', state: array(values), vars: { lo, hi, mid, placed, count }, note: `Distance ${mid} places ${placed} objects greedily.` }; if (placed >= count) lo = mid; else hi = mid - 1; } yield { line: L('return lo;'), event: 'done', state: array(values), vars: { lo, count }, note: `Largest feasible minimum distance is ${lo}.`, result: lo }; } });
export const aggressiveCows = placementTrace('cows');
export const magneticForce = placementTrace('balls');

export const matrixSearchII: TraceModule<M> = { renderer: 'grid-board', inputSchema: { matrix: { type: 'int-grid', label: 'Sorted Matrix', min: 1, max: 8 }, target: { type: 'int', label: 'Target' } }, defaultInput: { matrix: [[1, 4, 7], [2, 5, 8], [3, 6, 9]], target: 5 }, samples: [{ input: { matrix: [[1, 4, 7], [2, 5, 8], [3, 6, 9]], target: 5 }, expected: true }, { input: { matrix: [[1, 4], [2, 5]], target: 3 }, expected: false }], run: function* ({ matrix, target }, L) { let row = 0, col = matrix[0].length - 1; while (row < matrix.length && col >= 0) { const value = matrix[row][col]; yield { line: L('if (matrix[row][col] == target) return true;'), event: 'compare', state: { renderer: 'grid-board', grid: matrix.map((r, ri) => r.map((v, ci) => ({ value: v, state: ri === row && ci === col ? 'active' : 'idle' }))), pointers: [{ r: row, c: col, name: 'cell', variant: 'a' }] }, vars: { row, col, value, target }, note: `Top-right walk compares ${value} with ${target}.` }; if (value === target) { yield { line: L('if (matrix[row][col] == target) return true;'), event: 'found', state: { renderer: 'grid-board', grid: matrix.map((r, ri) => r.map((v, ci) => ({ value: v, state: ri === row && ci === col ? 'success' : 'idle' }))) }, vars: { row, col }, note: 'Target found.', result: true }; return; } if (value > target) col--; else row++; } yield { line: L('return false;'), event: 'done', state: { renderer: 'grid-board', grid: matrix.map(r => r.map(value => ({ value, state: 'idle' }))) }, vars: { row, col }, note: 'The staircase search exhausted its candidates.', result: false }; } };

export const sqrtX: TraceModule<{ x: number }> = { renderer: 'array-pointers', inputSchema: { x: { type: 'int', label: 'Non-negative integer', min: 0, max: 2147483647 } }, defaultInput: { x: 8 }, samples: [{ input: { x: 8 }, expected: 2 }, { input: { x: 16 }, expected: 4 }], run: function* ({ x }, L) { if (x < 2) { yield { line: L('if (x < 2) return x;'), event: 'done', state: array([x]), vars: { x }, note: 'Small inputs are their own integer square root.', result: x }; return; } let lo = 1, hi = x; while (lo < hi) { const mid = Math.floor((lo + hi + 1) / 2); yield { line: L('long long mid = lo + (hi - lo + 1) / 2;'), event: 'compare', state: array([lo, mid, hi]), vars: { lo, hi, mid, x }, note: `Test whether ${mid} squared fits within ${x}.` }; if (mid * mid <= x) lo = mid; else hi = mid - 1; } yield { line: L('return (int)lo;'), event: 'done', state: array([lo], { 0: 'success' }), vars: { lo, x }, note: `Largest feasible root is ${lo}.`, result: lo }; } };

export const matrixMedian: TraceModule<{ nums1: number[]; nums2: number[] }> = { renderer: 'array-pointers', inputSchema: { nums1: { type: 'int-array', label: 'First Sorted Array', min: 0, max: 8 }, nums2: { type: 'int-array', label: 'Second Sorted Array', min: 1, max: 8 } }, defaultInput: { nums1: [1, 3], nums2: [2] }, samples: [{ input: { nums1: [1, 3], nums2: [2] }, expected: 2 }, { input: { nums1: [1, 2], nums2: [3, 4] }, expected: 2.5 }], run: function* ({ nums1, nums2 }, L) { if (nums1.length > nums2.length) { const swap = nums1; nums1 = nums2; nums2 = swap; } const total = nums1.length + nums2.length, half = Math.floor((total + 1) / 2); let lo = 0, hi = nums1.length; while (lo <= hi) { const cut1 = Math.floor((lo + hi) / 2), cut2 = half - cut1; const left1 = cut1 ? nums1[cut1 - 1] : -Infinity, right1 = cut1 === nums1.length ? Infinity : nums1[cut1], left2 = cut2 ? nums2[cut2 - 1] : -Infinity, right2 = cut2 === nums2.length ? Infinity : nums2[cut2]; yield { line: L('int cut1 = lo + (hi - lo) / 2;'), event: 'compare', state: array([...nums1, ...nums2]), vars: { lo, hi, cut1, cut2, left1, right1, left2, right2 }, note: `Test partition (${cut1}, ${cut2}) across both arrays.` }; if (left1 <= right2 && left2 <= right1) { const result = total % 2 ? Math.max(left1, left2) : (Math.max(left1, left2) + Math.min(right1, right2)) / 2; yield { line: L('return max(left1, left2);'), event: 'done', state: array([...nums1, ...nums2]), vars: { cut1, cut2 }, note: 'Partition is valid; middle values define the median.', result }; return; } if (left1 > right2) hi = cut1 - 1; else lo = cut1 + 1; } yield { line: L('return 0.0; // unreachable for valid input'), event: 'done', state: array([...nums1, ...nums2]), vars: {}, note: 'No valid partition was found.', result: 0 }; } };

export const kthSmallestMatrix: TraceModule<{ matrix: number[][]; k: number }> = { renderer: 'grid-board', inputSchema: { matrix: { type: 'int-grid', label: 'Sorted Square Matrix', min: 1, max: 8 }, k: { type: 'int', label: 'K', min: 1, max: 64 } }, defaultInput: { matrix: [[1, 5, 9], [10, 11, 13], [12, 13, 15]], k: 8 }, samples: [{ input: { matrix: [[1, 5, 9], [10, 11, 13], [12, 13, 15]], k: 8 }, expected: 13 }, { input: { matrix: [[-5]], k: 1 }, expected: -5 }], run: function* ({ matrix, k }, L) { let lo = matrix[0][0], hi = matrix.at(-1)!.at(-1)!; while (lo < hi) { const mid = Math.floor((lo + hi) / 2); let count = 0, row = matrix.length - 1, col = 0; while (row >= 0 && col < matrix.length) { if (matrix[row][col] <= mid) { count += row + 1; col++; } else row--; } yield { line: L('int mid = lo + (hi - lo) / 2;'), event: 'compare', state: { renderer: 'grid-board', grid: matrix.map(r => r.map(value => ({ value, state: value <= mid ? 'visited' : 'idle' }))) }, vars: { lo, hi, mid, count, k }, note: `${count} matrix values are <= ${mid}.` }; if (count < k) lo = mid + 1; else hi = mid; } yield { line: L('return lo;'), event: 'done', state: { renderer: 'grid-board', grid: matrix.map(r => r.map(value => ({ value, state: value === lo ? 'success' : 'idle' }))) }, vars: { lo, k }, note: `The value with rank ${k} is ${lo}.`, result: lo }; } };