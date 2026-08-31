<div align="center">

# minflow

**A React component library built from scratch in one minimalist design language.**

[minflow.design](https://minflow.design) &middot; [Introduction](https://minflow.design/introduction) &middot; [Installation](https://minflow.design/installation)

[![CI](https://github.com/shekharp77/minflow/actions/workflows/ci.yml/badge.svg)](https://github.com/shekharp77/minflow/actions/workflows/ci.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

</div>

---

**min** is the restraint: no cards, no dividers, no section backgrounds, and colour
reserved for the single thing on a screen that matters. **flow** is the motion:
nothing appears by cutting, and every arrival runs on one shared scale so the
system moves like one thing rather than sixty-eight.

Sixty-eight components, one token layer, two fonts, and a set of rules that are
written down rather than implied.

## Install

Components are distributed through the [shadcn](https://ui.shadcn.com) registry.
They land in your own source tree as files you own and can edit, so there is no
version of this library you have to wait on anyone to change.

Point the CLI at the registry once, in your `components.json`:

```json
{
  "registries": {
    "@minflow": "https://minflow.design/r/{name}.json"
  }
}
```

Then add the token layer, and any component you want:

```bash
npx shadcn@latest add @minflow/tokens
npx shadcn@latest add @minflow/button
```

The token layer has to arrive first: every component styles itself entirely
through it, and dependencies come along automatically. Adding `@minflow/select`
brings `field`, `overlay`, `motion` and `utils` with it.

Every component page on the site lists the exact command for that component.

### Or install it as a dependency

If you would rather not own the files, the same components ship as a normal
package. This is the trade the registry route avoids: you get upgrades for
free, and you cannot edit a component without forking.

```bash
npm install @shekharsingh/minflow
```

```tsx
import "@shekharsingh/minflow/styles.css";
import { Button } from "@shekharsingh/minflow/button";
```

Import from the subpath rather than the package root where you can: every
component is its own entry point, so `@shekharsingh/minflow/button` cannot pull
in anything else. `react` and `react-dom` are peer dependencies.

## Use

```tsx
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export function Example() {
  return (
    <div className="flex items-center gap-2">
      <Select placeholder="Environment" options={["Preview", "Staging"]} />
      <Button accent>Deploy</Button>
    </div>
  );
}
```

## The rules

The full argument is on the [Introduction](https://minflow.design/introduction)
page. In short:

- **Colour is hierarchy, not decoration.** One accent-marked element per view.
- **Space is the container.** No cards, no dividers, no section backgrounds.
- **Icons before words** for repeated and toolbar actions, always with an
  accessible name and a tooltip.
- **Inline over modal.** Objects are created where they will live. There is no
  Create button anywhere in the system.
- **Motion you notice but never wait on**, on one shared scale, and the whole
  system stills under `prefers-reduced-motion`.
- **Two fonts, and theming cannot touch them.**

Every scale is audited rather than eyeballed: three radii, three icon sizes, six
type steps, a 4px spacing grid, and contrast measured in both themes.

## Develop

```bash
pnpm install
pnpm dev
```

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Run the documentation site at `localhost:3000`. |
| `pnpm typecheck` | `tsc --noEmit`. Must be clean. |
| `pnpm registry:build` | Regenerate `registry.json` and `public/r` from source. |
| `pnpm registry:validate` | Validate the registry against the shadcn schema. |
| `pnpm build` | Build the registry, then the site. |

### Layout

| Path | What lives there |
|------|------------------|
| `registry/minflow/ui/*` | The library. This is the source of truth. |
| `registry/minflow/lib/*` | The token and motion layer every component uses. |
| `components/ui/*`, `lib/*` | One-line re-export shims pointing at the registry. |
| `lib/catalog/*` | Docs data: plain TypeScript, no JSX, no `"use client"`. |
| `components/site/demos/*` | The live-demo registry. |
| `scripts/build-registry.mjs` | Generates the registry from source. |

The registry is **generated, never hand-edited**. Item titles come from
`lib/catalog`, dependencies come from each file's real imports, and the token
layer comes from `app/globals.css`. CI fails if the committed output has drifted.

## Contributing

Contributions are welcome, including the argument that one of the rules above is
wrong. See [CONTRIBUTING.md](CONTRIBUTING.md) for the component checklist and
what the review looks for. `CLAUDE.md` carries the working rules for changing
this codebase in more detail.

## Stack

Next.js, React, Tailwind CSS v4, [motion](https://motion.dev),
`@formkit/auto-animate`, and `lucide-react`. Inter for everything functional,
Nunito for titles and focal numbers.

## Licence

[Apache 2.0](LICENSE) &copy; [Shekhar Singh](https://www.linkedin.com/in/shekhar-singh-pundir/)
