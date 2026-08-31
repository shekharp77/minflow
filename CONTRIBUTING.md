# Contributing to minflow

Thanks for being here. This library is opinionated on purpose, so the most
useful thing to know before you start is which decisions are settled and which
are open.

## What is welcome

- **Bug fixes**, especially accessibility, keyboard handling, and anything that
  breaks in one theme but not the other.
- **New components**, if they earn a place. The scope came from the
  [NN/g elements glossary](https://www.nngroup.com/articles/ui-elements-glossary/);
  a component that is not a distinct interface element is usually a variant of
  one that already exists.
- **Arguments that a rule is wrong.** The design rules are written down so they
  can be disagreed with on the merits. Open an issue and make the case.

## What will be sent back

- Raw colour values. Every colour is a token; a hex or a stock Tailwind palette
  colour is a defect.
- Hand-picked durations and easing arrays. Motion comes from `@/lib/motion` by
  name. If no token fits, add one there and say why.
- Boxes and dividers. Grouping is whitespace and alignment.
- Values invented outside the audited scales. Three radii, icon sizes 16/20/24,
  the named control-height ramp, six type steps, the 4px grid. If none fits, add
  to the scale in the same change and explain it.
- Icon-only controls without an `aria-label`, a tooltip, and a 24px minimum
  target.

`CLAUDE.md` documents all of this in full, including the traps that have already
cost someone a day: overlays positioning themselves in flow, animating a property
a CSS class also controls, and focusing an element on a timer.

## Adding a component

The ordered checklist lives in `CLAUDE.md` under **Adding a new component**.
Steps 1 to 3 make the component exist; steps 4 to 7 make it discoverable and
installable. Skipping the later steps produces a component nobody can find.

Briefly:

1. Build it at `registry/minflow/ui/<name>.tsx`.
2. Add the shim at `components/ui/<name>.tsx` if anything outside the registry
   imports it.
3. `pnpm typecheck` must be clean.
4. Document it in `lib/catalog/<category>.ts`.
5. Add the demos in `components/site/demos/<category>.tsx`.
6. Register both files in the two index files.
7. `pnpm registry:build`, and commit the regenerated `registry.json` and
   `public/r`.

## Before you open a pull request

```bash
pnpm typecheck
pnpm registry:build   # then commit the result if anything changed
pnpm build
```

CI runs all of these, validates the registry against the shadcn schema, and then
performs a **real `shadcn add` into a scratch project** to prove the component is
genuinely installable and that its imports resolve for a consumer. Schema
validity alone does not catch a broken namespace or a missing dependency; that
step does.

Then check it in a browser: the component appears on the homepage grid and in the
docs sidebar, `/minimilist-<name>` renders every variant, and the prose is in the
served HTML with JavaScript disabled. Check both themes, and check it at 390px.

## Commits

Write commit messages in the imperative, explaining why rather than what. Keep
the subject under about seventy characters.

## Licence

By contributing, you agree that your contributions will be licensed under the
[Apache Licence 2.0](LICENSE).
