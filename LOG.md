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

### Next: M1
- Trace types (`Step`, `EventKind`)
- `L()` helper (needle-based line resolver)
- Player component (play/pause, step, scrub, keyboard shortcuts)
- `array-pointers` renderer
- 3 problems: **167 Two Sum II**, **11 Container With Most Water**, **704 Binary Search**
- `add-visualization` project skill

---
