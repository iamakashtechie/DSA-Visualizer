import type { LineResolver } from './types';

/**
 * Creates a line-resolver function bound to a specific C++ code string.
 *
 * Usage inside a trace generator:
 *   const L = createL(problem.cpp);
 *   yield { line: L("int left = 0"), ... }
 *
 * @param cpp - The verbatim C++ code string (as stored in problems.json).
 * @returns A resolver function L(needle, nth=1) → 1-based line number.
 *
 * Throws in development / test environments if the needle is not found,
 * so line-mapping drift is caught immediately. Falls back to line 1 in
 * production to avoid crashing the UI.
 */
export function createL(cpp: string): LineResolver {
  const lines = cpp.split('\n');

  return function L(needle: string, nth = 1): number {
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(needle)) {
        count++;
        if (count === nth) return i + 1; // 1-based
      }
    }

    // In dev/test, throw so trace authors notice immediately
    const isDev =
      typeof process !== 'undefined' &&
      (process.env.NODE_ENV === 'test' ||
        process.env.NODE_ENV === 'development');

    if (isDev) {
      throw new Error(
        `createL: needle "${needle}" (nth=${nth}) not found in C++ code.\n` +
          `Available lines:\n${lines.map((l, i) => `  ${i + 1}: ${l}`).join('\n')}`,
      );
    }

    // Production fallback: highlight line 1 rather than crash
    return 1;
  };
}
