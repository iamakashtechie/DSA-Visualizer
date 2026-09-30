const fs = require('fs');
const files = [
  'src/traces/backtracking/subsets.ts',
  'src/traces/graph/course-schedule.ts',
  'src/traces/graph/number-of-islands.ts',
  'src/traces/dp/climbing-stairs.ts',
  'src/traces/greedy/merge-intervals.ts',
  'src/traces/two-pointer/linked-list-cycle.ts',
  'src/traces/bit-manipulation/number-of-1-bits.ts',
  'src/renderers/array-pointers/ArrayPointersRenderer.tsx',
  'src/renderers/linked-list/LinkedListRenderer.tsx',
  'src/renderers/bit-grid/BitGridRenderer.tsx'
];
for (let file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/'default'/g, "'idle'");
  content = content.replace(/"default"/g, '"idle"');
  if (file === 'src/renderers/array-pointers/ArrayPointersRenderer.tsx') {
    content = content.replace("import type { ArrayPointersState, Pointer }", "import type { ArrayPointersState, Pointer, CellState }");
  }
  // also fix unused vars in linked list
  if (file === 'src/renderers/linked-list/LinkedListRenderer.tsx') {
    content = content.replace(/import \{ LinkedListState, LinkedListNode \} from/g, "import { LinkedListState } from");
    content = content.replace(/let currentX = 40;/g, "");
  }
  fs.writeFileSync(file, content);
}
console.log("Done");
