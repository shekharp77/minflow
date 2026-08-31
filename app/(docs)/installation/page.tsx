import type { Metadata } from "next";
import { CopyLine } from "@/components/site/copy-line";

export const metadata: Metadata = {
  title: "Installation - minflow",
  description:
    "Install minflow: add the dependencies, generate the token layer, wire the theme script, then pull in components one at a time with the shadcn CLI.",
  alternates: { canonical: "/installation" },
};

const STEPS = [
  {
    title: "Install the dependencies",
    body: "Motion and auto-animate are not optional; every component's transitions run through them. Lucide supplies every glyph in the system, and the two variable fonts are the whole typographic budget.",
    command:
      "pnpm add motion @formkit/auto-animate lucide-react class-variance-authority tailwind-merge clsx",
  },
  {
    title: "Add the fonts",
    body: "Inter carries everything functional, Nunito is reserved for titles and focal numbers. Import both once in your root layout.",
    command: "pnpm add @fontsource-variable/inter @fontsource-variable/nunito",
  },
  {
    title: "Generate the token layer",
    body: "Every colour in the library is a token reference, never a raw value. Copy the token block into your global stylesheet before adding any component, or components will render against variables that do not exist yet.",
    command: "npx shadcn@latest add @minflow/tokens",
  },
  {
    title: "Add a component",
    body: "Components are pulled in one at a time and land in your own source tree, so you can edit them. Each component page lists the exact command for that component.",
    command: "npx shadcn@latest add @minflow/button",
  },
];

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
        Four steps, in order. The token layer has to exist before any component
        does, because every component styles itself entirely through it.
      </p>

      <section className="mt-24">
        <div className="flex flex-col gap-16">
          {STEPS.map((step, i) => (
            <section key={step.title}>
              <h2 className="flex items-baseline gap-3 text-section font-medium text-text">
                <span className="font-display text-body font-bold text-fg-2">
                  {i + 1}
                </span>
                {step.title}
              </h2>
              <p className="mt-2 max-w-[62ch] text-body text-text-2">
                {step.body}
              </p>
              <div className="mt-8">
                <CopyLine command={step.command} />
              </div>
            </section>
          ))}
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
