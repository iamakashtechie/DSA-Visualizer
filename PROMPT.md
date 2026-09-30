# MASTER BUILD PROMPT — DSA Pattern Visualizer (C++ edition)

> **How to use:** Create an empty repo folder, put my 8 C++ pattern notes (`.md` files) in `content/source/`, optionally run the skill install commands from Section 0, then give this whole prompt to your AI coding tool (Claude Code, Cursor, etc.). Ask it to build **milestone by milestone** (Section 14), each milestone fully runnable before the next begins.

---

## ALWAYS REMEMBER TO CREATE AND LOG ALL YOU CHANGES IN LOG.md FILE in PROJECT ROOT. So, that even if I switch AI Agents, I have log of how much it's implemented.

## 0. Setup: agent skills (do this before M0)

Agent skills (from skills.sh) give you extra guidance that activates when a task matches. Install a **small, official set** and create **one custom project skill**. Skills are guidance only: **if a skill conflicts with this prompt, this prompt wins** (for example: minimal look, Vite single-page app with no Next.js, no backend, Material Symbols icons).

### 0.1 Install

```
npx skills add anthropics/skills --skill frontend-design --skill webapp-testing
npx skills add vercel-labs/agent-skills --skill web-design-guidelines --skill vercel-react-best-practices --skill vercel-composition-patterns
```

- Skill names differ slightly between listings (some show a `vercel-` prefix). Run `npx skills add vercel-labs/agent-skills --list` first and use the exact names shown.
- Add `-a <agent>` (for example `-a claude-code` or `-a cursor`) to target the coding agent you are using.
- **Never block on this step.** If a skill fails to install or is not found, note it in the README and continue.
- Skim each installed `SKILL.md` before relying on it. Prefer official sources; do not install other third-party skills without asking me.

### 0.2 When to use each skill

| Skill | Use it during |
|---|---|
| `frontend-design` | M0 (tokens, shell), M2 (renderers), M4 (polish). Direction: **refined, minimal**: generous spacing, subtle borders, restrained motion. Do not drift toward a loud or decorative look. |
| `vercel-composition-patterns` | M1 onward, for the Player, Tabs, Drawer, panels, and the renderer contract: compound components, state in providers, explicit variants, no boolean-prop sprawl. |
| `vercel-react-best-practices` | M3 and M4: lazy-load traces and Shiki, avoid re-render churn during playback, hold the bundle budget. **Ignore Next.js-specific rules** (this is a Vite SPA). |
| `web-design-guidelines` | M4: audit Home, Pattern, Problem, and Progress pages for focus states, ARIA, touch targets, contrast, and reduced motion. Fix every finding or explain it in the README. |
| `webapp-testing` | After **every** milestone: start the dev server, screenshot at 360 / 390 / 768 / 1024 / 1440 px in **light and dark**, check the console for errors, and step the Player forward and backward on at least one problem. Fix problems and repeat. (It uses Python Playwright; committing Playwright tests to the repo stays optional.) |

### 0.3 Create the custom project skill `add-visualization`

Create it **at the end of M1**, once the `Step` type, `L()` helper, and renderer contract exist, and refine it at the end of M2 and M3. Put it in the project skills folder for your agent (for example `.claude/skills/add-visualization/`), or scaffold it with `npx skills init add-visualization`. Its purpose is to make adding the remaining ~100 problems a repeatable one-file job.

**Files**

- `SKILL.md`: short (under about 150 lines), with this frontmatter:

  ```
  ---
  name: add-visualization
  description: Add or modify a step-by-step visualization (trace module) for a C++ problem in the DSA Pattern Visualizer. Use when asked to visualize, animate, or add a trace or renderer for a problem id such as two-pointer/two-sum-ii.
  ---
  ```

- `references/step-and-events.md`: the `Step` and `EventKind` types, how `L(needle, nth)` resolves lines, the step and input-size caps.
- `references/renderers.md`: for each renderer, its `state` shape, which panels it can embed, and which visualization color tokens it uses.
- `references/worked-example.md`: the complete Two Sum II trace file copied from the repo, with comments on how needles and captions were chosen.

