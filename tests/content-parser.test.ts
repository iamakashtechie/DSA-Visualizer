import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const PROBLEMS_PATH = join(ROOT, 'src', 'generated', 'problems.json');
const PATTERNS_PATH = join(ROOT, 'src', 'generated', 'patterns.json');

// Run build-content if generated files don't exist
function ensureGenerated() {
  if (!existsSync(PROBLEMS_PATH) || !existsSync(PATTERNS_PATH)) {
    execSync('npx tsx scripts/build-content.ts', { cwd: ROOT, stdio: 'inherit' });
  }
}

interface Problem {
  id: string;
  patternSlug: string;
  title: string;
  cpp: string;
  url: string;
}

interface PatternData {
  slug: string;
  title: string;
  problemCount: number;
}

describe('Content parser', () => {
  ensureGenerated();

  const problems: Problem[] = JSON.parse(readFileSync(PROBLEMS_PATH, 'utf-8'));
  const patterns: PatternData[] = JSON.parse(readFileSync(PATTERNS_PATH, 'utf-8'));

  const EXPECTED_COUNTS: Record<string, number> = {
    'two-pointer': 20,
    'sliding-window': 14,
    'binary-search': 20,
    'backtracking': 16,
    'greedy': 18,
    'bit-manipulation': 16,
    'graph': 20,
    'dp': 20,
  };

  it('produces exactly 144 problems total', () => {
    expect(problems.length).toBe(144);
  });

  it('produces exactly 8 patterns', () => {
    expect(patterns.length).toBe(8);
  });

  for (const [slug, count] of Object.entries(EXPECTED_COUNTS)) {
    it(`produces ${count} problems for ${slug}`, () => {
      const group = problems.filter((p) => p.patternSlug === slug);
      expect(group.length).toBe(count);
    });
  }

  it('all problem IDs are unique', () => {
    const ids = problems.map((p) => p.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all problems have a cpp field', () => {
    const missing = problems.filter((p) => !p.cpp);
    expect(missing.map((p) => p.id)).toEqual([]);
  });

  it('all problems have a title', () => {
    const missing = problems.filter((p) => !p.title);
    expect(missing.map((p) => p.id)).toEqual([]);
  });

  it('all problems have a patternSlug', () => {
    const missing = problems.filter((p) => !p.patternSlug);
    expect(missing.map((p) => p.id)).toEqual([]);
  });

  it('pattern problemCount matches actual count in problems.json', () => {
    for (const pattern of patterns) {
      const actual = problems.filter((p) => p.patternSlug === pattern.slug).length;
      expect(actual).toBe(pattern.problemCount);
    }
  });
});
