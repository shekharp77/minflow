import type { Metadata } from "next";
import { ViewTransition } from "react";
import Link from "next/link";
import { CATEGORIES, COMPONENTS } from "@/lib/catalog";
import { SiteHeader } from "@/components/site/site-header";
import { CopyLine } from "@/components/site/copy-line";
import { Reveal } from "@/components/site/reveal";

export const metadata: Metadata = {
  title: "miniflow - a minimalist React component library",
  description:
    "A from-scratch minimalist React component library: one accent per view, whitespace instead of boxes, and motion that earns its milliseconds.",
  alternates: { canonical: "/" },
};

/*
 * Home: the hero, then every component as a grid of links grouped by
 * category. Server-rendered in full, so the whole catalog is in the HTML that
 * ships and each card is a real anchor a crawler can follow.
 */
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] px-6 pb-32">
        <Reveal className="mt-24 max-w-[640px]">
          <h1 className="font-display text-display font-bold text-text">
            Every element, minimal by structure.
          </h1>
          <p className="mt-4 text-emphasis text-text-2">
            A component library rebuilt from scratch in one design language: a
            token layer, one accent per view, whitespace over boxes, and motion
            that earns its milliseconds.
          </p>
          <div className="mt-8">
            <CopyLine command="npx shadcn@latest add @miniflow/button" />
          </div>
        </Reveal>

        <div id="components" className="mt-32 scroll-mt-24">
          {CATEGORIES.map((category) => {
            const items = COMPONENTS.filter((c) => c.category === category);
            if (!items.length) return null;

            return (
              <section key={category} className="mt-20 first:mt-0">
                <h2 className="text-caption font-medium uppercase tracking-[0.08em] text-text-2">
                  {category}
                </h2>
                <ul className="mt-6 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/${c.slug}`}
                        className="group/card -m-3 flex flex-col gap-1 rounded-control p-3 outline-none transition-colors duration-150 hover:bg-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                      >
                        {/*
                          The card's name and the page's heading are the same
                          object seen twice, so they carry the same transition
                          name and the browser morphs one into the other. It
                          replaces the usual cut -- where a card vanishes and
                          an unrelated heading appears -- with a single element
                          that travels and grows into place.
                        */}
                        <ViewTransition name={`title-${c.slug}`}>
                          <span className="text-body font-medium text-text">
                            {c.name}
                          </span>
                        </ViewTransition>
                        <span className="text-caption text-text-2">
                          {c.summary}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}
