/*
 * Generates registry.json from source.
 *
 * Everything here is derived, never hand-maintained, because a registry that is
 * edited by hand drifts from the library the moment someone adds a component
 * and forgets the seventh step. Three things get derived:
 *
 *  - item metadata comes from lib/catalog, so the title and description a user
 *    sees in the CLI are the same strings the docs page shows;
 *  - dependencies come from each file's real import statements, so a component
 *    can never ship without something it imports;
 *  - the token layer comes from app/globals.css, so the CSS variables a
 *    consumer installs are byte-for-byte the ones this site renders with.
 *
 * Run `pnpm registry:build` to regenerate registry.json and public/r.
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/*
 * Internal registry dependencies MUST carry the namespace. A bare name in
 * registryDependencies is resolved against shadcn's own registry, so declaring
 * "motion" sends the CLI to ui.shadcn.com/r/.../motion.json and the install
 * dies with a 404. Only the namespaced form points back here.
 */
const NS = "@minflow";

const UI_DIR = "registry/minflow/ui";
const LIB_DIR = "registry/minflow/lib";
const CATALOG_DIR = "lib/catalog";
const GLOBALS = "app/globals.css";
const SLUG_PREFIX = "minimilist-";

/*
 * Items that are real files but have no docs page: shared primitives that other
 * components import. They must exist in the registry or their dependents
 * install broken, but they are not things a reader browses to.
 */
const UNDOCUMENTED = {
  overlay: {
    title: "Overlay",
    description:
      "Portal, anchored positioning and dismiss handling. The primitive every floating layer is built on.",
  },
  field: {
    title: "Field",
    description:
      "The shared shell for list fields: the boundary, the placeholder and the chevron.",
  },
};

/*
 * Documented slugs whose component lives inside another file. `date-picker` is
 * a second export of calendar.tsx, and its docs page prints
 * `add @minflow/date-picker`, so that name has to resolve to something. It
 * carries no file of its own and simply pulls calendar in.
 */
const ALIASES = { "date-picker": "calendar" };

/* react and react-dom are peers of any React project; never declare them. */
const IMPLICIT = new Set(["react", "react-dom"]);

/* ---------------------------------------------------------------- catalog */

