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

    yield {
      line: L('if (intervals.empty()) return {};'),
      event: 'init',
      state: getState(intervals, []),
      vars: {},
      note: 'Check if intervals is empty.',
    } as Step;

    if (intervals.length === 0) {
      yield {
        line: L('if (intervals.empty()) return {};'),
        event: 'done',
        state: getState([], []),
        vars: {},
        note: 'Empty, returning [].',
        result: []
      } as Step;
      return;
    }

    const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
    yield {
      line: L('sort(intervals.begin(), intervals.end());'),
      event: 'record',
      state: getState(sorted, []),
      vars: {},
      note: 'Sort intervals by starting time.',
    } as Step;

    const merged: [number, number][] = [];
    merged.push([...sorted[0]]);

    yield {
      line: L('merged.push_back(intervals[0]);'),
      event: 'record',
      state: getState(sorted, merged, 1),
      vars: {},
      note: 'Push the first interval into the merged list.',
    } as Step;

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const lastMerged = merged[merged.length - 1];

      yield {
        line: L('for (int i = 1; i < intervals.size(); i++) {'),
        event: 'compare',
        state: getState(sorted, merged, i, current[0]),
        vars: { i },
        note: `Consider interval [${current[0]}, ${current[1]}].`,
      } as Step;

      if (lastMerged[1] >= current[0]) {
        yield {
          line: L('if (merged.back()[1] >= intervals[i][0]) {'),
          event: 'compare',
          state: getState(sorted, merged, i, current[0]),
          vars: { i },
          note: `Overlaps! ${lastMerged[1]} >= ${current[0]}.`,
        } as Step;

        lastMerged[1] = Math.max(lastMerged[1], current[1]);
        
        yield {
          line: L('merged.back()[1] = max(merged.back()[1], intervals[i][1]);'),
          event: 'record',
          state: getState(sorted, merged, i + 1),
          vars: { i },
          note: `Merge them: end becomes max(${lastMerged[1]}, ${current[1]}).`,
        } as Step;
      } else {
        yield {
          line: L('} else {'),
          event: 'compare',
          state: getState(sorted, merged, i, current[0]),
          vars: { i },
          note: `No overlap: ${lastMerged[1]} < ${current[0]}.`,
        } as Step;

        merged.push([...current]);

        yield {
          line: L('merged.push_back(intervals[i]);'),
          event: 'record',
          state: getState(sorted, merged, i + 1),
          vars: { i },
          note: 'Add it as a new distinct interval.',
        } as Step;
      }
    }

    yield {
      line: L('return merged;'),
      event: 'done',
      state: getState(sorted, merged, sorted.length),
      vars: {},
      note: 'All intervals processed.',
      result: merged,
    } as Step;
  },
};
