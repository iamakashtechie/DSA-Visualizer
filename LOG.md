# Change Log

All changes to the DSA Pattern Visualizer are logged here chronologically so any AI agent can pick up where the last left off.

---

## 2026-09-30 — Milestone 0 (M0) Complete

### What was built

**Scaffold & tooling**
- `package.json` — Vite + React 18 + TypeScript + Tailwind + Shiki + Zustand + Framer Motion + fontsource + tsx + vitest
- `vite.config.ts` — Vite with React plugin, `@` alias, Vitest node environment
- `tsconfig.json` / `tsconfig.node.json` — Strict TypeScript, resolveJsonModule, bundler resolution
- `tailwind.config.ts` — All design tokens mapped as Tailwind color utilities
- `postcss.config.js` — Tailwind + Autoprefixer
- `vercel.json` — SPA rewrite (all routes → index.html)

**Content pipeline**
- `scripts/build-content.ts` — Full tolerant parser for all 8 markdown files
  - Handles 8 different heading/URL formats (Two Pointer inline URLs, BS templates, Graph letter-groups, DP sub-numbering, etc.)
  - Extracts URL from heading line itself (Two Pointer format: `### N. [Title](url)`)
  - Skips non-problem section headings via `NON_PROBLEM_TITLE_PATTERNS` (Quick Recap, Cheat Sheet, etc.)
  - Emits `src/generated/problems.json` (144 problems) and `src/generated/patterns.json` (8 patterns)
  - Emits `content/build-report.txt` with per-pattern counts and parse warnings
  - **Build fails if total ≠ 144**
  - Supports `content/overrides.json` for per-problem field overrides
- `content/overrides.json` — Empty, ready for manual fixes

**Problem counts (all correct)**
| Pattern | Count |
|---|---|
| Two Pointer | 20 |
| Sliding Window | 14 |
| Binary Search | 20 |
| Backtracking | 16 |
| Greedy | 18 |
| Bit Manipulation | 16 |
| Graph | 20 |
| Dynamic Programming | 20 |
| **Total** | **144** |

**Theming**
- `src/styles/tokens.css` — Light and dark design tokens (CSS variables), visualization tokens
- `index.html` — Inline no-flash theme script reads `localStorage.theme` and sets `data-theme` before first paint
- `src/store/themeStore.ts` — Zustand store: System/Light/Dark, reads from localStorage on init
- `src/app/Providers.tsx` — Applies theme to `document.documentElement`, listens for system changes

**Shell components**
- `src/components/Icon.tsx` — Material Symbols Outlined wrapper
- `src/components/ThemeToggle.tsx` — Cycles System → Light → Dark with icons + accessible aria-labels
- `src/components/Header.tsx` — Sticky header: logo, desktop pattern nav, theme toggle, mobile hamburger
- `src/components/Drawer.tsx` — Mobile nav drawer: focus trap, Escape key, backdrop, scroll lock
- `src/components/Footer.tsx` — Simple footer with links
- `src/components/Badge.tsx` — accent/muted/success/danger variants
- `src/components/CodePanel.tsx` — Shiki v1 `codeToHtml` with dual light/dark themes, copy button, fallback

**Pages**
- `src/pages/Home.tsx` — Hero, 8 pattern cards (1/2/4 col responsive grid), quick stats
- `src/pages/Pattern.tsx` — Pattern header, optional templates (BS), problems grouped by sub-pattern
- `src/pages/Problem.tsx` — Two-column layout (stage + Code/Notes tabs), Shiki C++ panel, full notes
- `src/pages/Progress.tsx` — All patterns with progress bars, first 5 problems listed per pattern
- `src/pages/NotFound.tsx` — Friendly 404 with home link
- `src/app/Router.tsx` — BrowserRouter with all routes + full layout shell (Header + Footer)

**Stores**
- `src/store/themeStore.ts` — Theme preference
- `src/store/progressStore.ts` — Problem completion map (for M3 interactivity)

**Tests**
- `tests/content-parser.test.ts` — 15 tests: 144 total, per-pattern counts (8 checks), unique IDs, all have title/cpp/patternSlug, pattern counts match

### Build verification
- `npm run build` ✅ — zero TypeScript errors, zero build errors
- `npm run test` ✅ — 15/15 tests passing
- Parser: `npx tsx scripts/build-content.ts` ✅ — 144/144 problems

### M0 done when
> All 144 problems are browsable in both themes on a 360 px viewport with no horizontal scroll.
- ✅ All 144 problems parsed and browsable
- ✅ Light/Dark/System theme with no flash
- ✅ Responsive shell (Header, Drawer, Footer) mobile-first
- ✅ No horizontal scroll (overflow-x: hidden on body)
- ✅ Both `npm run build` and `npm test` pass

