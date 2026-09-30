import type { TraceModule, Step } from '../lib/types';
import { BitGridState } from '../lib/types';

interface Input {
  n: number;
}

export const trace: TraceModule<Input> = {
  renderer: 'bit-grid',
  inputSchema: {
    n: { type: 'int', label: 'Unsigned 32-bit Integer', min: 0, max: 4294967295 },
  },
  defaultInput: {
    n: 11, // 1011
  },
  samples: [
    { input: { n: 11 }, expected: 3 },
    { input: { n: 128 }, expected: 1 },
    { input: { n: 2147483645 }, expected: 30 },
  ],
  run: function* (input, L) {
    let { n } = input;
    
    // Helper to get 32-bit array
    const getBits = (num: number): number[] => {
      const bits = Array(32).fill(0);
      let temp = num;
      for (let i = 0; i < 32; i++) {
        bits[i] = temp & 1;
        temp = temp >>> 1;
      }
      return bits;
    };

    const getState = (currentN: number, previousN?: number, activeBit?: number): BitGridState => {
      const numbers = [];
      if (previousN !== undefined) {
        numbers.push({ label: 'n - 1', value: previousN, bits: getBits(previousN) });
      }
      numbers.push({ label: 'n', value: currentN, bits: getBits(currentN) });

      return {
        renderer: 'bit-grid',
        numbers,
        activeBitIndex: activeBit,
      };
    };

    let count = 0;

    yield {
      line: L('int count = 0;'),
      event: 'init',
      state: getState(n),
      vars: { n, count },
      note: 'Initialize count to 0.',
    } as Step;

    while (n !== 0) {
      yield {
        line: L('while (n) {'),
        event: 'compare',
        state: getState(n),
        vars: { n, count },
        note: `Check if n (${n}) is not zero.`,
      } as Step;

      // Find the lowest set bit index to highlight
      let lowestSetBit = -1;
      for (let i = 0; i < 32; i++) {
        if ((n & (1 << i)) !== 0) {
          lowestSetBit = i;
          break;
        }
      }

      const prevN = n - 1;

      yield {
        line: L('n &= (n - 1);   // clears the lowest set bit'),
        event: 'compare',
        state: getState(n, prevN, lowestSetBit),
        vars: { n, count },
        note: `Lowest set bit is at index ${lowestSetBit}. n - 1 flips all bits up to the lowest set bit.`,
      } as Step;

      // perform n &= (n - 1)
      // Javascript bitwise operators are 32-bit signed, so we must use unsigned right shift to keep it clean if we wanted to,
      // but for subtraction and bitwise AND on positive uint32, it works fine up to 2^31-1. 
      // To properly handle up to 2^32-1, we can do:
      n = Number(BigInt(n) & BigInt(n - 1));

      yield {
        line: L('n &= (n - 1);   // clears the lowest set bit'),
        event: 'record',
        state: getState(n),
        vars: { n, count },
        note: 'The lowest set bit has been cleared.',
      } as Step;

      count++;

      yield {
        line: L('count++;'),
        event: 'record',
        state: getState(n),
        vars: { n, count },
        note: `Increment count to ${count}.`,
      } as Step;
    }

    yield {
      line: L('while (n) {'),
      event: 'compare',
      state: getState(n),
      vars: { n, count },
      note: 'n is now 0. Loop terminates.',
    } as Step;

    yield {
      line: L('return count;'),
      event: 'done',
      state: getState(n),
      vars: { n, count },
      note: `Total number of set bits: ${count}.`,
      result: count,
    } as Step;
  },
};
