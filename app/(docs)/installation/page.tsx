import type { Metadata } from "next";
import { CopyLine } from "@/components/site/copy-line";
import { CopyBlock } from "@/components/site/copy-block";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Installation - minflow",
  description:
    "Install minflow: point the shadcn CLI at the registry, add the token layer, then pull in components one at a time. Every component lands in your own source tree as a file you own.",
  alternates: { canonical: "/installation" },
};

/*
 * Step 1 is the one that is easy to leave out and fatal to leave out: the
 * `@minflow` namespace is resolved from the reader's OWN components.json, not
 * from anything in the command, so without it every `add` fails with "Add the
 * registry configuration under registries".
 */
const REGISTRY_CONFIG = `{
  "registries": {
    "@minflow": "${SITE_URL}/r/{name}.json"
  }
}`;

const FONT_IMPORT = `import "@fontsource-variable/inter";
import "@fontsource-variable/nunito";`;

export default function InstallationPage() {
  return (
    <article className="max-w-[46rem]">
      <p className="text-caption font-medium uppercase tracking-[0.08em] text-text-2">
        Guide
      </p>
      <h1 className="mt-3 font-display text-display font-bold text-text">
        Installation
      </h1>
      <p className="mt-4 max-w-[62ch] text-emphasis text-text-2">
        Components are distributed through the shadcn registry and land in your
        own source tree as files you own and can edit. Five steps, in order. The
        registry has to be registered before the CLI can resolve anything, and
        the token layer has to exist before any component does.
      </p>

      <section className="mt-24">
        <div className="flex flex-col gap-16">
          <section>
            <h2 className="flex items-baseline gap-3 text-section font-medium text-text">
              <span className="font-display text-body font-bold text-fg-2">1</span>
              Set up shadcn, if you have not already
            </h2>
            <p className="mt-2 max-w-[62ch] text-body text-text-2">
              This creates the <code className="font-mono">components.json</code>{" "}
              that the next step edits, and the path aliases every component
              imports through. Skip it if your project already has one.
            </p>
            <div className="mt-8">
              <CopyLine command="npx shadcn@latest init" />
            </div>
          </section>

          <section>
            <h2 className="flex items-baseline gap-3 text-section font-medium text-text">
              <span className="font-display text-body font-bold text-fg-2">2</span>
              Point the CLI at the registry
            </h2>
            <p className="mt-2 max-w-[62ch] text-body text-text-2">
              Add this to your{" "}
              <code className="font-mono">components.json</code>. The{" "}
              <code className="font-mono">@minflow</code> namespace is resolved
              from your own configuration rather than from the command, so
              without this entry every install fails with a message about a
              missing registry.
            </p>
            <div className="mt-8">
              <CopyBlock code={REGISTRY_CONFIG} label="Copy configuration" />
            </div>
          </section>

          <section>
            <h2 className="flex items-baseline gap-3 text-section font-medium text-text">
              <span className="font-display text-body font-bold text-fg-2">3</span>
              Add the token layer
            </h2>
            <p className="mt-2 max-w-[62ch] text-body text-text-2">
              Every colour, size, radius and duration in the library is a token
              reference, never a raw value, so this has to arrive before any
              component or they render against variables that do not exist. It
              merges the tokens into your stylesheet and installs the runtime
              dependencies for you: motion, auto-animate, lucide, and the class
              utilities.
            </p>
            <div className="mt-8">
              <CopyLine command="npx shadcn@latest add @minflow/tokens" />
            </div>
          </section>

          <section>
            <h2 className="flex items-baseline gap-3 text-section font-medium text-text">
              <span className="font-display text-body font-bold text-fg-2">4</span>
              Add the fonts
            </h2>
            <p className="mt-2 max-w-[62ch] text-body text-text-2">
              Inter carries everything functional, Nunito is reserved for titles
              and focal numbers. They are the whole typographic budget. Install
              both, then import them once in your root layout.
            </p>
            <div className="mt-8">
              <CopyLine command="pnpm add @fontsource-variable/inter @fontsource-variable/nunito" />
            </div>
            <div className="mt-6">
              <CopyBlock code={FONT_IMPORT} label="Copy imports" />
            </div>
          </section>

          <section>
            <h2 className="flex items-baseline gap-3 text-section font-medium text-text">
              <span className="font-display text-body font-bold text-fg-2">5</span>
              Add a component
            </h2>
            <p className="mt-2 max-w-[62ch] text-body text-text-2">
              Components are pulled in one at a time, and anything a component
              depends on comes with it. Each component page lists the exact
              command for that component.
            </p>
            <div className="mt-8">
              <CopyLine command="npx shadcn@latest add @minflow/button" />
            </div>
          </section>
        </div>
      </section>

      <section className="mt-24">
        <h2 className="text-caption font-medium uppercase tracking-[0.08em] text-text-2">
          Theme setup
        </h2>
        <p className="mt-4 max-w-[62ch] text-body text-text-2">
          Render the theme script in your root layout, before anything else in
          the body. It restores the reader&apos;s light or dark choice, their
          reduced-motion setting, and any custom palette before first paint, so
          the page never flashes the wrong theme on load.
        </p>
      </section>
    </article>
  );
}
