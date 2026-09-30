import type { TraceModule, Step } from '../lib/types';
import { GridBoardState } from '../lib/types';

interface Input {
  grid: string[][];
}

export const trace: TraceModule<Input> = {
  renderer: 'grid-board',
  inputSchema: {
    grid: { type: 'json', label: 'Grid of 1s and 0s' },
  },
  defaultInput: {
    grid: [
      ["1","1","0","0","0"],
      ["1","1","0","0","0"],
      ["0","0","1","0","0"],
      ["0","0","0","1","1"]
    ],
  },
  samples: [
    {
      input: {
        grid: [
          ["1","1","0","0","0"],
          ["1","1","0","0","0"],
          ["0","0","1","0","0"],
          ["0","0","0","1","1"]
        ]
      },
      expected: 3
    }
  ],
  run: function* (input, L) {
    // Deep copy grid
    const grid = input.grid.map(row => [...row]);
    const rows = grid.length;
    const cols = rows > 0 ? grid[0].length : 0;
    
    // We maintain a "state" array for colors independent of the values which get sunk
    const cellStates: ('idle'|'pointer-a'|'success')[][] = grid.map(row => row.map(() => 'idle'));

    const getState = (pointers?: { r: number; c: number; variant: 'a'|'b'|'c'; name: string }[]): GridBoardState => {
      const g = grid.map((r, i) => r.map((val, j) => ({
        id: `${i}-${j}`,
        value: val,
        state: cellStates[i][j]
      })));
      return {
        renderer: 'grid-board',
        grid: g,
        pointers: pointers || [],
      };
    };

    let islands = 0;

    yield {
      line: L('int islands = 0;'),
      event: 'init',
      state: getState(),
      vars: { rows, cols, islands },
      note: 'Initialize island count.',
    } as Step;

    function* dfs(r: number, c: number): Generator<Step> {
      yield {
        line: L('if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] != \'1\') return;'),
        event: 'compare',
        state: getState([{ r, c, variant: 'a', name: 'dfs' }]),
        vars: { rows, cols, islands, r, c },
        note: `DFS check cell (${r}, ${c}).`,
      };

      if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== '1') {
        return;
      }

      grid[r][c] = '0';
      cellStates[r][c] = 'success'; // Color it green to show it's part of an island

      yield {
        line: L('grid[r][c] = \'0\'; // mark visited by sinking the land'),
        event: 'record',
        state: getState([{ r, c, variant: 'a', name: 'dfs' }]),
        vars: { rows, cols, islands, r, c },
        note: `Sink the land at (${r}, ${c}) to avoid revisiting.`,
      };

      yield* dfs(r + 1, c);
      yield* dfs(r - 1, c);
      yield* dfs(r, c + 1);
      yield* dfs(r, c - 1);
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        yield {
          line: L('if (grid[r][c] == \'1\') {'),
          event: 'compare',
          state: getState([{ r, c, variant: 'b', name: 'scan' }]),
          vars: { rows, cols, islands, r, c },
          note: `Scanning grid at (${r}, ${c}). Is it land?`,
        } as Step;

        if (grid[r][c] === '1') {
          islands++;
          yield {
            line: L('islands++;'),
            event: 'record',
            state: getState([{ r, c, variant: 'b', name: 'scan' }]),
            vars: { rows, cols, islands, r, c },
            note: `Found a new island! Count is now ${islands}.`,
          } as Step;

          yield* dfs(r, c);
        }
      }
    }

    yield {
      line: L('return islands;'),
      event: 'done',
      state: getState(),
      vars: { rows, cols, islands },
      note: 'All cells scanned. Return final island count.',
      result: islands,
    } as Step;
  },
};