**Procedure written in `SKILL.md`**

1. Look up the problem in `src/generated/problems.json`. Read its `cpp` and `approach`.
2. Choose the renderer from the table in Section 6. Do not invent a new renderer unless none fits; if none fits, propose an extension instead.
3. Create `src/traces/<pattern>/<slug>.ts` following the trace module contract (Section 5).
4. Mirror the C++ control flow and `yield` a step at every **meaningful** moment, not every line. Resolve lines with `L("needle")`, using unique substrings (or the `nth` argument for repeats).
5. Write each `note` as a short **why** (about 90 characters or fewer), never a restatement of the code.
6. Provide a small `defaultInput` that fits a 360 px screen, at least 2 `samples` with expected results, and an `inputSchema` with validation and caps.
7. Register the module in `src/traces/registry.ts` (one line).
8. Run `npm run test` and `npm run build`. Both must pass.
9. Verify visually with the `webapp-testing` skill: light and dark, 360 px and 1440 px, first, middle, and last step, and scrub backward.
10. Confirm the "visualized" badge appears for the problem, and update any visualized-count text in the README.

**Rules written in `SKILL.md`**

- Never edit `content/source/*` or the problem's `cpp` text.
- Use only design tokens (no hex colors), give every state a non-color cue, and respect reduced motion.
- Stay within the 3,000-step cap, and add no new dependencies.
- The skill's definition of done: tests pass, build passes, both themes and both viewport sizes checked, and no console errors.

---

## 1. Role and goal

You are a senior front-end engineer and educator. Build a **production-quality static website** that teaches **DSA interview patterns** through **step-by-step visualizations** of real **C++ solutions**.

The site is **pattern-first**, not algorithm-first:

`Home (8 pattern cards) → Pattern page (when to use, sub-patterns, problems) → Problem page (visualizer + highlighted C++ + explanation)`

The 8 patterns: **Two Pointer, Sliding Window, Binary Search, Backtracking, Greedy, Bit Manipulation, Graph, Dynamic Programming**.

Source of truth for content: the 8 markdown files in `content/source/` (144 problems in total: Two Pointer 20, Sliding Window 14, Binary Search 20, Backtracking 16, Greedy 18, Bit Manipulation 16, Graph 20, DP 20). Each problem has a sub-pattern group, a LeetCode/GFG link, a short description, an approach/intuition (in most files), a commented C++ solution, and time/space complexity. Each file also has a quick-reference or "signal → technique" table.

---

## 2. Non-negotiable requirements

1. **Dark and light mode**
   - Three-state toggle: **System / Light / Dark**, default **System**.
   - Persist in `localStorage` (key `theme`). React to OS changes while in System mode.
   - **No flash of wrong theme:** an inline script in `index.html` sets `data-theme` on `<html>` before first paint.
   - Set the CSS `color-scheme` property. Code highlighting and all SVG visuals must switch themes too.
   - Contrast must meet **WCAG AA** in both modes.
2. **Fully responsive, mobile-first.** Must be comfortable at 360 px wide and up through large desktop. Details in Section 9. **No horizontal page scroll at any width.**
3. **Show the user's real C++ code, verbatim**, from the markdown files, with syntax highlighting and **current-line highlighting synced to the visualizer step**.
4. **No backend.** Pure static site (deploy on Vercel). Progress is stored in `localStorage`.
5. **Simple, readable code.** Prefer straightforward implementations over clever abstractions. Strict TypeScript. Deliver **complete, working files**, not snippets or "rest unchanged" placeholders.
6. **Icons:** Material Symbols (outlined), inline SVG, used sparingly for a clean, minimal look. Wrap them in one `<Icon name="..." />` component.
7. **Accessibility:** keyboard-operable player, visible focus rings, ARIA labels on icon buttons, `prefers-reduced-motion` respected (animations off/near-instant), and **never rely on colour alone** (pair colour with shape, label, or outline).