function readCatalog() {
  const byName = new Map();
  for (const file of readdirSync(CATALOG_DIR)) {
    if (!file.endsWith(".ts") || file === "types.ts" || file === "index.ts") {
      continue;
    }
    const text = readFileSync(join(CATALOG_DIR, file), "utf8");
    /* Entries are plain object literals; slug, name and summary are adjacent. */
    const re =
      /slug:\s*"([^"]+)",\s*\n\s*name:\s*"([^"]+)",\s*\n\s*category:\s*"[^"]*",\s*\n\s*summary:\s*"((?:[^"\\]|\\.)*)"/g;
    for (const m of text.matchAll(re)) {
      byName.set(m[1].replace(SLUG_PREFIX, ""), {
        title: m[2],
        description: m[3].replace(/\\"/g, '"'),
      });
    }
  }
  return byName;
}

/* ------------------------------------------------------------ dependencies */

/**
 * Resolves one import specifier to either an npm dependency or another
 * registry item. The library imports its own parts through three different
 * alias shapes, so all three are mapped here rather than in 69 files.
 */
function classify(spec) {
  if (spec.startsWith("@/registry/minflow/ui/")) {
    return { registry: spec.slice("@/registry/minflow/ui/".length) };
  }
  if (spec.startsWith("@/registry/minflow/lib/")) {
    return { registry: spec.slice("@/registry/minflow/lib/".length) };
  }
  if (spec.startsWith("@/components/ui/")) {
    return { registry: spec.slice("@/components/ui/".length) };
  }
  if (spec.startsWith("@/lib/")) {
    return { registry: spec.slice("@/lib/".length) };
  }
  if (spec.startsWith("@/") || spec.startsWith(".")) return {};

  /* Bare specifier: take the package name, dropping any deep path. */
  const pkg = spec.startsWith("@")
    ? spec.split("/").slice(0, 2).join("/")
    : spec.split("/")[0];
  return IMPLICIT.has(pkg) ? {} : { npm: pkg };
}

function analyse(path) {
  const text = readFileSync(path, "utf8");
  const npm = new Set();
  const registry = new Set();
  for (const m of text.matchAll(/from\s+"([^"]+)"/g)) {
    const c = classify(m[1]);
    if (c.npm) npm.add(c.npm);
    if (c.registry) registry.add(c.registry);
  }
  return { npm: [...npm].sort(), registry: [...registry].sort() };
}

/* ------------------------------------------------------------------ tokens */

/** Parses `prop: value;` pairs out of one brace-delimited block. */
function declarations(block) {
  const out = {};
  /* Strip comments first so a `/* ... *\/` cannot swallow a declaration. */
  const clean = block.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of clean.matchAll(/([\w-]+)\s*:\s*([^;]+);/g)) {
    out[m[1].trim()] = m[2].trim().replace(/\s+/g, " ");
  }
  return out;
}

/** Returns the body of the first top-level block opened by `header`. */
function blockAfter(css, header) {
  const start = css.indexOf(header);
  if (start === -1) return null;
  const open = css.indexOf("{", start);
  if (open === -1) return null;
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  return null;
}

/**
 * The CSS variables plus the handful of non-variable rules that components
 * actually depend on. `cssVars` is merged into a consumer's stylesheet by the
 * CLI rather than overwriting it, which is why the variables go there and not
 * into a file the install would clobber.
 */
function buildTokens() {
  const css = readFileSync(GLOBALS, "utf8");

  const light = declarations(blockAfter(css, ":root") ?? "");
  const dark = declarations(blockAfter(css, ".dark") ?? "");
  const theme = declarations(blockAfter(css, "@theme inline") ?? "");

  /* Variable names carry no leading `--` in cssVars. */
  const strip = (o) =>
    Object.fromEntries(Object.entries(o).map(([k, v]) => [k.replace(/^--/, ""), v]));

  /* Only the rules registry components reference: icon stroke, the 24px hit
   * area, and the skeleton shimmer. */
  const rules = {};
  for (const sel of [".lucide", ".hit-target", ".hit-target::after"]) {
    const body = blockAfter(css, `\n${sel} `) ?? blockAfter(css, `\n${sel}{`);
    if (body) rules[sel] = declarations(body);
  }
  const shimmer = blockAfter(css, "@keyframes shimmer");
  if (shimmer) {
    rules["@keyframes shimmer"] = {
      from: declarations(blockAfter(shimmer, "from") ?? ""),
      to: declarations(blockAfter(shimmer, "to") ?? ""),
    };
  }

  return {
    name: "tokens",
    type: "registry:style",
    title: "Token layer",
    description:
      "Every colour, size, radius and duration the library styles itself through. Install this before any component.",
    dependencies: ["motion", "@formkit/auto-animate", "lucide-react", "clsx", "tailwind-merge", "class-variance-authority"],
    cssVars: { theme: strip(theme), light: strip(light), dark: strip(dark) },
    css: rules,
  };
}

/* ------------------------------------------------------------------- build */

const catalog = readCatalog();
const items = [buildTokens()];
const warnings = [];

/* lib items first: they are what everything else depends on. */
for (const file of readdirSync(LIB_DIR).sort()) {
  const name = file.replace(/\.(tsx?|ts)$/, "");
  const path = join(LIB_DIR, file);
  const { npm, registry } = analyse(path);
  items.push({
    name,
    type: "registry:lib",
    title: name,
    description: `The ${name} module every component imports.`,
    ...(npm.length ? { dependencies: npm } : {}),
    ...(registry.length
      ? { registryDependencies: registry.map((d) => `${NS}/${d}`) }
      : {}),
    files: [{ path, type: "registry:lib" }],
  });
}

for (const file of readdirSync(UI_DIR).sort()) {
  if (!file.endsWith(".tsx")) continue;
  const name = file.replace(/\.tsx$/, "");
  const path = join(UI_DIR, file);
  const { npm, registry } = analyse(path);
  const meta = catalog.get(name) ?? UNDOCUMENTED[name];
  if (!meta) {
    warnings.push(`no catalog entry or UNDOCUMENTED record for "${name}"`);
  }

  /* The token layer is an implicit dependency of every component: they all
   * style themselves entirely through it. */
  const deps = new Set([...registry, "tokens"]);
  deps.delete(name);

  items.push({
    name,
    type: "registry:ui",
    title: meta?.title ?? name,
    description: meta?.description ?? `The ${name} component.`,
    ...(npm.length ? { dependencies: npm } : {}),
    registryDependencies: [...deps].sort().map((d) => `${NS}/${d}`),
    files: [{ path, type: "registry:ui" }],
  });
}

/* Alias items resolve a documented name onto the file that really holds it. */
for (const [alias, target] of Object.entries(ALIASES)) {
  const meta = catalog.get(alias);
  items.push({
    name: alias,
    type: "registry:ui",
    title: meta?.title ?? alias,
    description: meta?.description ?? `The ${alias} component.`,
    registryDependencies: [`${NS}/${target}`],
  });
}

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "minflow",
  homepage: "https://minflow.design",
  items: items.sort((a, b) => a.name.localeCompare(b.name)),
};

writeFileSync("registry.json", JSON.stringify(registry, null, 2) + "\n");

const counts = items.reduce((a, i) => ({ ...a, [i.type]: (a[i.type] ?? 0) + 1 }), {});
console.log(`registry.json written: ${items.length} items`, counts);
for (const w of warnings) console.warn(`  warning: ${w}`);
if (warnings.length) process.exitCode = 1;
