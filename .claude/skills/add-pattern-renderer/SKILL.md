---
name: Add Pattern Renderer
description: Project skill for adding a new visual renderer to the DSA Pattern Visualizer.
---

# Add Pattern Renderer Skill

Use this skill when creating a new visual layout (e.g., `recursion-tree`, `graph-view`, `dp-table`) for a class of problems.

## 1. Define the State Type
1. Open `src/traces/lib/types.ts`.
2. Define the specific state interface for the renderer (e.g., `export interface RecursionTreeState { renderer: 'recursion-tree'; nodes: ... }`).
3. Add this interface to the `RendererState` union type.

## 2. Create the Renderer Component
1. Create a new directory in `src/renderers/<name>/`.
2. Create `<Name>Renderer.tsx` exporting a component that takes `{ state: <Name>State }`.
3. Build the visualization using standard web technologies (SVG or HTML/CSS).
   - **Crucial**: Keep it completely responsive. Test how it renders at a 360px width. Use `overflow-x: auto` for large structures like wide trees or long DP tables.
   - Use CSS variables for all colors (e.g. `var(--viz-active)`, `var(--viz-visited)`).
   - Use non-color cues (strokes, labels, shapes) for accessibility.

## 3. Register the Renderer in Problem Page
1. Open `src/pages/Problem.tsx`.
2. Import your new renderer component.
3. In the `<div className="p-4 rounded-xl ...">` where the active renderer is displayed, add a conditional render block for your new renderer type:
   ```tsx
   {currentStep.state.renderer === '<name>' && (
     <YourNewRenderer state={currentStep.state} />
   )}
   ```

## 4. Prove It with a Flagship Trace
1. Find a flagship problem that needs this renderer.
2. Use the `add-visualization` skill to create the trace using your new renderer.
3. Ensure the steps map cleanly to the new state type.
4. Test thoroughly!
