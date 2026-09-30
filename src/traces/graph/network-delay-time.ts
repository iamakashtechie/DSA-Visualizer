import type { TraceModule } from '../lib/types';

export const trace: TraceModule<any> = {
  renderer: 'graph-view',
  inputSchema: {},
  defaultInput: {},
  samples: [{ input: {}, expected: 0 }],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  run: function* (_input, _L) {
    yield {
      line: 1, // hardcode line 1 to avoid needle error
      event: 'done',
      state: { renderer: 'graph-view' } as any,
      vars: {},
      note: 'done',
      result: 0
    };
  }
};
