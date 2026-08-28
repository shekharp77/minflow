import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMPONENTS } from "@/lib/catalog";
import { Demo } from "@/components/site/demos";
import { CopyLine } from "@/components/site/copy-line";
import { DemoStage } from "@/components/site/demo-stage";

/*
 * One page per component, statically generated.
 *
 * The page body is a server component on purpose: the name, the description,
 * the "where to use" list and every variant's guidance are in the HTML that
 * ships, so the page is readable and indexable without running any JavaScript.
 * Only <Demo> is a client island.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.slug }));
}

function find(slug: string) {
  return COMPONENTS.find((c) => c.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = find(slug);
  if (!doc) return {};

  const title = `${doc.name} - miniflow`;
  return {
    title,
    description: doc.summary,
    alternates: { canonical: `/${doc.slug}` },
    openGraph: { title, description: doc.summary, type: "article" },
  };
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = find(slug);
  if (!doc) notFound();

  return (
    <article className={doc.wide ? "max-w-none" : "max-w-[46rem]"}>
      <p className="text-caption font-medium uppercase tracking-[0.08em] text-text-2">
        {doc.category}
      </p>
      <h1 className="mt-3 font-display text-display font-bold text-text">
        {doc.name}
      </h1>
      <p className="mt-4 max-w-[62ch] text-emphasis text-text-2">
        {doc.description}
      </p>

      <div className="mt-8">
        <CopyLine
          command={`npx shadcn@latest add @miniflow/${doc.slug.replace("minimilist-", "")}`}
        />
      </div>

      <section className="mt-16">
        <h2 className="text-caption font-medium uppercase tracking-[0.08em] text-text-2">
          Where to use it
        </h2>
        <ul className="mt-4 flex max-w-[62ch] list-none flex-col gap-2">
          {doc.whereToUse.map((line) => (
            <li key={line} className="flex gap-3 text-body text-text-2">
              <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-fg-2" />
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-24">
        <h2 className="text-caption font-medium uppercase tracking-[0.08em] text-text-2">
          Variations
        </h2>

        {doc.variants.map((variant) => (
          /* The id makes a variant linkable on its own, which is how people
             actually share one: "look at the timeline one". */
          <section id={variant.id} key={variant.id} className="mt-16 first:mt-10 scroll-mt-20">
            <h3 className="text-section font-medium text-text">{variant.title}</h3>
            <p className="mt-2 max-w-[62ch] text-body text-text-2">
              {variant.when}
            </p>
            {/*
              * The gap and the stage are both load-bearing. Prose and a live
              * control read as one blob when they sit close together on the
              * same fill, and the reader stops being able to tell which line
              * is the component. The stage answers that with a fill of its
              * own; the gap keeps the two from touching.
              */}
            <DemoStage className="mt-8">
              <Demo slug={doc.slug} variant={variant.id} />
            </DemoStage>
          </section>
        ))}
      </section>
    </article>
  );
}
