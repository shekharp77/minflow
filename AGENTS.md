# minflow

Important - This is an opensource project so make sure of code quality

A React component library built in one minimalist design language, plus the
documentation site that presents it.

- `registry/minflow/ui/*` is the library. This is the source of truth.
- `registry/minflow/lib/*` is the token and motion layer every component uses.
- `components/ui/*` and `lib/*` are one-line re-export shims pointing at the
  registry. Never put real code in a shim.
- `lib/catalog/*` is the docs data: plain TypeScript, no JSX, no `"use client"`.
- `components/site/demos/*` is the live-demo registry, and the only client-side
  part of a component page.
- `app/(docs)/[slug]/page.tsx` renders every component page from that data.

## Adding a new component

Work through this in order. Steps 1 to 3 make the component exist; steps 4 to 6
make it discoverable. Skipping 4 to 6 produces a component nobody can find.

1. **Build it** at `registry/minflow/ui/<name>.tsx`.
   - Colours are tokens only (`text-text-2`, `bg-bg-2`, `border-border`, and so
     on). A raw hex or a stock Tailwind palette colour is a defect.
   - Motion comes from `@/lib/motion`. Tweens: `roll`, `enter`, `enterFocal`,
     `exit`, `morph`, `draw`. Variants: `panel`, `cascade`, `fadeRise`,
     `fadeScale`, `fadeSlide`, `blurRise`, `reveal`, `halo`. Springs, for
     anything the hand is touching: `spring`, `springSnap`, `springDrag`.
     Never write an inline duration or easing array; if none of the tokens fit,
     add one there.
   - Interface motion lives in 140-360ms (`press` / `micro` / `view` / `focal`).
     `bloom` (0.8s) is for decorative one-shots only, never a transition the
     reader is waiting on. Exits are always faster than entrances: put the
     `exit` token *inside* the exit variant, because a bare `transition` prop
     is inherited by the exit and will drag it out to the entry duration.
   - Anything pressable gets `whileTap={{ scale: pressScale }}` (or
     `pressScaleSmall` for icon-sized targets), never a hand-picked number.
   - Hover motion that moves, lifts, or grows must be gated on
     `useHoverCapable()`: touch synthesises a hover on tap that never leaves.
   - Icons are `lucide-react` at stroke width 1.75, sizes 16/20/24 only. This is
     lucide v1, so check the export exists (`LoaderCircle`, `CircleCheck`,
     `CircleX`, `TriangleAlert`, `Ellipsis`).
   - No boxes and no dividers. Grouping is whitespace and alignment.
   - Icon-only controls need `aria-label` plus a tooltip, and a 40px hit target.
2. **Add the shim** at `components/ui/<name>.tsx` if anything outside the
   registry imports it: `export * from "@/registry/minflow/ui/<name>";`
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

7. **Regenerate the registry**: `pnpm registry:build`. This rewrites
   `registry.json` and `public/r/*.json` from source, so the component becomes
   installable as `@minflow/<name>`. It derives titles from `lib/catalog`, npm
   and registry dependencies from the file's real imports, and the token layer
   from `app/globals.css`, which is why it must run *after* steps 4 to 6. CI
   fails the build if the committed output has drifted from source.

Then verify in the browser: the component appears on the homepage grid and in
the docs sidebar, `/minimilist-<name>` renders every variant, and the prose is
present in `curl -s localhost:3000/minimilist-<name>` with no JavaScript.

## Commits

Never put Claude's name on a commit in this repository. No `Co-Authored-By:
Claude` trailer, no "Generated with Claude Code" line, and never Claude in the
author or committer field. Commits and PR bodies are attributed to the
repository owner alone. This is a public open-source history going out under a
real person's name, and it stays that way.

## The scales (audited; do not invent a value outside them)

Every number below is measured and enforced. If none fits, add a token to the
scale and say why in the same commit; never write a one-off literal.

- **Radius**: `rounded-control` (6px), `rounded-overlay` (10px), `rounded-full`.
  Three, and that is the list. They are concentric on purpose: a control inside
  an overlay padded `p-1` is 10 - 4 = 6, so `control` inside `overlay` lines up
  around the corner. The device mock-up's `rounded-[2rem]` family is the one
  exception, because a phone bezel is a depicted object rather than UI chrome.
- **Icons**: 16 / 20 / 24 only, and nothing else — 14 is not on the 4px grid.
  A *shape* is not an icon: a slider thumb, a checkbox tick, a matrix dot may be
  any size, because they are the control, not a glyph inside it.
- **Control height**: `--size-chip` 24, `--size-control-sm/md/lg` 28/32/36,
  `--size-touch` 40, `--size-fab` 48. `sm/md/lg` mean the same three numbers for
  a button as for an input, which is what lets them share a row.
- **Spacing**: the 4px grid, with 2px half-steps (`p-1.5`, `gap-2.5`) allowed for
  dense inline chrome only. `gap-2` is the default rhythm.
- **Type**: 6 steps, `caption` 12 / `body` 13 / `emphasis` 14 / `section` 16 /
  `title` 20 / `display` 24. The ratio is intentionally not constant — ~1.08x
  across the dense range so UI text differentiates without breaking the line
  grid, 1.25x/1.2x across headings so they differentiate by leaping.
- **Layers**: name the rung (`z-anchored`, `z-overlay`, `z-toast`, …), never a
  number. Anchored layers sit *above* dialogs, because a select opened inside a
  dialog must open over it.
- **Motion**: every duration and curve from `@/lib/motion`. `durations.ambient`
  is the only one measured in seconds and is for scenery loops only.

## Contrast: which token to reach for

Measured in both themes with a canvas probe; the numbers are in
`.harness/findings.md` (F43 to F46).

- `border` (1.24:1) and `border-strong` (1.48:1) are **decoration** — separators,
  panel rings, hairlines beside a visible label. WCAG 1.4.11 does not apply to
  them and they are deliberately quiet.
- `control-edge` (>= 3.2:1 both themes) is for a boundary that is a control's
  **only** identity: an unchecked checkbox or radio, a switch track, a list
  field that is transparent inside. Reach for this one whenever removing the
  border would leave nothing that says "this is a control".
- `fg-2` is the icon colour and clears 3:1 on all three surfaces. `text-2`
  clears 4.5:1. Check any new colour against `stage`, not against `bg` — `stage`
  is the darkest of the three and is where every previous failure hid.
- Targets are 24x24 minimum (WCAG 2.2 SC 2.5.8). A control that *paints* smaller
  keeps its look and adds `.hit-target`, which grows the catch area only.

## Overlays must never position themselves in flow

A menu, select panel, popover or submenu is anchored to a control but does not
belong to it. Use `useAnchoredPosition` from `@/components/ui/overlay` inside a
`Portal`. Positioning one with `absolute` inside the trigger's own box makes
every ancestor a potential guillotine — one `overflow: hidden` anywhere up the
tree silently crops it, which is exactly the bug that ate two thirds of the
select's options. Two things to remember when you do:

- Add the panel's ref to `useDismiss`, or a click *inside* the portalled panel
  counts as "outside" and closes it under the reader's own pointer.
- If the layer opens on hover, put the hover handlers on the portalled panel
  too: the pointer crossing from trigger to panel now fires `pointerleave`.

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
