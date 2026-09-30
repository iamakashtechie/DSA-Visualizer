import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'content', 'source');
const OUT_DIR = path.join(ROOT, 'src', 'generated');
const REPORT_PATH = path.join(ROOT, 'content', 'build-report.txt');
const OVERRIDES_PATH = path.join(ROOT, 'content', 'overrides.json');

// ── Types ────────────────────────────────────────────────────────────────────

interface Problem {
  id: string;
  patternSlug: string;
  groupTitle: string;
  order: number;
  title: string;
  lcNumber?: number;
  sourceLabel: 'LeetCode' | 'GfG';
  url: string;
  description: string;
  approach?: string;
  cpp: string;
  time?: string;
  space?: string;
  complexityRaw?: string;
}

interface PatternData {
  slug: string;
  title: string;
  description: string;
  problemCount: number;
  groups: string[];
  templates?: string;
  signals: Array<{ signal: string; technique: string }>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/\[.*?\]\(.*?\)/g, '') // strip markdown links
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractTitle(raw: string): string {
  // Strip markdown link syntax [text](url) → text
  let t = raw.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Strip leading number prefixes like "1. " or "1.1 " or "### 1. "
  t = t.replace(/^#+\s*/, '').replace(/^\d+\.\d+\s+/, '').replace(/^\d+\.\s+/, '');
  // Strip LC number prefix like "167. Title" → "Title"
  t = t.replace(/^\d+\.\s+/, '');
  return t.trim();
}

function extractUrl(lines: string[], start: number, limit: number): string {
  // start-1 to also check the heading line (Two Pointer embeds URL in ### heading)
  const begin = Math.max(0, start - 1);
  for (let i = begin; i < Math.min(start + limit, lines.length); i++) {
    const mdLink = lines[i].match(/\[.*?\]\((https?:\/\/[^)]+)\)/);
    if (mdLink) return mdLink[1];
    const bare = lines[i].match(/https?:\/\/\S+/);
    if (bare) return bare[0].replace(/[.,)>]+$/, '');
  }
  return '';
}

// Section headings that look like problem headings but are summaries/cheat-sheets
const NON_PROBLEM_TITLE_PATTERNS = [
  /quick recap/i,
  /cheat sheet/i,
  /notes on when/i,
  /pattern summary/i,
  /core bit tricks/i,
  /table of contents/i,
  /quick reference/i,
];

function extractComplexity(line: string): { time?: string; space?: string; complexityRaw?: string } {
  const raw = line.replace(/\*\*/g, '').replace(/&nbsp;/g, ' ').trim();
  const timeM = raw.match(/Time[:\s]+([^\s,;]+(?:\s[^\s,;]+)*?)(?:\s+Space|$|\s*[,;])/i);
  const spaceM = raw.match(/Space[:\s]+([^\s,;]+(?:\s[^\s,;]+)*?)(?:\s*$|\s*[,;])/i);
  return {
    time: timeM ? timeM[1].trim() : undefined,
    space: spaceM ? spaceM[1].trim() : undefined,
    complexityRaw: raw || undefined,
  };
}

function parseLcNumber(text: string): number | undefined {
  const m = text.match(/\b(\d{1,4})\./);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n > 0 && n < 3500) return n;
  }
  return undefined;
}

function isGfG(url: string): boolean {
  return url.includes('geeksforgeeks') || url.includes('gfg');
}

function makeId(patternSlug: string, title: string, seen: Set<string>): string {
  let slug = toSlug(title);
  // Remove leading LC number from slug e.g. "167-two-sum-ii" → "two-sum-ii"
  slug = slug.replace(/^\d+-/, '');
  let id = `${patternSlug}/${slug}`;
  // Collision: append suffix
  let suffix = 2;
  while (seen.has(id)) {
    id = `${patternSlug}/${slug}-${suffix++}`;
  }
  seen.add(id);
  return id;
}

// ── Per-file config ───────────────────────────────────────────────────────────

interface FileConfig {
  patternSlug: string;
  patternTitle: string;
  patternDesc: string;
  expectedCount: number;
  // How to detect groups (h2) vs problems (h3 or h2)
  groupHeadingLevel: 2 | 3;
  problemHeadingLevel: 2 | 3;
  hasTemplateBlock?: boolean; // Binary Search top-level template
}

