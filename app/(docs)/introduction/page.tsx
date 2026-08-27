import type { Metadata } from "next";
import Link from "next/link";
import { COMPONENTS } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Introduction - miniflow",
  description:
    "The rules behind miniflow: colour as hierarchy, whitespace instead of boxes, icons before words, and motion that is noticeable without being slow.",
  alternates: { canonical: "/introduction" },
};

const PRINCIPLES = [
  {
    title: "Colour is hierarchy, not decoration",
    body: "One accent-marked element per view, and it marks the single thing that matters most. Neutrals carry roughly ninety-five percent of every screen. Status colours mean status and nothing else, so a green tick always means done and never means decorative.",
  },
  {
    title: "Space is the container",
    body: "No cards, no panels, no bordered tables, no section backgrounds. Grouping is done with space and alignment the way print does it, and everything sits directly on the canvas. Elevation exists only for surfaces that come and go: popovers, dialogs, sheets.",
  },
  {
    title: "Icons before words",
    body: "Repeated and toolbar actions lose their labels and keep their meaning through a glyph, an accessible name, and a tooltip. Stripping the text never strips the message, and hit targets stay at forty pixels even when the glyph is sixteen.",
  },
  {
    title: "Inline over modal",
    body: "Objects are created where they will live. A ghost row becomes a draft asking only for a name and commits on Enter, with every other field fillable later, in place. There is no Create button anywhere in the system.",
  },
  {
    title: "Motion you notice but never wait on",
    body: "Every deliberate transition runs through motion.dev on one shared scale: fast feedback under pointer actions, slow and smooth for reveals and panels. Nothing bounces, nothing spins except loaders, and the whole system stills when a reader prefers reduced motion.",
  },
  {
    title: "Two fonts, and theming cannot touch them",
    body: "Inter carries everything functional; Nunito is reserved for titles and focal numbers. The palette is user-settable across five slots, and the compiler that applies it emits colour properties only, so changing your colours can never restyle your type.",
  },
];

export default function IntroductionPage() {
  return (
    <article className="max-w-[46rem]">
      <p className="text-caption font-medium uppercase tracking-[0.08em] text-text-2">
        Guide
      </p>
      <h1 className="mt-3 font-display text-display font-bold text-text">
        Introduction
      </h1>
      <p className="mt-4 max-w-[62ch] text-emphasis text-text-2">
        miniflow is a React component library built from scratch in a single
        minimalist design language. Every component here obeys the same handful
        of rules, which is what lets {COMPONENTS.length} of them sit on one page
        without the screen turning into noise.
      </p>

      <section className="mt-24">
        <h2 className="text-caption font-medium uppercase tracking-[0.08em] text-text-2">
          The rules
        </h2>
        <div className="mt-8 flex flex-col gap-12">
          {PRINCIPLES.map((p) => (
            <section key={p.title}>
              <h3 className="text-section font-medium text-text">{p.title}</h3>
              <p className="mt-2 max-w-[62ch] text-body text-text-2">{p.body}</p>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <h2 className="text-caption font-medium uppercase tracking-[0.08em] text-text-2">
          Next
        </h2>
        <p className="mt-4 max-w-[62ch] text-body text-text-2">
          Install the library, then browse the components. Every component page
          carries its own variations with guidance on which one to reach for.
        </p>
        <div className="mt-6 flex gap-6">
          <Link
            href="/installation"
            className="text-body font-medium text-accent outline-none transition-opacity duration-300 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Installation
          </Link>
          <Link
            href="/#components"
            className="text-body text-text-2 outline-none transition-colors duration-300 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            All components
          </Link>
        </div>
      </section>
    </article>
  );
}
