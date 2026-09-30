import type { TraceModule, Step } from '../lib/types';

interface Input {
  nodes: number[];
  cyclePos: number; // -1 for no cycle, index otherwise
}

export const trace: TraceModule<Input> = {
  renderer: 'linked-list',
  inputSchema: {
    nodes: { type: 'int-array', label: 'Node Values', min: 0, max: 10 },
    cyclePos: { type: 'int', label: 'Cycle Position (-1 for none)' },
  },
  defaultInput: {
    nodes: [3, 2, 0, -4],
    cyclePos: 1,
  },
  samples: [
    { input: { nodes: [3, 2, 0, -4], cyclePos: 1 }, expected: true },
    { input: { nodes: [1, 2], cyclePos: 0 }, expected: true },
    { input: { nodes: [1], cyclePos: -1 }, expected: false },
  ],
  run: function* (input, L) {
    const { nodes, cyclePos } = input;
    
    // Build initial linked list state
    const linkedListNodes = nodes.map((val, i) => ({
      id: `n${i}`,
      value: val,
      state: 'idle' as const,
      next: i < nodes.length - 1 ? `n${i + 1}` : (cyclePos >= 0 ? `n${cyclePos}` : undefined),
      pointers: []
    }));

    const getState = (slowIdx: number | null, fastIdx: number | null, overrideState?: Record<number, 'success'>) => {
      const cloned = JSON.parse(JSON.stringify(linkedListNodes));
      if (slowIdx !== null && cloned[slowIdx]) {
        cloned[slowIdx].pointers.push({ name: 'slow', variant: 'a' });
        cloned[slowIdx].state = 'pointer-a';
      }
      if (fastIdx !== null && cloned[fastIdx]) {
        cloned[fastIdx].pointers.push({ name: 'fast', variant: 'b' });
        if (cloned[fastIdx].state === 'pointer-a') {
            cloned[fastIdx].state = 'success'; // Both pointers here
        } else {
            cloned[fastIdx].state = 'pointer-b';
        }
      }
      if (overrideState) {
          for (const [idx, state] of Object.entries(overrideState)) {
              if (cloned[Number(idx)]) {
                  cloned[Number(idx)].state = state;
              }
          }
      }
      return {
        renderer: 'linked-list' as const,
        nodes: cloned,
        head: nodes.length > 0 ? 'n0' : undefined
      };
    };

    yield {
      line: L('if (head == nullptr) return false;'),
      event: 'init',
      state: getState(null, null),
      vars: {},
      note: 'Check if list is empty.',
    } as Step;

    if (nodes.length === 0) {
      yield {
        line: L('if (head == nullptr) return false;'),
        event: 'done',
        state: getState(null, null),
        vars: {},
        note: 'List is empty, so no cycle.',
        result: false,
      } as Step;
      return;
    }

    let slow = 0;
    let fast = 0;

    yield {
      line: L('ListNode *slow = head, *fast = head;'),
      event: 'init',
      state: getState(slow, fast),
      vars: {},
      note: 'Initialize both slow and fast pointers to the head.',
    } as Step;

    while (true) {
      yield {
        line: L('while (fast && fast->next) {'),
        event: 'compare',
        state: getState(slow, fast),
        vars: {},
        note: 'Check if fast and fast->next are valid.',
      } as Step;
      
      const hasFast = fast < nodes.length;
      const nextFast = hasFast ? (fast < nodes.length - 1 ? fast + 1 : (cyclePos >= 0 ? cyclePos : -1)) : -1;
      
      if (!hasFast || nextFast === -1) {
          yield {
            line: L('return false;'),
            event: 'done',
            state: getState(slow, fast),
            vars: {},
            note: 'Reached the end of the list. No cycle exists.',
            result: false
          } as Step;
          return;
      }

      slow = slow < nodes.length - 1 ? slow + 1 : (cyclePos >= 0 ? cyclePos : -1);
      yield {
        line: L('slow = slow->next;'),
        event: 'move-pointer',
        state: getState(slow, fast),
        vars: {},
        note: 'Move slow pointer one step.',
      } as Step;

      fast = nextFast < nodes.length - 1 ? nextFast + 1 : (cyclePos >= 0 ? cyclePos : -1);
      yield {
        line: L('fast = fast->next->next;'),
        event: 'move-pointer',
        state: getState(slow, fast),
        vars: {},
        note: 'Move fast pointer two steps.',
      } as Step;

      yield {
        line: L('if (slow == fast)'),
        event: 'compare',
        state: getState(slow, fast),
        vars: {},
        note: 'Check if slow and fast pointers meet.',
      } as Step;

      if (slow === fast) {
        yield {
            line: L('return true;'),
            event: 'done',
            state: getState(slow, fast, { [slow]: 'success' }),
            vars: {},
            note: 'Pointers meet! A cycle is detected.',
            result: true
        } as Step;
        return;
      }
    }
  },
};
