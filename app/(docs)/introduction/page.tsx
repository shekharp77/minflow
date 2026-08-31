import type { Metadata } from "next";
import Link from "next/link";
import { COMPONENTS } from "@/lib/catalog";
import { REPO_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Introduction - minflow",
  description:
    "Why minflow exists, how it was built, and what it borrows. A minimalist React component library by Shekhar Singh: colour as hierarchy, whitespace instead of boxes, and motion on one shared scale.",
  alternates: { canonical: "/introduction" },
};

/*
 * Three movements, in this order: why the thing exists (the story, first
 * person and signed), how it is actually built, and what it is honest about
 * taking from. The rules follow, because a reader who has just been told the
 * taste is ready to read the law. Server-rendered in full -- the prose is the
 * SEO surface, so none of it may hide behind a client boundary.
 */

const CONSTRUCTION = [
  {
    title: "A token layer, before a single component",
    body: "Every colour, size, radius, and duration in the library is a named token, and components reference them only. Not one component contains a hex value or a stock palette colour, which is a measured claim rather than an aspiration. It is what lets a reader repaint the entire system from five slots without a single component knowing it happened.",
  },
  {
    title: "Motion is a vocabulary, not a number",
    body: "There are no hand-picked durations anywhere. A transition names what it is, and the name decides how long it takes: a press is quick because it is feedback, a panel is slow because it is a place. Exits always run faster than entrances, because waiting to leave feels like a bug. When a reader asks for reduced motion the whole system stills, including the parts the operating system alone would not have reached.",
  },
  {
    title: "Every scale is audited, not eyeballed",
    body: "Three radii, three icon sizes, six type steps, one 4px spacing grid, a named ladder for stacking order. Anything off the scale is either pulled onto it or written down as an exception with a reason. Contrast was not trusted to the stylesheet either: the numbers came from painting each pair onto a canvas and reading the pixels back, in both themes.",
  },
  {
    title: "You get source, not a dependency",
    body: "Components are pulled in one at a time through the shadcn registry and land in your own tree as files you own and can edit. There is no version of this library that you have to wait on me to change. The token layer is the only thing that has to arrive first, because everything else styles itself entirely through it.",
  },
  {
    title: "Nothing counted as done until it was watched",
    body: "Each component was driven through a real browser with real clicks, real typing and real scrolling, then screenshotted in the state it claimed to reach, in both themes and at three widths. It was built the way I work now, in a tight loop with an AI pair, which only holds up because almost nothing here is a matter of opinion by the time it ships. A value is on the scale or it is not. A pair clears 4.5:1 or it does not.",
  },
];