---

## 3. Tech stack (use exactly this unless something fails to install)

- **Vite + React 18+ + TypeScript (strict)**, **React Router** (BrowserRouter, with `vercel.json` SPA rewrite)
- **Tailwind CSS**, with **all colours defined as CSS variables (design tokens)**, never hard-coded hex inside components
- **Framer Motion** for animation (bars swapping, pointers sliding, nodes appearing)
- **Zustand** for player state (`stepIndex`, `isPlaying`, `speed`) and preferences
- **Shiki** for C++ highlighting (dual light/dark themes driven by CSS variables) with custom per-line highlighting
- **SVG rendered from React state** for all visuals (no canvas). Use `d3-hierarchy` only for tree layout math if needed.
- **Vitest** for unit tests. **Playwright** optional (smoke test only).
- **Fonts:** Inter (UI) and JetBrains Mono (code), self-hosted or via `@fontsource`.
- No UI kit dependency. Build the few components needed (Button, Tabs, Drawer, Toggle, Slider, Badge, Card).

---

## 4. Content ingestion (build-time)

Write `scripts/build-content.ts` (run with `tsx`, hooked into `predev` and `prebuild`) that reads `content/source/*.md` and emits:

- `src/generated/problems.json` — array of problems
- `src/generated/patterns.json` — the 8 patterns with their groups
- `content/build-report.txt` — anything it could not parse

**Problem fields:** `id` (slug, unique, e.g. `two-pointer/two-sum-ii`), `patternSlug`, `groupTitle`, `order`, `title`, `lcNumber?`, `sourceLabel` (`LeetCode` | `GfG`), `url`, `description`, `approach?`, `cpp` (code block text **verbatim**, no edits), `time?`, `space?`, `complexityRaw`.

**Heading formats differ between files.** Examples:
- `### 1. [167. Two Sum II …](url)` under `## Pattern 1: …`
- `## 1. Title` followed by `**LeetCode 643** — url`
- `### Title` followed by `**[LeetCode 704](url)**`
- `### 1. Title` followed by `**LeetCode:** [78. Subsets](url)`
- `### 1. Number of 1 Bits` with a `**Complexity:** Time …, Space …` line
- Graph uses groups `## A. …`, `## B. …`
- DP uses `### 1.1 Climbing Stairs`

