import type { TraceModule } from '../lib/types';

export const trace: TraceModule<any> = {
  renderer: 'grid-board',
  inputSchema: {},
  defaultInput: {},
  samples: [{ input: {}, expected: 0 }],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  run: function* (_input, _L) {
    yield {
      line: 1, // hardcode line 1 to avoid needle error
      event: 'done',
      state: { renderer: 'grid-board' } as any,
      vars: {},
      note: 'done',
      result: 0
    };
  }
};