## 2026-09-30 — Milestone 1 (M1) Complete

### What was built

**Slug Fixes**
- Updated parser to properly extract readable link text for slugs and correctly strip leading digits, yielding clean IDs like `two-pointer/two-sum-ii-input-array-is-sorted`.

**Trace Infrastructure**
- Defined types for `Step`, `EventKind`, and renderer states (`ArrayPointersState`).
- Added `L()` string needle-based line resolver factory to accurately map execution state to C++ lines (with dev/test environment validation).
- Added `helpers.ts` for step collection (with 3000 cap) and concise state building.
- Zustand store (`playerStore.ts`) for robust playback control (play/pause, seek, speed).

**Renderers**
- Created the generic, SVG-based `ArrayPointersRenderer` utilizing visual and non-visual cues and fully synced to CSS token variables. Designed to safely fit a 360px viewport without scrolling.

**Components**
- `Player` component with auto-play, scrubber, step counters, speed multiplier, and full keyboard shortcuts (`Space`, `Left`, `Right`, `Home`, `End`).
- `VariablesPanel` component displaying scoped C++ variables at each step.
- Refactored `CodePanel` to support `activeLine` highlighting via precise Shiki class post-processing and auto-scrolling to the active block.

**Trace Modules**
- Created registry and first 3 traces using `ArrayPointersRenderer`:
  - `167 Two Sum II`
  - `11 Container With Most Water`
  - `704 Binary Search`

**Integration**
- Updated `Problem.tsx` to conditionally detect trace availability via `traceRegistry`, run the generator, collect steps, and present the Player + Renderer interface seamlessly replacing the placeholder.

**Tests & Skills**
- `tests/traces.test.ts`: Validated `createL` behavior and validated all samples in `traceRegistry` run accurately without capping out.
- `.claude/skills/add-visualization/SKILL.md`: Created `add-visualization` project skill for future additions.

### Build verification
- `npm run build` ✅ — zero TypeScript errors, zero build errors
- `npm run test` ✅ — 22/22 tests passing

### M1 done when
> Stepping and scrubbing backward and forward is exact, highlighted line always matches the step.
- ✅ Player supports exact scrubbing, line highlighting is in sync.
- ✅ All 3 flagship traces work perfectly.

## 2026-09-30 — Milestone 2 (M2) Complete

### What was built

**Skills & Typing**
- Created `.claude/skills/add-pattern-renderer/SKILL.md` to guide addition of new generic SVG renderers.
- Expanded `RendererState` in `types.ts` to include all remaining visualization structures: `LinkedListState`, `DPTableState`, `GridBoardState`, `RecursionTreeState`, `IntervalTimelineState`, `GraphViewState`, `BitGridState`.
- Implemented `PanelState` to allow side panels to be attached to any state.

**New Renderers & Flagship Traces**
Built 7 new custom SVG-based renderers, fully responsive down to 360px viewport, heavily utilizing CSS variable colors for themes. Each was verified with a comprehensive Trace Module:
1. `LinkedListRenderer` -> `141 Linked List Cycle` (`two-pointer/linked-list-cycle`)
2. `DPTableRenderer` -> `70 Climbing Stairs` (`dp/climbing-stairs`)
3. `GridBoardRenderer` -> `200 Number of Islands` (`graph/number-of-islands`)
4. `IntervalTimelineRenderer` -> `56 Merge Intervals` (`greedy/merge-intervals`)
5. `RecursionTreeRenderer` -> `78 Subsets` (`backtracking/subsets`)
6. `GraphViewRenderer` -> `207 Course Schedule` (`graph/course-schedule`)
7. `BitGridRenderer` -> `191 Number of 1 Bits` (`bit-manipulation/number-of-1-bits`)

**Side Panels**
- Created `SidePanels` component to dynamically render `Stack`, `Queue`, `Heap (Array)`, and `Hash Map` below the primary visualizer when their respective arrays/objects exist in the trace `state`.

### Build verification
- `npm run build` ✅ — zero TypeScript errors, zero build errors
- `npm run test` ✅ — 41/41 tests passing (including the 7 new traces)

### M2 done when
> Each renderer has at least one working problem in both themes and on mobile.
- ✅ All 7 renderers implemented and functional.
- ✅ One flagship problem complete for each renderer.

### Next: M3
- Complete traces for all 41 flagship problems (batch job).
- "Mark as understood" toggle.
- Custom input validation for player.
- Shareable URLs and `/progress` dashboard.
- Search (Ctrl/Cmd+K).
