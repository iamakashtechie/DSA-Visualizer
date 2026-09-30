import type { TraceModule } from '../lib/types';
import { bitState } from './missing';

interface Input { nums: number[] }

export const trace: TraceModule<Input> = {
	renderer: 'bit-grid',
	inputSchema: { nums: { type: 'int-array', label: 'Pairs with two unique values', min: 2, max: 16 } },
	defaultInput: { nums: [1, 2, 1, 3, 2, 5] },
	samples: [
		{ input: { nums: [1, 2, 1, 3, 2, 5] }, expected: [3, 5] },
		{ input: { nums: [4, 1, 4, 6] }, expected: [1, 6] },
	],
	run: function* ({ nums }, L) {
		let xorAll = 0;
		for (const num of nums) {
			xorAll ^= num;
			yield { line: L('for (int num : nums) xorAll ^= num;   // xorAll = a ^ b'), event: 'bit-op', state: bitState([['xorAll', xorAll], ['num', num]]), vars: { num, xorAll }, note: 'Cancel paired values to leave a XOR b.' };
		}
		const diffBit = xorAll & -xorAll;
		yield { line: L('int diffBit = xorAll & (-xorAll);'), event: 'bit-op', state: bitState([['xorAll', xorAll], ['diffBit', diffBit]], 0), vars: { xorAll, diffBit }, note: `Isolate distinguishing bit ${diffBit}.` };
		let a = 0, b = 0;
		for (const num of nums) {
			if (num & diffBit) a ^= num; else b ^= num;
			yield { line: L('if (num & diffBit) a ^= num;      // group where this bit is set'), event: 'bit-op', state: bitState([['a', a], ['b', b], ['num', num]], 0), vars: { num, diffBit, a, b }, note: 'Partition by the distinguishing bit; duplicates cancel within groups.' };
		}
		yield { line: L('return {a, b};'), event: 'done', state: bitState([['a', a], ['b', b]]), vars: { a, b, diffBit }, note: `The two unpaired values are ${a} and ${b}.`, result: [a, b] };
	},
};
