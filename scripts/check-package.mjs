/*
 * Checks dist/ before it is allowed to become a published version.
 *
 * A package is not "built" because a compiler exited zero. It is built when a
 * consumer can import it and get working code, and every failure mode below has
 * shipped from real libraries at some point:
 *
 *  - an `exports` subpath that points at a file the build never emitted, so
 *    `import { Button } from "pkg/button"` dies at resolve time;
 *  - an unrewritten `@/` alias, which resolves in this repo and nowhere else;
 *  - a lost `"use client"`, which turns a hook into a server-component crash;
 *  - a stray `next` import, which drags a framework into a plain React app;
 *  - a missing `.d.ts`, which silently degrades the consumer to `any`.
 *
 * None of these are visible in the build log, which is exactly why they need a
 * gate. Run `pnpm package:check` after `pnpm package:build`.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const UI_SRC = "registry/minflow/ui";
const failures = [];

function fail(message) {
  failures.push(message);
}

if (!existsSync(DIST)) {
  console.error("dist/ does not exist. Run `pnpm package:build` first.");
  process.exit(1);
}

/* ------------------------------------------------ every export resolves */

const pkg = JSON.parse(readFileSync("package.json", "utf8"));

/*
 * Wildcard subpaths are checked by expanding them over what is actually on
 * disk, because a pattern always "matches" in the abstract; the only useful
 * question is whether the files behind it exist.
 */
for (const [subpath, target] of Object.entries(pkg.exports ?? {})) {
  const entries =
    typeof target === "string" ? { default: target } : target;

  for (const [condition, file] of Object.entries(entries)) {
    if (!file.includes("*")) {
      if (!existsSync(file)) fail(`exports["${subpath}"].${condition} -> ${file} does not exist`);
      continue;
    }
    const [prefix, suffix] = file.split("*");
    const dir = prefix.replace(/\/[^/]*$/, "");
    if (!existsSync(dir)) {
      fail(`exports["${subpath}"].${condition} -> directory ${dir} does not exist`);
      continue;
    }
    const matches = readdirSync(dir).filter((f) => f.endsWith(suffix));
    if (matches.length === 0)
      fail(`exports["${subpath}"].${condition} -> nothing matches ${file}`);
  }
}

/* --------------------------------- every component has an entry + types */

const components = readdirSync(UI_SRC)
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => f.replace(/\.tsx$/, ""));

for (const name of components) {
  if (!existsSync(join(DIST, "ui", `${name}.js`))) fail(`${name}: no dist/ui/${name}.js`);
  if (!existsSync(join(DIST, "ui", `${name}.d.ts`))) fail(`${name}: no types`);
}

/* -------------------------------------------- no leaked repo internals */

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else out.push(path);
  }
  return out;
}

const code = walk(DIST).filter((f) => /\.(js|d\.ts)$/.test(f));

for (const file of code) {
  const source = readFileSync(file, "utf8");

  for (const spec of source.matchAll(/from\s+["']([^"']+)["']/g)) {
    const target = spec[1];
    if (target.startsWith("@/")) fail(`${file}: unrewritten alias "${target}"`);
    if (target === "next" || target.startsWith("next/"))
      fail(`${file}: imports "${target}" - the framework must not reach a consumer`);
  }

  /* A relative import has to point at something that is really there. */
  for (const spec of source.matchAll(/from\s+["'](\.[^"']*)["']/g)) {
    const target = spec[1].replace(/\.js$/, "");
    const base = join(file.replace(/\/[^/]*$/, ""), target);
    const found = [".js", ".d.ts", "/index.js"].some((ext) => existsSync(base + ext));
    if (!found) fail(`${file}: relative import "${spec[1]}" resolves to nothing`);
  }
}

/* ------------------------------------------- "use client" survived tsc */

for (const name of components) {
  const src = readFileSync(join(UI_SRC, `${name}.tsx`), "utf8");
  if (!/^\s*["']use client["']/.test(src)) continue;
  const out = readFileSync(join(DIST, "ui", `${name}.js`), "utf8");
  if (!/^\s*["']use client["']/.test(out))
    fail(`${name}: "use client" was lost in the emitted file`);
}

/* -------------------------------------------------- the token layer */

const styles = join(DIST, "styles.css");
if (!existsSync(styles)) fail("dist/styles.css is missing");
else {
  const css = readFileSync(styles, "utf8");
  if (/@import\s+["']tailwindcss["']/.test(css))
    fail("dist/styles.css still imports Tailwind - a consumer imports it themselves");
  if (!css.includes("--radius-control")) fail("dist/styles.css is missing the token layer");
}

/* ------------------------------------------------------------- report */

if (failures.length) {
  console.error(`✖ Package check failed with ${failures.length} problem(s):\n`);
  for (const problem of failures) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `✔ Package check passed: ${components.length} components, ${code.length} emitted modules, ` +
    `every export resolves, no aliases or framework imports leaked, directives intact.`
);