const FILE_CONFIGS: Record<string, FileConfig> = {
  '01 Two Pointer Technique.md': {
    patternSlug: 'two-pointer',
    patternTitle: 'Two Pointer',
    patternDesc: 'Use when sorted array or string allows converging from both ends',
    expectedCount: 20,
    groupHeadingLevel: 2,
    problemHeadingLevel: 3,
  },
  '02 Sliding Window Technique.md': {
    patternSlug: 'sliding-window',
    patternTitle: 'Sliding Window',
    patternDesc: 'Use when finding optimal contiguous subarray/substring',
    expectedCount: 14,
    groupHeadingLevel: 3, // no real groups; problems are h2
    problemHeadingLevel: 2,
  },
  '03 Binary Search Pattern.md': {
    patternSlug: 'binary-search',
    patternTitle: 'Binary Search',
    patternDesc: 'Use when you can define a monotonic predicate over a search space',
    expectedCount: 20,
    groupHeadingLevel: 2,
    problemHeadingLevel: 3,
    hasTemplateBlock: true,
  },
  '04 Backtracking.md': {
    patternSlug: 'backtracking',
    patternTitle: 'Backtracking',
    patternDesc: 'Use when exploring all possibilities with choose/explore/unchoose',
    expectedCount: 16,
    groupHeadingLevel: 2,
    problemHeadingLevel: 3,
  },
  '05 Greedy Algorithm Technique.md': {
    patternSlug: 'greedy',
    patternTitle: 'Greedy',
    patternDesc: 'Use when locally optimal choices lead to a globally optimal solution',
    expectedCount: 18,
    groupHeadingLevel: 2,
    problemHeadingLevel: 3,
  },
  '06 Bit Manipulation.md': {
    patternSlug: 'bit-manipulation',
    patternTitle: 'Bit Manipulation',
    patternDesc: 'Use when operations on individual bits can simplify the solution',
    expectedCount: 16,
    groupHeadingLevel: 2,
    problemHeadingLevel: 3,
  },
  '07 Graph.md': {
    patternSlug: 'graph',
    patternTitle: 'Graph',
    patternDesc: 'Use when modeling relationships, paths, or connectivity between entities',
    expectedCount: 20,
    groupHeadingLevel: 2,
    problemHeadingLevel: 3,
  },
  '08 DP.md': {
    patternSlug: 'dp',
    patternTitle: 'Dynamic Programming',
    patternDesc: 'Use when optimal substructure and overlapping subproblems exist',
    expectedCount: 20,
    groupHeadingLevel: 2,
    problemHeadingLevel: 3,
  },
};

// ── Main parser ───────────────────────────────────────────────────────────────

