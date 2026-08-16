#!/usr/bin/env node
/* Fails when an exported component has no story.
 *
 * ── What this catches ──────────────────────────────────────────────────
 * The catalogue is not documentation attached to this package — for a consumer
 * it IS the package, the only place to find out what exists and how it looks.
 * A component exported from `src/index.ts` with no story is invisible there, so
 * in practice it does not exist, and nothing in the toolchain notices: the type
 * checker, the build and the linter are all green.
 *
 * It is also not the kind of omission review reliably catches, since the
 * missing thing is absent from the diff by definition.
 *
 * ── What it checks ─────────────────────────────────────────────────────
 * Each value exported from `src/index.ts` that looks like a component is
 * RENDERED as JSX somewhere under `stories/`. Being imported, or appearing in
 * a type annotation, does not count — neither puts anything on screen.
 *
 * ── What it deliberately does not check ────────────────────────────────
 * How thorough the story is. Whether the states are covered is a judgement for
 * review. This is strictly zero-or-one: does the catalogue show it at all.
 */

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = join(ROOT, "src", "index.ts");
const STORIES = join(ROOT, "stories");

/* Exports that are capitalised but never rendered. Each needs a reason: an
 * unexplained entry here turns the check into a formality. Before adding one,
 * ask whether a story is genuinely impossible rather than merely unwritten. */
const EXEMPT = new Map();

const index = readFileSync(INDEX, "utf8");

/* Type-only exports (`type Foo`) render nothing; skip them and keep the
   values. */
/* Forms this scan cannot resolve. Failing loudly beats passing silently: an
   unrecognised export shape would otherwise contribute nothing to the set, and
   its components would need no story at all. */
for (const form of [
  [/export\s+\*/, "`export *`"],
  [
    /export\s+(?:default\s+)?(?:function|const|class)\s/,
    "a direct `export function/const/class`",
  ],
]) {
  if (form[0].test(index)) {
    console.error(
      `check:stories failed\n\n  - src/index.ts uses ${form[1]}, which this guard cannot resolve.\n` +
        `    Re-export through \`export { … } from "…"\` so every public component is visible here,\n` +
        `    or teach this script the new form — silently unchecked exports are what it exists to stop.\n`,
    );
    process.exit(1);
  }
}

const exported = new Set();
for (const [, names] of index.matchAll(/export\s*\{([^}]+)\}/g)) {
  for (const raw of names.split(",")) {
    const spec = raw.trim();
    if (spec === "" || spec.startsWith("type ")) continue;
    const name = (spec.split(/\s+as\s+/).pop() ?? spec).trim();
    if (/^[A-Z]/.test(name)) exported.add(name);
  }
}

const files = readdirSync(STORIES, { recursive: true, withFileTypes: true })
  .filter((e) => e.isFile() && /\.(tsx|mdx)$/.test(e.name))
  .map((e) => join(e.parentPath, e.name));

/* Comments are stripped: a `<Button>` written in an explanation would
   otherwise count as the catalogue rendering one. */
const storyText = files
  .map((f) =>
    readFileSync(f, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, ""),
  )
  .join("\n");

const missing = [...exported].filter((name) => {
  if (EXEMPT.has(name)) return false;
  /* Rendered as `<Name …>`, self-closing, or as a compound `<Name.Sub …>`. */
  return !new RegExp(`<${name}[\\s/>.]`).test(storyText);
});

if (missing.length > 0) {
  console.error("check:stories failed\n");
  for (const name of missing) {
    console.error(
      `  - ${name} is exported from src/index.ts but never rendered in stories/.\n` +
        `    A component absent from the catalogue cannot be discovered by anyone using this package.\n`,
    );
  }
  process.exit(1);
}

console.log(
  `check:stories ok — ${exported.size} exported component(s), all present in the catalogue`,
);
