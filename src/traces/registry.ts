import type { TraceModule } from './lib/types';
import { trace as twoSumII } from './two-pointer/two-sum-ii-input-array-is-sorted';
import { trace as containerWithMostWater } from './two-pointer/container-with-most-water';
import { trace as binarySearch } from './binary-search/binary-search';

// Disable lint for explicit any, as we just want a map of all traces
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const traceRegistry: Record<string, TraceModule<any>> = {
  'two-pointer/two-sum-ii-input-array-is-sorted': twoSumII,
  'two-pointer/container-with-most-water': containerWithMostWater,
  'binary-search/binary-search': binarySearch,
};