function parseFile(
  filename: string,
  content: string,
  config: FileConfig,
  globalOrder: { n: number },
  idsSeen: Set<string>,
  warnings: string[],
): { pattern: PatternData; problems: Problem[] } {
  const lines = content.split('\n');
  const problems: Problem[] = [];
  const groups: string[] = [];
  let templates: string | undefined;

  let currentGroup = 'General';
  let inProblem = false;
  let inTemplateBlock = false;
  let templateLines: string[] = [];

  // Current problem accumulator
  let pTitle = '';
  let pUrl = '';
  let pDesc = '';
  let pApproach = '';
  let pCpp = '';
  let pTime: string | undefined;
  let pSpace: string | undefined;
  let pComplexityRaw: string | undefined;
  let pDescLines: string[] = [];
  let pApproachLines: string[] = [];
  let inCppBlock = false;
  let cppLines: string[] = [];
  let inApproach = false;

  const { groupHeadingLevel, problemHeadingLevel, patternSlug } = config;

  function flushProblem() {
    if (!pTitle) return;
    // Resolve desc
    pDesc = pDescLines.join(' ').replace(/\s+/g, ' ').trim();
    pApproach = pApproachLines.join(' ').replace(/\s+/g, ' ').trim();
    if (!pUrl) {
      warnings.push(`${filename}: No URL found for problem "${pTitle}"`);
    }
    const id = makeId(patternSlug, pTitle, idsSeen);
    const lcNum = parseLcNumber(pTitle + ' ' + pUrl);
    problems.push({
      id,
      patternSlug,
      groupTitle: currentGroup,
      order: ++globalOrder.n,
      title: extractTitle(pTitle),
      lcNumber: lcNum,
      sourceLabel: isGfG(pUrl) ? 'GfG' : 'LeetCode',
      url: pUrl,
      description: pDesc || 'See problem link for description.',
      approach: pApproach || undefined,
      cpp: pCpp,
      time: pTime,
      space: pSpace,
      complexityRaw: pComplexityRaw,
    });
    // reset
    pTitle = ''; pUrl = ''; pDesc = ''; pApproach = ''; pCpp = '';
    pTime = undefined; pSpace = undefined; pComplexityRaw = undefined;
    pDescLines = []; pApproachLines = []; inApproach = false; inProblem = false;
  }

  function isGroupHeading(line: string): boolean {
    const prefix = '#'.repeat(groupHeadingLevel) + ' ';
    if (!line.startsWith(prefix)) return false;
    // For sliding window, h2 lines ARE problems, not groups
    if (config.patternSlug === 'sliding-window') return false;
    // Binary Search: h2 groups look like "## 1. Classic..." or "## 2. ..."
    // Greedy: "## 1. Interval Scheduling", Backtracking: "## 1. Subset Generation"
    // Bit Manip: "## Group 1: ..."
    // Graph: "## A. Grid Traversal"
    // DP: "## 1. Linear / 1D DP"
    // Two Pointer: "## Pattern 1: ..."
    // We want h2 to be a group, h3 to be a problem
    return true;
  }

  function isProblemHeading(line: string): boolean {
    const prefix = '#'.repeat(problemHeadingLevel) + ' ';
    return line.startsWith(prefix);
  }

  let i = 0;

  // For Binary Search: detect and capture top template block (before first h2)
  if (config.hasTemplateBlock) {
    const firstH2 = lines.findIndex(l => l.startsWith('## '));
    if (firstH2 > 0) {
      // Lines between first ```cpp and last ``` before firstH2
      const blockLines = lines.slice(0, firstH2);
      const cppStart = blockLines.findIndex(l => l.startsWith('```cpp'));
      if (cppStart >= 0) {
        // Capture entire block (might have 2 code blocks)
        templates = blockLines.join('\n');
      }
    }
  }

  while (i < lines.length) {
    const line = lines[i];

    // ── Inside a cpp block ──
    if (inCppBlock) {
      if (line.startsWith('```')) {
        inCppBlock = false;
        pCpp = cppLines.join('\n');
      } else {
        cppLines.push(line);
      }
      i++;
      continue;
    }

    // ── Template block capture (Binary Search) ──
    if (inTemplateBlock) {
      if (line.startsWith('## ')) {
        inTemplateBlock = false;
        templates = templateLines.join('\n');
        // Don't increment — reprocess this line
        continue;
      }
      templateLines.push(line);
      i++;
      continue;
    }

    // ── H1 (skip) ──
    if (line.startsWith('# ')) {
      i++;
      continue;
    }

    // ── Group heading ──
    if (isGroupHeading(line)) {
      flushProblem();
      const rawGroup = line.replace(/^#+\s+/, '').trim();
      currentGroup = rawGroup;
      if (!groups.includes(currentGroup)) groups.push(currentGroup);
      i++;
      continue;
    }

    // ── Problem heading ──
    if (isProblemHeading(line)) {
      const rawTitle = line.replace(/^#+\s+/, '').trim();
      // Skip known non-problem section headings (summaries, cheat sheets, etc.)
      if (NON_PROBLEM_TITLE_PATTERNS.some((re) => re.test(rawTitle))) {
        flushProblem();
        inProblem = false;
        i++;
        continue;
      }
      flushProblem();
      inProblem = true;
      pTitle = rawTitle;
      // Look ahead for URL (also checks heading line itself via start-1 in extractUrl)
      pUrl = extractUrl(lines, i + 1, 5);
      pDescLines = [];
      pApproachLines = [];
      inApproach = false;
      i++;
      continue;
    }

    if (!inProblem) {
      i++;
      continue;
    }

    // ── Inside a problem ──

    // Start of cpp block
    if (line.startsWith('```cpp')) {
      inCppBlock = true;
      cppLines = [];
      i++;
      continue;
    }

    // Approach/Intuition
    if (/^\*\*Approach[:\*]/.test(line) || /^\*\*Intuition[:\*]/.test(line)) {
      inApproach = true;
      const rest = line.replace(/^\*\*(Approach|Intuition)[:\*]+\*\*\s*/, '').trim();
      if (rest) pApproachLines.push(rest);
      i++;
      continue;
    }

    // Pattern note (Sliding Window has "**Pattern:** ..." lines)
    if (/^\*\*Pattern[:\*]/.test(line)) {
      const rest = line.replace(/^\*\*Pattern[:\*]+\*\*\s*/, '').trim();
      if (rest && pApproachLines.length === 0) pApproachLines.push(rest);
      i++;
      continue;
    }

    // Complexity line
    if (/^\*\*Time[:\*]/.test(line) || /^\*\*Space[:\*]/.test(line) || /^\*\*Complexity[:\*]/.test(line)) {
      const c = extractComplexity(line);
      pTime = pTime ?? c.time;
      pSpace = pSpace ?? c.space;
      pComplexityRaw = pComplexityRaw ?? c.complexityRaw;
      inApproach = false;
      i++;
      continue;
    }

    // URL lines (already grabbed via extractUrl, but pick up LeetCode/GfG labels)
    if (!pUrl && (line.includes('http') || line.includes('leetcode') || line.includes('geeksforgeeks'))) {
      const found = extractUrl([line], 0, 1);
      if (found) pUrl = found;
      i++;
      continue;
    }

    // Section separators
    if (line.startsWith('---') || line.startsWith('===')) {
      inApproach = false;
      i++;
      continue;
    }

    // Table of contents lines (skip)
    if (line.startsWith('- [') || line.startsWith('1. [') || line.match(/^\d+\. \[/)) {
      i++;
      continue;
    }

    // Skip fence ends and empty lines in approach
    if (line.startsWith('```')) {
      i++;
      continue;
    }

    // Collect description / approach text
    const stripped = line.replace(/^\s+/, '');
    if (!stripped || stripped.startsWith('#') || stripped.startsWith('|')) {
      if (stripped.startsWith('#')) inApproach = false;
      i++;
      continue;
    }

    if (inApproach) {
      pApproachLines.push(stripped);
    } else if (pDescLines.length < 3 && !pCpp && stripped.length > 10 && !stripped.startsWith('**')) {
      pDescLines.push(stripped);
    }

    i++;
  }

  flushProblem();

  return {
    pattern: {
      slug: config.patternSlug,
      title: config.patternTitle,
      description: config.patternDesc,
      problemCount: problems.length,
      groups,
      templates,
      signals: [],
    },
    problems,
  };
}

// ── Entry point ───────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const warnings: string[] = [];
  const allProblems: Problem[] = [];
  const allPatterns: PatternData[] = [];
  const globalOrder = { n: 0 };
  const idsSeen = new Set<string>();

  // Load overrides
  let overrides: Record<string, Partial<Problem>> = {};
  if (fs.existsSync(OVERRIDES_PATH)) {
    try {
      overrides = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf-8'));
    } catch {
      warnings.push('overrides.json: parse error, ignoring');
    }
  }

  const filenames = Object.keys(FILE_CONFIGS).sort();

  for (const filename of filenames) {
    const config = FILE_CONFIGS[filename];
    const filepath = path.join(SOURCE_DIR, filename);
    if (!fs.existsSync(filepath)) {
      warnings.push(`Missing source file: ${filename}`);
      continue;
    }
    const content = fs.readFileSync(filepath, 'utf-8');
    const { pattern, problems } = parseFile(filename, content, config, globalOrder, idsSeen, warnings);

    // Apply overrides
    for (const p of problems) {
      if (overrides[p.id]) {
        Object.assign(p, overrides[p.id]);
      }
    }

    if (problems.length !== config.expectedCount) {
      warnings.push(
        `${filename}: expected ${config.expectedCount} problems, got ${problems.length}. IDs: ${problems.map(p => p.id).join(', ')}`,
      );
    }

    pattern.problemCount = problems.length;
    allPatterns.push(pattern);
    allProblems.push(...problems);
  }

  // Write outputs
  fs.writeFileSync(path.join(OUT_DIR, 'problems.json'), JSON.stringify(allProblems, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'patterns.json'), JSON.stringify(allPatterns, null, 2));

  // Per-pattern summary
  const summary = allPatterns.map(p => `  ${p.title}: ${p.problemCount} (expected ${FILE_CONFIGS[Object.keys(FILE_CONFIGS).find(k => FILE_CONFIGS[k].patternSlug === p.slug)!]?.expectedCount})`).join('\n');
  const reportLines = [
    `Build report — ${new Date().toISOString()}`,
    `Total problems: ${allProblems.length} / 144 expected`,
    '',
    'Per-pattern counts:',
    summary,
    '',
    ...(warnings.length ? ['Warnings:', ...warnings.map(w => `  - ${w}`)] : ['No warnings.']),
  ];
  fs.writeFileSync(REPORT_PATH, reportLines.join('\n'));

  console.log(`\n✓ Generated ${allPatterns.length} patterns and ${allProblems.length} problems`);
  console.log(summary);

  if (allProblems.length !== 144) {
    console.error(`\n✗ ERROR: Expected exactly 144 problems, got ${allProblems.length}`);
    console.error('  Check content/build-report.txt for details');
    process.exit(1);
  }
  console.log('\n✓ Problem count check passed (144/144)');
}

main();