Write a **tolerant parser** (heading level 2/3 detection, first fenced ```` ```cpp ```` block after a heading, first link in the following lines, first paragraph as the description, `**Approach:**` / intuition paragraph, `**Time:**` / `**Space:**` / `**Complexity:**` lines). Some notes say a problem is premium on LeetCode and give a GfG link instead; keep whichever link is given. The Binary Search file has a top-level block with **Template A and Template B**; store it as pattern-level `templates`, not as a problem.

Support `content/overrides.json` (per-problem-id field overrides) so parse failures can be fixed by hand. **Fail the build if the total is not 144 problems** (with a clear message listing per-pattern counts vs expected).

Also produce, per pattern, `signals`: rows of `{ signal, technique }` extracted from each file's "Quick Reference" / "Quick Recap" / "Pattern Summary" table (or hand-copied into `content/patterns/<slug>.json` if parsing is unreliable). These power the pattern page and the recognizer quiz.

**Do not copy full LeetCode statements.** Use only the short descriptions already in my notes, plus the link.

---

## 5. Core architecture: trace, renderer, player

Three layers. Keep them strictly separated.

**Layer 1: Trace generators (TypeScript).** Each visualized problem has a generator that **mirrors the C++ solution line by line** and `yield`s a `Step` at every meaningful moment. (The C++ is only *displayed*. It is never executed in the browser. That also makes custom input trivial later, with no WebAssembly compiler download.)

```ts
type Step = {
  line: number;                 // 1-based line inside the displayed C++ block
  event: EventKind;             // shared semantic vocabulary (below)
  state: RendererState;         // immutable snapshot that the renderer draws
  vars: Record<string, string | number | boolean | null>; // C++ variable names -> values, for the Variables panel
  note: string;                 // one short "why" caption, e.g. "sum < target, so move left right"
  counters?: Record<string, number>; // comparisons, swaps, steps...
  result?: unknown;             // only on the final step
};

type EventKind =
  | "init" | "compare" | "move-pointer" | "swap" | "write"
  | "expand" | "shrink" | "record" | "choose" | "explore" | "unchoose" | "prune"
  | "visit" | "enqueue" | "dequeue" | "relax" | "union"
  | "fill-cell" | "bit-op" | "found" | "done";
```

**No hard-coded line numbers.** Resolve lines by text: `line: L("sum == target")` where `L(needle, nth = 1)` searches the problem's `cpp` text and returns the 1-based line. It throws in dev/test if the needle is missing, so line mapping cannot silently drift.

**Trace module contract** (`src/traces/<pattern>/<problem-slug>.ts`, lazy-loaded):

```ts
export default {
  renderer: "array-pointers",          // which renderer draws it
  inputSchema: {...},                  // fields + validation + size limits for custom input
  defaultInput: {...},                 // the demo input shown first
  samples: [{ input, expected }],      // known-answer cases (from LeetCode examples)
  run: function* (input, L): Generator<Step> {...},
};
```

Safety: cap at **3,000 steps** per run, and cap custom-input sizes so the visual stays readable (e.g. arrays ≤ 16 elements, grids ≤ 8×8, graphs ≤ 10 nodes). Show a friendly message when a cap is hit.

**Layer 2: Renderers (Section 6).** Pure components: `(state, theme tokens) → SVG`.

**Layer 3: Player.** One shared component. Given `Step[]` it provides play/pause, step forward/back, jump to start/end, scrubber, speed (0.25×–4×), keyboard shortcuts (`Space` play/pause, `←/→` step, `Home/End`), and step counter "12 / 47". Because traces are precomputed arrays, **step-back and scrubbing are free**.

---

## 6. Renderers (build about 8, reuse everywhere)

| Renderer | Draws | Used by |
|---|---|---|
| `array-pointers` | Cells with index labels, named pointers (`left/right`, `slow/fast`, `lo/mid/hi`, `low/mid/high`), shaded window/range, swap/overwrite animations, optional output array and a small hash-map/frequency panel | Two Pointer, Sliding Window, Binary Search (indices and answer range), Merge Sorted Array, Dutch Flag |
| `linked-list` | Nodes and arrows, slow/fast pointers, cycle edge | Two Pointer (LL problems) |
| `interval-timeline` | Horizontal intervals on an axis, kept/removed/merged states, current sweep line | Greedy (intervals, arrows, meetings) |
| `recursion-tree` | Call tree growing and shrinking with `path` shown, choose/unchoose/prune markers, result list panel | Backtracking (Subsets, Combinations, Permutations, Parentheses...) |
| `grid-board` | Cell grid with per-cell state (visited, wall, queen, letter, digit, value) | Islands, Rotting Oranges, Word Search, N-Queens, Sudoku, grid DP, matrix search |
| `graph-view` | Nodes and edges (fixed or simple layout), visited/queue/stack/heap side panel, distance labels, union-find parent forest | BFS/DFS, topological sort, Dijkstra, union-find, Prim |
| `dp-table` | 1D/2D table with the current cell highlighted and arrows to the cells it depends on, plus the recurrence text | DP (LCS, Edit Distance, knapsack, coin change, climbing stairs...) |
| `bit-grid` | 32-bit (or 8-bit for readability) cells for one or more numbers, operators (`&`, `|`, `^`, `<<`, `>>`) animating, set/cleared bit highlights | Bit Manipulation |

Auxiliary panels that any renderer can embed: **stack**, **queue/deque**, **min/max heap**, **hash map**, **result list**.

---

## 7. Problem page layout

**Content of the page:** title, pattern and group badges, difficulty-free (not in my notes), link chip to LeetCode/GfG, description, approach, complexity badges (Time / Space).

**Desktop (≥ 1024 px):** two columns.
- **Left (about 60%):** Visualizer stage, then the player control bar, then the "why this step" caption.
- **Right (about 40%):** tabs **Code** (default), **Variables**, **Notes** (description, approach, complexity, link).
- Code panel: line numbers, current line highlighted with a left accent bar, auto-scroll to the active line, copy button.

**Problem list:** a collapsible sidebar (or dropdown) on the pattern page and inside the problem page, grouped by sub-pattern, with progress ticks.

**Not-yet-visualized problems** (see Section 12): show the same page with the Code and Notes tabs, and a clear "Visualization coming soon" state in the stage. Never hide or omit these problems.

---

## 8. Theming spec

- Tokens on `:root` (light) and `:root[data-theme="dark"]`:
  `--bg`, `--surface`, `--surface-2`, `--border`, `--text`, `--text-muted`, `--accent`, `--accent-contrast`, `--focus`
- Visualization tokens, each with light and dark values and colour-blind-safe hues:
  `--viz-idle`, `--viz-active`, `--viz-pointer-a`, `--viz-pointer-b`, `--viz-pointer-c`, `--viz-window`, `--viz-visited`, `--viz-success`, `--viz-danger`, `--viz-muted`
- Every state also gets a **non-colour cue** (outline style, icon, label, or pattern).
- Theme toggle: header icon button, using Material icons `light_mode`, `dark_mode`, and an "auto" icon. Cycles System, Light, Dark, with an accessible label announcing the current mode.
- Shiki: use a light and a dark theme, switched via CSS variables (no re-render flash).

Design direction: clean, minimal, generous spacing, subtle borders, rounded corners (8–12 px), restrained motion. The visualizer stage is the visual hero.

---

## 9. Responsive spec

Breakpoints: **< 640** mobile, **640–1023** tablet, **≥ 1024** desktop.

**Mobile (< 640 px):**
- Header: logo, search icon, theme toggle, and a menu button opening a **drawer** (patterns list).
- Problem page: stage **on top** (max height about 45vh, SVG scales via `viewBox`), then tabs (**Code | Vars | Notes**) beneath it.
- **Fixed bottom control bar** (respect `env(safe-area-inset-bottom)`): large Prev / Play-Pause / Next buttons (**min 44×44 px touch targets**), a scrubber above them, and speed in a small popover.
- Code panel scrolls inside its own container (`overflow-x: auto`); long lines must not widen the page.
- Optional: horizontal swipe on the stage steps forward/back.
- Grids, tables, and graphs must remain legible. If content is wider than the screen, scale to fit, and only allow inner pan for the DP table.

**Tablet:** stacked layout like mobile but with a two-column control bar, and the problem list in a drawer.

**Desktop:** as in Section 7, sticky stage while the right panel scrolls.

Landing and pattern pages: cards in a responsive grid (1 col mobile, 2 tablet, 4 desktop for the 8 patterns).

Test at 360, 390, 768, 1024, 1440 px, in both themes.

---

## 10. Routes and pages

- `/` **Home:** hero (one-line pitch), 8 pattern cards (name, one-line "use it when…", problem count, progress bar), a search box (Ctrl/Cmd+K opens search across all 144 problems).
- `/pattern/:patternSlug` **Pattern page:** intro, **"When to reach for it"** (signals table from Section 4), templates (Binary Search Template A/B), problems grouped by sub-pattern with a "visualized" badge, and progress.
- `/pattern/:patternSlug/:problemSlug` **Problem page** (Section 7). Deep-linkable state: `?step=12` and, for custom inputs, an encoded `input` param.
- `/progress` **Progress:** all problems with "understood" checkboxes and per-pattern completion (localStorage only).
- `*` friendly 404.

---

## 11. Features

**MVP (milestones 1–4):**
- Everything in Sections 2–10.
- **"Mark as understood"** toggle per problem (persisted).
- **Custom input** for every visualized problem, using `inputSchema` validation and caps, with a Reset-to-default button and clear error messages.
- Shareable URLs, keyboard shortcuts with a small help popover (`?` key).
- Live counters (steps, comparisons, swaps...) where meaningful.

**Phase 2 (milestone 5, after MVP is solid):**
- **Pattern recognizer quiz:** show a "signal" phrase or a problem description and ask which pattern or technique applies, built from the `signals` tables. Track score locally.
- **Predict-the-next-step mode:** pauses before revealing a step and asks a multiple-choice "what happens next?" derived from the event type.
- **Same template, different problem:** for Binary Search on the Answer, show Koko / Ship Packages / Split Array with only the feasibility function highlighted as different.
- **C++ pitfall callouts** on flagship problems (e.g. `long long` casts, `INT_MIN` guards, pass-by-reference), hand-written one-liners.
- **Optional verification tool** `tools/verify-cpp`: compile each problem's C++ with `g++` against its `samples` and cross-check against the TypeScript trace results (dev-only, not part of the site).
- Optional PWA (offline reading).

---

## 12. Scope: visualize the flagship problems first

Fully implement traces and visuals for these **41 flagship problems**. All other problems still ship with code, description, approach, complexity, link, and the "coming soon" stage.

| Pattern | Flagship problems (renderer) |
|---|---|
| Two Pointer | 167 Two Sum II, 11 Container With Most Water, 42 Trapping Rain Water, 75 Sort Colors, 141 Linked List Cycle (`array-pointers`, `linked-list`) |
| Sliding Window | 643 Max Average Subarray I, 3 Longest Substring Without Repeating Characters, 76 Minimum Window Substring, 239 Sliding Window Maximum (deque panel), 424 Longest Repeating Character Replacement (`array-pointers` + frequency panel) |
| Binary Search | 704 Binary Search, 33 Search in Rotated Sorted Array, 875 Koko Eating Bananas, Aggressive Cows (GfG), 74 Search a 2D Matrix (`array-pointers`, `grid-board`) |
| Backtracking | 78 Subsets, 46 Permutations, 39 Combination Sum, 22 Generate Parentheses (`recursion-tree`), 51 N-Queens, 79 Word Search (`grid-board`) |
| Greedy | 435 Non-overlapping Intervals, 56 Merge Intervals (`interval-timeline`), 55 Jump Game (`array-pointers`), 402 Remove K Digits (stack panel), 502 IPO (heap panel) |
| Bit Manipulation | 191 Number of 1 Bits, 136 Single Number, 260 Single Number III, 78 Subsets (bitmask), 371 Sum of Two Integers (`bit-grid`) |
| Graph | 200 Number of Islands (`grid-board`), 547 Number of Provinces (union-find), 207 Course Schedule (Kahn), 994 Rotting Oranges (`grid-board`), 743 Network Delay Time (Dijkstra) (`graph-view`) |
| DP | 70 Climbing Stairs, 198 House Robber, 322 Coin Change, 1143 Longest Common Subsequence, 72 Edit Distance (`dp-table`) |

Each flagship problem needs: a good default input (small and instructive), at least 2 `samples` with expected answers, and a one-line `note` on every step that explains **why**, not just what.

The visualization registry must make adding a new problem a **one-file job** (a trace module plus one registry line), so I can add the remaining ~100 later.

---

## 13. Folder structure

```
content/
  source/            # my 8 .md files (input, never edited by the build)
  patterns/          # optional hand-written signals per pattern
  overrides.json
scripts/
  build-content.ts
src/
  generated/         # problems.json, patterns.json (git-ignored or committed, your call)
  app/               # router, layout, providers, theme
  components/        # ui primitives, Header, Drawer, CodePanel, Player, VariablesPanel, ThemeToggle
  renderers/         # array-pointers, linked-list, interval-timeline, recursion-tree, grid-board, graph-view, dp-table, bit-grid, panels/
  traces/
    lib/             # L(), step helpers, caps, types
    two-pointer/ sliding-window/ binary-search/ backtracking/ greedy/ bit-manipulation/ graph/ dp/
    registry.ts
  pages/             # Home, Pattern, Problem, Progress, NotFound
  store/             # zustand stores (player, preferences, progress)
  styles/            # tokens.css, globals.css
tests/
vercel.json
README.md
```

---

## 14. Milestones (build in order; each must run with `npm run dev` and pass tests)

**M0 — Scaffold and content pipeline**
Vite + React + TS + Tailwind + tokens, theme system (System/Light/Dark, no flash), responsive shell (header, drawer, footer), `build-content.ts` producing all 144 problems (build fails if count is wrong), Home page with 8 pattern cards, Pattern page listing problems by group, static Problem page (code with Shiki, notes tab).
*Done when:* all 144 problems are browsable in both themes on a 360 px viewport with no horizontal scroll.

**M1 — Player and first renderer**
Trace types, `L()` helper, Player with keyboard support and scrubber, CodePanel with active-line highlighting, Variables panel, `array-pointers` renderer, and 3 problems: **167 Two Sum II, 11 Container With Most Water, 704 Binary Search**. Vitest for `L()` and each problem's `samples`.
Also create the project skill `add-visualization` (Section 0.3) once the Step type, `L()`, and the renderer contract exist.
*Done when:* stepping and scrubbing backward and forward is exact, the highlighted line always matches the step, and the `add-visualization` skill exists.

**M2 — Remaining renderers, one slice each**
`interval-timeline`, `recursion-tree`, `grid-board`, `graph-view`, `dp-table`, `bit-grid`, `linked-list`, plus stack/queue/heap/hash-map panels, each proven with 1–2 flagship problems.
*Done when:* each renderer has at least one working problem in both themes and on mobile.

**M3 — Complete the flagships**
All 41 flagship problems (build each one by following the `add-visualization` skill, and update the skill with any lessons learned), custom input with validation, shareable URLs, progress tracking, `/progress` page, search (Ctrl/Cmd+K).

**M4 — Polish and ship**
Mobile pass at 360/390/768, accessibility pass (keyboard, focus, ARIA, reduced motion, contrast; run the `web-design-guidelines` audit), performance pass (apply `vercel-react-best-practices`; lazy-load traces and Shiki, bundle budget < 250 KB gzip for the initial route), empty/error/404 states, README with "how to add a new problem visualization", deploy config for Vercel.

**M5 — Phase 2 features** (Section 11), only after M4 is accepted.

---

## 15. Quality bar and tests

- `npm run build` has **zero TypeScript errors and zero console errors/warnings** at runtime.
- **Vitest:** content parser (144 total with per-pattern counts), `L()` resolves every needle for every trace, every trace's `samples` produce the expected `result`, step-count caps work, Player reducer logic (next/prev/seek clamp).
- **Playwright smoke (optional):** Home → Pattern → Problem, toggle theme, step forward/back, mobile viewport.
- Lighthouse: **Accessibility ≥ 95**, Performance ≥ 90 on mobile emulation for the home and a problem route.
- Animations must never block interaction; if a step is skipped rapidly, the UI stays consistent.

---

## 16. How I want you to work

1. Start with **M0** only. After each milestone, output: what was built, how to run it, a short checklist I can verify by hand, and any assumptions you made.
2. Output **complete files** (no "…" or "rest of the file"), and keep the code simple and readable.
3. Do not ask clarifying questions unless something blocks you completely. Otherwise choose the sensible default, state it, and continue.
4. Do not change or "clean up" my C++ code. It is displayed verbatim.
5. If a heading or block in the markdown cannot be parsed, report it in `content/build-report.txt` and continue; never invent content.
6. Keep dependencies minimal. Justify any package that is not listed in Section 3.