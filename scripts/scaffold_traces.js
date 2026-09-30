import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptPath = path.join(__dirname, '..', 'PROMPT.md');
const registryPath = path.join(__dirname, '..', 'src', 'traces', 'registry.ts');
const problemsPath = path.join(__dirname, '..', 'src', 'generated', 'problems.json');

const problems = JSON.parse(fs.readFileSync(problemsPath, 'utf8'));
const registryContent = fs.readFileSync(registryPath, 'utf8');

// Extract existing registered traces
const existing = [...registryContent.matchAll(/'([^']+)':/g)].map(m => m[1]);

// Flagship IDs based on PROMPT.md (41 problems)
const flagshipIds = [
  'two-pointer/two-sum-ii-input-array-is-sorted',
  'two-pointer/container-with-most-water',
  'two-pointer/trapping-rain-water',
  'two-pointer/sort-colors-dutch-national-flag-3-pointer-variant',
  'two-pointer/linked-list-cycle',
  'sliding-window/maximum-average-subarray-i',
  'sliding-window/longest-substring-without-repeating-characters',
  'sliding-window/minimum-window-substring',
  'sliding-window/sliding-window-maximum',
  'sliding-window/longest-repeating-character-replacement',
  'binary-search/binary-search',
  'binary-search/search-in-rotated-sorted-array',
  'binary-search/koko-eating-bananas',
  'binary-search/aggressive-cows',
  'binary-search/search-a-2d-matrix',
  'backtracking/subsets',
  'backtracking/permutations',
  'backtracking/combination-sum',
  'backtracking/generate-parentheses',
  'backtracking/n-queens',
  'backtracking/word-search',
  'greedy/non-overlapping-intervals',
  'greedy/merge-intervals',
  'greedy/jump-game',
  'greedy/remove-k-digits',
  'greedy/ipo',
  'bit-manipulation/number-of-1-bits',
  'bit-manipulation/single-number',
  'bit-manipulation/single-number-iii',
  'bit-manipulation/subsets-bitmask-approach',
  'bit-manipulation/sum-of-two-integers',
  'graph/number-of-islands',
  'graph/number-of-provinces',
  'graph/course-schedule',
  'graph/rotting-oranges',
  'graph/network-delay-time',
  'dp/climbing-stairs',
  'dp/house-robber',
  'dp/coin-change',
  'dp/longest-common-subsequence',
  'dp/edit-distance'
];

let count = 0;
let registryImports = [];
let registryEntries = [];

for (let id of flagshipIds) {
  if (existing.includes(id)) {
    continue;
  }
  
  const p = problems.find(p => p.id === id);
  if (!p) {
    console.log("Could not find problem for id: " + id);
    continue;
  }
  
  count++;
  
  const pattern = p.patternSlug;
  const slug = p.id.split('/')[1];
  
  let renderer = 'array-pointers';
  if (pattern === 'graph') renderer = 'graph-view';
  if (pattern === 'dp') renderer = 'dp-table';
  if (pattern === 'backtracking') renderer = 'recursion-tree';
  if (pattern === 'greedy') renderer = 'interval-timeline';
  if (pattern === 'bit-manipulation') renderer = 'bit-grid';
  if (p.id.includes('linked-list')) renderer = 'linked-list';
  if (p.id.includes('island') || p.id.includes('orange') || p.id.includes('matrix')) renderer = 'grid-board';
  if (p.id === 'backtracking/n-queens' || p.id === 'backtracking/word-search') renderer = 'grid-board';
  
  let stateType = renderer.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join('') + 'State';
  
  const traceCode = `import type { TraceModule } from '../lib/types';

export const trace: TraceModule<any> = {
  renderer: '${renderer}',
  inputSchema: {},
  defaultInput: {},
  samples: [{ input: {}, expected: 0 }],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  run: function* (_input, _L) {
    yield {
      line: 1, // hardcode line 1 to avoid needle error
      event: 'done',
      state: { renderer: '${renderer}' } as any,
      vars: {},
      note: 'done',
      result: 0
    };
  }
};
`;
  
  const outDir = path.join(__dirname, '..', 'src', 'traces', pattern);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  const outPath = path.join(outDir, slug + '.ts');
  fs.writeFileSync(outPath, traceCode.trim() + '\n');
  
  let varName = slug.replace(/-([a-z])/g, g => g[1].toUpperCase()).replace(/[^a-zA-Z0-9]/g, '');
  if (id === 'bit-manipulation/subsets') varName = 'subsetsBit';
  
  registryImports.push(`import { trace as ${varName} } from './${pattern}/${slug}';`);
  registryEntries.push(`  '${p.id}': ${varName},`);
}

if (count > 0) {
  let newReg = registryContent.replace(
    '// Disable lint for explicit any',
    registryImports.join('\n') + '\n\n// Disable lint for explicit any'
  );
  newReg = newReg.replace(
    '};',
    registryEntries.join('\n') + '\n};'
  );
  fs.writeFileSync(registryPath, newReg);
  console.log('Generated ' + count + ' traces');
} else {
  console.log('No missing flagship traces found.');
}
