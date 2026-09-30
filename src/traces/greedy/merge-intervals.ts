import type { TraceModule, Step } from '../lib/types';
import { IntervalTimelineState } from '../lib/types';

interface Input {
  intervals: [number, number][];
}

export const trace: TraceModule<Input> = {
  renderer: 'interval-timeline',
  inputSchema: {
    intervals: { type: 'json', label: 'Intervals Array' },
  },
  defaultInput: {
    intervals: [[1, 3], [2, 6], [8, 10], [15, 18]],
  },
  samples: [
    { input: { intervals: [[1, 3], [2, 6], [8, 10], [15, 18]] }, expected: [[1, 6], [8, 10], [15, 18]] },
    { input: { intervals: [[1, 4], [4, 5]] }, expected: [[1, 5]] },
  ],
  run: function* (input, L) {
    const { intervals } = input;

    const getState = (
      inputIntervals: [number, number][],
      mergedIntervals: [number, number][],
      activeIndex?: number,
      sweepLine?: number
    ): IntervalTimelineState => {
      const items = [];
      
      // We will show merged intervals in success color, and current processing ones in other colors
      for (let i = 0; i < mergedIntervals.length; i++) {
        items.push({
          id: `merged-${i}`,
          start: mergedIntervals[i][0],
          end: mergedIntervals[i][1],
          state: 'success' as const
        });
      }

      for (let i = 0; i < inputIntervals.length; i++) {
        // Skip intervals we've already processed, to keep it clean, or show them?
        // Let's show remaining unprocessed intervals in default, active in pointer-a
        if (activeIndex !== undefined && i >= activeIndex) {
          items.push({
            id: `input-${i}`,
            start: inputIntervals[i][0],
            end: inputIntervals[i][1],
            state: (i === activeIndex ? 'pointer-a' : 'idle') as any
          });
        }
      }

      return {
        renderer: 'interval-timeline',
        intervals: items,
        sweepLine
      };
    };


    if (intervals.length === 0) {
      return;
    }

    const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
    yield {
      line: L('sort(intervals.begin(), intervals.end());'),
      event: 'record',
      state: getState(sorted, []),
      vars: {},
      note: 'Sort intervals by start time so we can scan left to right.',
    } as Step;

    const result: [number, number][] = [];

    for (let i = 0; i < sorted.length; i++) {
      const interval = sorted[i];

      yield {
        line: L('for (auto& interval : intervals) {'),
        event: 'compare',
        state: getState(sorted, result, i, interval[0]),
        vars: { 'interval[0]': interval[0], 'interval[1]': interval[1] },
        note: `Examining interval [${interval[0]}, ${interval[1]}].`,
      } as Step;

      if (result.length === 0 || result[result.length - 1][1] < interval[0]) {
        yield {
          line: L('if (result.empty() || result.back()[1] < interval[0]) {'),
          event: 'compare',
          state: getState(sorted, result, i, interval[0]),
          vars: { 'interval[0]': interval[0], 'interval[1]': interval[1] },
          note: result.length === 0
            ? 'result is empty — push first interval.'
            : `No overlap: last end (${result[result.length - 1][1]}) < current start (${interval[0]}).`,
        } as Step;

        result.push([...interval]);

        yield {
          line: L('result.push_back(interval);'),
          event: 'record',
          state: getState(sorted, result, i + 1),
          vars: { 'interval[0]': interval[0], 'interval[1]': interval[1] },
          note: 'No overlap — push as a new distinct interval.',
        } as Step;
      } else {
        yield {
          line: L('result.back()[1] = max(result.back()[1], interval[1]);'),
          event: 'record',
          state: getState(sorted, result, i + 1),
          vars: { 'interval[0]': interval[0], 'interval[1]': interval[1] },
          note: `Overlap — extend last interval's end to max(${result[result.length - 1][1]}, ${interval[1]}).`,
        } as Step;

        result[result.length - 1][1] = Math.max(result[result.length - 1][1], interval[1]);
      }
    }

    yield {
      line: L('return result;'),
      event: 'done',
      state: getState(sorted, result, sorted.length),
      vars: {},
      note: `Done. ${result.length} merged interval(s).`,
      result,
    } as Step;
  },
};
