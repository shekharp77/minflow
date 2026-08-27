@AGENTS.md

# miniflow

A React component library built in one minimalist design language, plus the
documentation site that presents it.

- `registry/miniflow/ui/*` is the library. This is the source of truth.
- `registry/miniflow/lib/*` is the token and motion layer every component uses.
- `components/ui/*` and `lib/*` are one-line re-export shims pointing at the
  registry. Never put real code in a shim.
- `lib/catalog/*` is the docs data: plain TypeScript, no JSX, no `"use client"`.
- `components/site/demos/*` is the live-demo registry, and the only client-side
  part of a component page.
- `app/(docs)/[slug]/page.tsx` renders every component page from that data.

## Adding a new component

Work through this in order. Steps 1 to 3 make the component exist; steps 4 to 6
make it discoverable. Skipping 4 to 6 produces a component nobody can find.

1. **Build it** at `registry/miniflow/ui/<name>.tsx`.
   - Colours are tokens only (`text-text-2`, `bg-bg-2`, `border-border`, and so
     on). A raw hex or a stock Tailwind palette colour is a defect.
   - Motion comes from `@/lib/motion`: `roll`, `enter`, `exit`, `morph`, `draw`,
     `panel`, `cascade`, `fadeRise`, `fadeScale`, `blurRise`. Never write an
     inline duration or easing array; if none of the tokens fit, add one there.
   - Icons are `lucide-react` at stroke width 1.75, sizes 16/20/24 only. This is
     lucide v1, so check the export exists (`LoaderCircle`, `CircleCheck`,
     `CircleX`, `TriangleAlert`, `Ellipsis`).
   - No boxes and no dividers. Grouping is whitespace and alignment.
   - Icon-only controls need `aria-label` plus a tooltip, and a 40px hit target.
2. **Add the shim** at `components/ui/<name>.tsx` if anything outside the
   registry imports it: `export * from "@/registry/miniflow/ui/<name>";`
3. **Typecheck**: `npx tsc --noEmit` must exit clean.
4. **Document it** in `lib/catalog/<category>.ts`, appending a `ComponentDoc`:
   - `slug` is always prefixed `minimilist-`, e.g. `minimilist-button`.
   - `summary` is one line; it becomes the grid card text and the page's meta
     description, so write it for a search result, not for a designer.
   - `whereToUse` gets 2 to 4 bullets, and at least one should say when NOT to
     reach for it, or which sibling to use instead.
   - `variants` need a stable `id`, a `title`, and a `when` explaining the
     choice between siblings.
5. **Add the demos** in `components/site/demos/<category>.tsx`, keyed by slug
   and then by the variant `id` from step 4. The keys must match exactly; a
   mismatch renders a visible "No demo registered" note rather than failing
   quietly. Anything that takes over the viewport (dialog, sheet, lightbox,
   fullscreen loader) goes behind a button labelled "Click to see in action".
6. **Register both files** in `lib/catalog/index.ts` and
   `components/site/demos/index.tsx`. A new category also needs an entry in
   `CATEGORIES` in `lib/catalog/types.ts`, which sets the order used by both the
   sidebar and the homepage grid.

Then verify in the browser: the component appears on the homepage grid and in
the docs sidebar, `/minimilist-<name>` renders every variant, and the prose is
present in `curl -s localhost:3000/minimilist-<name>` with no JavaScript.

## Things that are easy to get wrong here

- **Do not animate a property that a CSS class also controls.** Motion writes
  inline styles, which beat classes. A `variants` entry that animates opacity
  will silently defeat an `opacity-0` Tailwind class on the same element.
- **Do not focus an element on a timer** after an `AnimatePresence mode="wait"`
  transition. The new element does not mount until the old one finishes
  exiting; use `autoFocus` or a ref callback.
- **The palette must never touch typography.** `lib/palette.ts` emits colour
  properties only, and it stays that way. Fonts are set in `globals.css` and in
  the root layout, where theming cannot reach them.
- **Persisted UI state must be restored somewhere that always runs.** The theme
  script in `lib/theme.tsx` does it before hydration; a `useEffect` inside a
  component that lives in a popover only runs when that popover is opened.
- **Menus near a left edge need `align="start"`.** `align="end"` anchors the
  panel's right edge to the trigger, which pushes a wide panel off-screen.
