# DSA Pattern Visualizer

A production-quality static website that teaches **DSA interview patterns** through step-by-step visualizations of real C++ solutions.

**Live:** [Deploy on Vercel](#deploy)

---

## What is this?

Pattern-first, not algorithm-first:

```
Home (8 pattern cards) → Pattern page → Problem page (visualizer + C++ + explanation)
```

**8 patterns, 144 problems total:**

| Pattern | Problems |
|---|---|
| Two Pointer | 20 |
| Sliding Window | 14 |
| Binary Search | 20 |
| Backtracking | 16 |
| Greedy | 18 |
| Bit Manipulation | 16 |
| Graph | 20 |
| Dynamic Programming | 20 |

---

## Getting Started

```bash
npm install
npm run dev       # starts dev server (auto-runs content parser)
npm run build     # production build (auto-runs content parser)
npm run test      # Vitest tests
npm run preview   # preview production build
```

---

## Tech Stack

- **Vite + React 18 + TypeScript (strict)**
- **Tailwind CSS** — all colours as CSS variables (design tokens)
- **React Router** (BrowserRouter + Vercel SPA rewrite)
- **Shiki** — C++ syntax highlighting with dual light/dark themes
- **Zustand** — player state, preferences, progress
- **Framer Motion** — animations (M1+)
- **Vitest** — unit tests
- **Fonts:** Inter (UI), JetBrains Mono (code) via @fontsource

---

## Project Structure

```
content/
  source/            # 8 .md files (input, never edited by build)
  overrides.json     # per-problem field overrides for parser fixes
scripts/
  build-content.ts   # content parser → src/generated/*.json
src/
  generated/         # problems.json, patterns.json (auto-generated)
  app/               # Router, Providers
  components/        # Icon, Header, Drawer, Footer, ThemeToggle, CodePanel, Badge
  pages/             # Home, Pattern, Problem, Progress, NotFound
  store/             # themeStore, progressStore
  styles/            # tokens.css, globals.css
  traces/            # (M1+) trace generators per problem
  renderers/         # (M1+) 8 SVG renderers
tests/
  content-parser.test.ts
vercel.json
```

---

## Content Pipeline

`scripts/build-content.ts` reads the 8 source markdown files and emits:

- `src/generated/problems.json` — 144 problems with all fields
- `src/generated/patterns.json` — 8 patterns with groups and metadata
- `content/build-report.txt` — parse warnings

**Build fails** if the total is not exactly 144 problems.

To fix a parse error without editing source files, add an entry to `content/overrides.json`:

```json
{
  "two-pointer/some-problem": {
    "title": "Corrected Title",
    "url": "https://leetcode.com/problems/..."
  }
}
```

---

## Theming

Three-state toggle: **System / Light / Dark** (persists to `localStorage`).  
No flash of wrong theme — an inline script in `index.html` sets `data-theme` before first paint.

All colours are CSS variables on `:root` and `:root[data-theme="dark"]`. Never hard-code hex in components.

---

## How to Add a New Problem Visualization (M1+)

1. Find the problem in `src/generated/problems.json` — note its `id` and `cpp`
2. Create `src/traces/<pattern>/<slug>.ts` following the trace module contract
3. Register it in `src/traces/registry.ts` (one line)
4. Run `npm test` and `npm run build`

See the `add-visualization` skill (`.claude/skills/add-visualization/`) for the full procedure.

---

## Deploy

```bash
npm run build
# Deploy the dist/ folder to Vercel
```

`vercel.json` includes a SPA rewrite rule so all routes resolve to `index.html`.

---

## Milestones

- [x] **M0** — Scaffold, content pipeline, theme, shell, Home/Pattern/Problem pages (144 problems browsable)
- [ ] **M1** — Player, `array-pointers` renderer, first 3 visualized problems
- [ ] **M2** — All 8 renderers
- [ ] **M3** — All 41 flagship visualizations + custom input + search + progress
- [ ] **M4** — Polish, accessibility, performance, Vercel deploy
- [ ] **M5** — Quiz mode, predict-next-step, C++ pitfall callouts
