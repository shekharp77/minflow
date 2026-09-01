/*
 * The /llms.txt pair, generated from the same catalog the pages render from so
 * the two cannot disagree. llmstxt.org's shape: an H1, a blockquote summary,
 * then link lists grouped by section. The short file is an index a model reads
 * to find the right component; the full file carries enough detail to choose a
 * variant and install it without fetching anything else.
 */

import { CATEGORIES, COMPONENTS } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

const SUMMARY =
  "A React component library built from scratch in one minimalist design language: colour as hierarchy rather than decoration, whitespace instead of boxes, icons before words, objects created inline rather than in modals, and motion on one shared scale that stills entirely under prefers-reduced-motion.";

/** `minimilist-button` -> `button`, the name used by the registry and the CLI. */
const itemName = (slug: string) => slug.replace("minimilist-", "");

const installBlock = `Components are installed with the shadcn CLI and land in the consumer's own
source tree as editable files. The registry namespace must be registered first,
in the consumer's components.json:

    { "registries": { "@minflow": "${SITE_URL}/r/{name}.json" } }

Then the token layer, which every component styles itself through and which must
be installed before any component:

    npx shadcn@latest add @minflow/tokens

Then any component, whose dependencies come with it automatically:

    npx shadcn@latest add @minflow/button`;

export function llmsIndex(): string {
  const out: string[] = [
    "# minflow",
    "",
    `> ${SUMMARY}`,
    "",
    `Documentation: ${SITE_URL}`,
    `Source: https://github.com/shekharp77/minflow`,
    "",
    "## Installing",
    "",
    installBlock,
    "",
  ];

  for (const category of CATEGORIES) {
    const items = COMPONENTS.filter((c) => c.category === category);
    if (!items.length) continue;
    out.push(`## ${category}`, "");
    for (const c of items) {
      out.push(`- [${c.name}](${SITE_URL}/${c.slug}): ${c.summary}`);
    }
    out.push("");
  }

  out.push(
    "## Optional",
    "",
    `- [Full component detail](${SITE_URL}/llms-full.txt): every component with its description, when to use it, and each variant.`,
    `- [Introduction](${SITE_URL}/introduction): the design rules and why they exist.`,
    `- [Installation](${SITE_URL}/installation): the full install guide.`,
    ""
  );

  return out.join("\n");
}

export function llmsFull(): string {
  const out: string[] = [
    "# minflow: full component reference",
    "",
    `> ${SUMMARY}`,
    "",
    `Documentation: ${SITE_URL}`,
    `${COMPONENTS.length} components. Every one obeys the same rules, which is what`,
    "lets them sit together without the screen turning into noise.",
    "",
    "## Installing",
    "",
    installBlock,
    "",
    "---",
    "",
  ];

  for (const category of CATEGORIES) {
    const items = COMPONENTS.filter((c) => c.category === category);
    if (!items.length) continue;
    out.push(`# ${category}`, "");

    for (const c of items) {
      out.push(
        `## ${c.name}`,
        "",
        `Install: \`npx shadcn@latest add @minflow/${itemName(c.slug)}\``,
        `Page: ${SITE_URL}/${c.slug}`,
        "",
        c.description,
        ""
      );

      if (c.whereToUse.length) {
        out.push("Where to use it:", "");
        for (const w of c.whereToUse) out.push(`- ${w}`);
        out.push("");
      }

      if (c.variants.length) {
        out.push("Variants:", "");
        for (const v of c.variants) out.push(`- ${v.title}: ${v.when}`);
        out.push("");
      }
    }
  }

  return out.join("\n");
}
