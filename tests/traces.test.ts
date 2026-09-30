import { describe, it, expect } from 'vitest';
import { createL } from '../src/traces/lib/lineResolver';
import { traceRegistry } from '../src/traces/registry';
import { collectSteps } from '../src/traces/lib/helpers';

describe('createL (Line Resolver)', () => {
  const cpp = `
int main() {
    int x = 1;
    int y = 2;
    // do something
    return x + y;
}
  `.trim();

  it('finds correct 1-based line numbers', () => {
    const L = createL(cpp);
    expect(L('int main()')).toBe(1);
    expect(L('int y = 2;')).toBe(3);
    expect(L('return x + y;')).toBe(5);
  });

  it('supports nth occurrence', () => {
    const cppWithDups = `
int x = 0;
x++;
x++;
    `.trim();
    const L = createL(cppWithDups);
    expect(L('x++', 1)).toBe(2);
    expect(L('x++', 2)).toBe(3);
  });

  it('throws in test environment if needle not found', () => {
    const L = createL(cpp);
    expect(() => L('missing')).toThrowError(/needle "missing" .* not found/);
  });
});

describe('Trace Modules', () => {
  // We mock a dummy L() for tests that just returns 1 for everything
  // unless we actually pass the problem's cpp. Since we don't load problems.json
  // here natively without async, we can just use a dummy L() to verify trace logic.
  const dummyL = () => 1;

  for (const [id, trace] of Object.entries(traceRegistry)) {
    describe(`Trace: ${id}`, () => {
      it('has required properties', () => {
        expect(trace.renderer).toBeDefined();
        expect(trace.inputSchema).toBeDefined();
        expect(trace.defaultInput).toBeDefined();
        expect(Array.isArray(trace.samples)).toBe(true);
        expect(trace.samples.length).toBeGreaterThanOrEqual(1);
        expect(typeof trace.run).toBe('function');
      });

      for (let i = 0; i < trace.samples.length; i++) {
        const sample = trace.samples[i];
        it(`sample ${i + 1} produces expected result`, () => {
          const gen = trace.run(sample.input, dummyL);
          const { steps, capped } = collectSteps(gen);
          
          expect(capped).toBe(false);
          expect(steps.length).toBeGreaterThan(0);
          
          const finalStep = steps[steps.length - 1];
          expect(['done', 'found']).toContain(finalStep.event);
          expect(finalStep.result).toEqual(sample.expected);
        });
      }
    });
  }
});