const BORROWED = [
  {
    title: "Swiss typography, for the grouping",
    body: "The decision to have no cards, no dividers, and no section backgrounds is not a minimalist affectation. It is how print has always grouped things: with space, alignment, and type weight. A rule drawn around a group is an admission that the spacing underneath it failed.",
  },
  {
    title: "Linear, for inline over modal",
    body: "The idea that an object should be created exactly where it will live, starting as a ghost row that asks only for a name. Everything else gets filled in later, in place. There is no Create button anywhere in this system, and that is the reason why.",
  },
  {
    title: "Apple, for the physics",
    body: "Motion that behaves like a material rather than a timeline: interruptible, spring-driven under the hand, and spatially consistent so a thing that opened from a corner closes back into it. The stacked-card pattern, where older items tuck behind the newest and fan out on a tap, is lifted from iOS almost unchanged.",
  },
  {
    title: "The NN/g elements glossary, for the scope",
    body: "It was used as the checklist of what a complete interface library actually owes you, rather than shipping the fifteen components everyone ships and calling it a system. That is how the count reached the number it did, and why some of the stranger entries exist at all: the wheel picker, the pie menu, the 2D matrix pad.",
  },
];

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
        minflow is a React component library built from scratch in a single
        minimalist design language. <span className="text-text">min</span> is
        the restraint and <span className="text-text">flow</span> is the motion,
        and the whole point is that those two are the same decision made twice.
        Every one of the {COMPONENTS.length} components here obeys the same
        handful of rules, which is what lets them sit together without the
        screen turning into noise.
      </p>

      <section className="mt-24">
        <h2 className="text-caption font-medium uppercase tracking-[0.08em] text-text-2">
          Why it exists
        </h2>

        <div className="mt-8 flex max-w-[62ch] flex-col gap-6 text-body text-text-2">
          <p>
            I have never been able to leave an interface alone. I will use
            something for a week, and by the end of it I am not looking at the
            screen any more, I am looking at the one underneath it: the same
            thing with two thirds removed and the part I actually came for
            sitting quietly in the middle. That picture is very clear to me. It
            is also, apparently, not available anywhere.
          </p>
          <p>
            For years I tried to buy it. I would install a component library,
            get three screens in, and find myself arguing with it. Not because
            any of them are bad, they are the work of people far more patient
            than me, but because each one has already made the decisions I
            wanted to make. One wraps everything in a card. One ships forty
            greys and no opinion about which of them means{" "}
            <span className="text-text">less important</span>. One animates
            nothing at all, and the next animates everything on the same curve,
            so a tooltip and a full-screen dialog arrive with exactly the same
            urgency. Each override I wrote took me further from their design
            without getting me any closer to mine.
          </p>
          <p>
            Eventually the honest thing was to admit I was not shopping for a
            library. I was shopping for a design language, and I already had
            one. It just lived in my head, where nobody else could install it.
          </p>
          <p>
            So I stopped looking and started building. Not a theme, not a
            wrapper around someone else&apos;s primitives, but the whole thing
            from the token layer up: every colour, every radius, every
            millisecond decided once and then held. I wanted a system where
            restraint was structural rather than a style you could opt out of,
            and where motion was not decoration bolted on at the end but the way
            the interface tells you what just happened.
          </p>
          <p>
            I will not pretend this is better than what you are already using.
            It is more specific. It is one person&apos;s taste applied{" "}
            {COMPONENTS.length} times without flinching, and that consistency is
            the actual product. If the picture in your head looks anything like
            the one in mine, this should feel less like adopting a library and
            more like finding one that already knew what you meant.
          </p>
        </div>

        {/*
          * The signature sits after the story rather than before it, the way a
          * letter is signed: the reader meets the argument first and the author
          * second. The profile link stays neutral on purpose -- the accent
          * budget for this page is already spent on Installation, which is the
          * one thing a reader is actually here to do next.
          */}
        <p className="mt-10 text-body text-text-2">
          <span className="text-text">Shekhar Singh</span>, AI Architect.{" "}
          <a
            href="https://www.linkedin.com/in/shekhar-singh-pundir/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-border-strong underline-offset-4 outline-none transition-colors duration-150 hover:text-text hover:decoration-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            LinkedIn
          </a>
        </p>
      </section>

      <section className="mt-24">
        <h2 className="text-caption font-medium uppercase tracking-[0.08em] text-text-2">
          How it is built
        </h2>
        <div className="mt-8 flex flex-col gap-12">
          {CONSTRUCTION.map((c) => (
            <section key={c.title}>
              <h3 className="text-section font-medium text-text">{c.title}</h3>
              <p className="mt-2 max-w-[62ch] text-body text-text-2">{c.body}</p>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <h2 className="text-caption font-medium uppercase tracking-[0.08em] text-text-2">
          What it borrows
        </h2>
        <p className="mt-4 max-w-[62ch] text-body text-text-2">
          Nothing here was invented from nothing. These are the four debts worth
          naming.
        </p>
        <div className="mt-8 flex flex-col gap-12">
          {BORROWED.map((b) => (
            <section key={b.title}>
              <h3 className="text-section font-medium text-text">{b.title}</h3>
              <p className="mt-2 max-w-[62ch] text-body text-text-2">{b.body}</p>
            </section>
          ))}
        </div>
      </section>

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
          Read the source, or change it
        </h2>
        <p className="mt-4 max-w-[62ch] text-body text-text-2">
          minflow is open source. Every component on this site is a single file
          you can read in a couple of minutes, and the design rules above are
          written down in the repository so a contribution can be argued about
          on the merits rather than on taste. Issues and pull requests are
          welcome, and so is telling me a rule is wrong.
        </p>
        <div className="mt-6">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-body font-medium text-text underline decoration-border-strong underline-offset-4 outline-none transition-colors duration-150 hover:decoration-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            github.com/shekharp77/minflow
          </a>
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
            className="text-body font-medium text-accent outline-none transition-opacity duration-150 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Installation
          </Link>
          <Link
            href="/#components"
            className="text-body text-text-2 outline-none transition-colors duration-150 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            All components
          </Link>
        </div>
      </section>
    </article>
  );
}
