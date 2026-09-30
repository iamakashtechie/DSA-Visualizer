---
name: Add Visualization
description: Project skill for adding a new algorithm visualization to the DSA Pattern Visualizer.
---

# Add Visualization Skill

Use this skill when the user asks to "add a visualization for [problem title]" or similar.

## 1. Locate the Problem
1. Find the problem's exact `id` and `cpp` string in `src/generated/problems.json`.
2. Determine which rendering strategy to use based on the problem (e.g. `array-pointers`, `grid`, `graph` etc).
3. If a suitable renderer component doesn't exist yet, build it in `src/renderers/<name>/`.

## 2. Create the Trace Module
1. Create a new trace file in `src/traces/<pattern>/<problem-slug>.ts`.
2. Define the `TraceModule` export:
   - `renderer`: the exact string name of the renderer.
   - `inputSchema`: interactive fields for the custom input.
   - `defaultInput`: a readable, small default input.
   - `samples`: at least 2 test cases with expected results.
   - `run(input, L)`: the generator function yielding `Step`s.
3. Map every meaningful C++ execution step to a `yield` that:
   - Sets the `line: L('unique substring of c++')`
   - Sets the `event` (e.g. 'compare', 'record', 'move-pointer')
   - Builds the full `state` for the renderer
   - Includes local variable snapshots in `vars`
   - Writes a short (~90 char maximum) `note` explaining the 'why' of the step.
   - Optionally includes `counters`
   - On the final step, sets `event: 'done'` and provides `result`.

## 3. Register the Trace
1. Open `src/traces/registry.ts`.
2. Import the new trace module.
3. Add it to the `traceRegistry` object using the exact problem `id` as the key.

## 4. Test
1. The new trace will be automatically picked up by `tests/traces.test.ts`.
2. Run `npm run test` to verify your samples pass.
3. Run `npm run dev` and navigate to the problem page to manually verify the UI playback.
