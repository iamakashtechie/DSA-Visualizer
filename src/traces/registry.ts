import type { TraceModule } from './lib/types';
import { trace as twoSumII } from './two-pointer/two-sum-ii-input-array-is-sorted';
import { trace as containerWithMostWater } from './two-pointer/container-with-most-water';
import { trace as binarySearch } from './binary-search/binary-search';
import { trace as linkedListCycle } from './two-pointer/linked-list-cycle';
import { trace as climbingStairs } from './dp/climbing-stairs';
import { trace as mergeIntervals } from './greedy/merge-intervals';
import { trace as numberOfIslands } from './graph/number-of-islands';
import { trace as subsets } from './backtracking/subsets';
import { trace as courseSchedule } from './graph/course-schedule';
import { trace as numberOf1Bits } from './bit-manipulation/number-of-1-bits';

// Disable lint for explicit any, as we just want a map of all traces
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const traceRegistry: Record<string, TraceModule<any>> = {
  'two-pointer/two-sum-ii-input-array-is-sorted': twoSumII,
  'two-pointer/container-with-most-water': containerWithMostWater,
  'binary-search/binary-search': binarySearch,
  'two-pointer/linked-list-cycle': linkedListCycle,
  'dp/climbing-stairs': climbingStairs,
  'greedy/merge-intervals': mergeIntervals,
  'graph/number-of-islands': numberOfIslands,
  'backtracking/subsets': subsets,
  'graph/course-schedule': courseSchedule,
  'bit-manipulation/number-of-1-bits': numberOf1Bits,
};
