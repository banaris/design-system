#!/usr/bin/env node
/* Fails when a class reaches the DOM but its CSS is not in the distributed
 * stylesheet.
 *
 * ── What this catches ──────────────────────────────────────────────────
 * A component references a class name; the generated CSS is missing the rule.
 * The class still appears in the DOM, no error is raised anywhere, and the
 * component simply renders unstyled. Type checking, the build and the linter
 * are all green — the failure is visible only to whoever opens the page.
 *
 * The usual cause is a class name that Tailwind's scanner cannot see:
 * assembled from a template literal, or living in a file outside `@source`.
 * The scanner reports nothing when it finds nothing, so the loss is silent by
 * construction.
 *
 * ── What it checks ─────────────────────────────────────────────────────
 *   1. Every static class name in `src/` exists as a selector in the built CSS.
 *   2. Every `animate-[name_…]` has a matching `@keyframes name`.
 *   3. Tailwind scanned something at all — a total scan failure would
 *      otherwise report as hundreds of per-class errors with no cause named.
 *
 * Whether the published stylesheet carries tokens and stays free of preflight
 * belongs to `check:package`, which owns the shipped artefact.
 *
 * ── What it deliberately does not check ────────────────────────────────
 * Classes built through `${…}` interpolation, which cannot be resolved
 * statically. That is also exactly what must never be written: an interpolated
 * class is invisible to the scanner, so the styles vanish. Keeping every class
 * a literal string is what makes this check possible at all.
 */

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CSS = join(ROOT, "dist", "styles.css");

let css;
try {
  css = readFileSync(CSS, "utf8");
} catch {
  console.error(
    `check:styles failed\n\n  - no built stylesheet at ${CSS}\n    Run \`pnpm run build\` first.`,
  );
  process.exit(1);
}

/* ---- Selectors present in the built CSS ----
 * Two transformations are needed before these compare against the source
 * spelling. CSS escapes the metacharacters in a utility name (`.px-\[22px\]`,
 * `.h-1\.5`), so unescape first. And a variant is baked into the generated
 * class name (`.focus-visible\:shadow-focus:focus-visible`), so record the bare
 * utility as well — the source writes `shadow-focus` with the variant as a
 * separate prefix. */
const present = new Set();
for (const [, raw] of css.matchAll(/\.((?:[\w-]|\\.)+)/g)) {
  const unescaped = raw.replace(/\\/g, "");
  present.add(unescaped);
  const bare = unescaped.split(":").pop();
  if (bare !== undefined) present.add(bare);
}
const keyframes = new Set(
  [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]),
);

/* ---- Class names referenced by the source ---- */
const sourceFiles = readdirSync(join(ROOT, "src"), {
  recursive: true,
  withFileTypes: true,
})
  .filter((e) => e.isFile() && /\.tsx?$/.test(e.name))
  .map((e) => join(e.parentPath, e.name));

/* Single-word Tailwind utilities the components actually use. Anything else
   without a hyphen is treated as prose, erring towards silence over noise. */
const SINGLE_WORD = new Set([
  "flex",
  "grid",
  "block",
  "inline",
  "hidden",
  "relative",
  "absolute",
  "fixed",
  "sticky",
  "static",
  "italic",
  "underline",
  "truncate",
  "uppercase",
  "lowercase",
  "capitalize",
  "transition",
  "transform",
  "invisible",
  "visible",
  "isolate",
]);

const errors = [];
const referenced = new Set();
const animations = new Set();

for (const file of sourceFiles) {
  /* Import specifiers are quoted strings shaped exactly like utilities —
     `tailwind-merge` and `@base-ui/react/button` both pass the filter below —
     so drop those lines before scanning rather than special-casing the names. */
  const text = readFileSync(file, "utf8")
    /* Comments first: this project documents utilities and package names in
       prose, and backtick-quoting them there is the house style — scanning
       comments turns every `data-disabled` mentioned in an explanation into a
       missing class. */
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter(
      (line) =>
        !/^\s*(import|export)\b.*\bfrom\b/.test(line) && !/^\s*\/\//.test(line),
    )
    .join("\n");

  /* Both quote styles. Backticks matter: `BASE` in button.tsx is a template
     literal, and scanning only double quotes left its entire class list —
     `inline-flex`, every `data-disabled:*` rule — unchecked while this script's
     header claimed to cover all of src/. Verified by deleting `.items-center`
     from the built CSS: the guard passed.

     A template literal's `${…}` holes are dropped rather than parsed; the
     static text around them still yields its classes. */
  const literals = [
    ...[...text.matchAll(/"([^"\n]*)"/g)].map((m) => m[1]),
    ...[...text.matchAll(/`([^`]*)`/g)].map((m) =>
      m[1].replace(/\$\{[^}]*\}/g, " "),
    ),
  ];
  for (const literal of literals) {
    for (const token of literal.split(/\s+/)) {
      if (token === "") continue;
      /* Keep the bare utility: strip variant prefixes (`hover:`, `data-*:`)
         and the important suffix, since the CSS selector is generated for the
         base name and the variants become part of the selector's shape.
         The prefix pattern has to admit `=` and `"` so a `data-[state="on"]:`
         prefix strips whole rather than leaving a fragment behind. */
      const bare = token
        .replace(/^(?:[\w[\]&>.="'-]+:)+/, "")
        .replace(/!$/, "");
      /* A dot outside brackets is legal in a utility — `size-3.5`, `py-1.5`,
         `py-2.5` are all rendered by Button. Rejecting them skipped those
         classes entirely: verified by deleting `.size-3\.5` from the built CSS
         while this guard still passed. */
      if (!/^[a-z][\w.-]*(?:-\[[^\]]+\])?$/.test(bare)) continue;
      /* Words that merely look like utilities. Rather than maintain a list of
         English prose, require a hyphen or a known single-word utility. */
      if (!bare.includes("-") && !SINGLE_WORD.has(bare)) continue;
      referenced.add(bare);
    }
  }

  for (const [, name] of text.matchAll(/animate-\[([\w-]+)[_\s]/g))
    animations.add(name);
}

/* ---- 1. Referenced classes exist ---- */
const MARKERS = new Set(["peer", "group", "dark", "light"]);
for (const name of referenced) {
  if (MARKERS.has(name) || present.has(name)) continue;
  errors.push(
    `\`${name}\` is referenced in src/ but has no rule in dist/styles.css.\n` +
      `      The class reaches the DOM and nothing styles it — no error is raised at build time.`,
  );
}

/* ---- 2. Animations resolve ---- */
for (const name of animations) {
  if (!keyframes.has(name)) {
    errors.push(
      `\`animate-[${name}_…]\` has no matching \`@keyframes ${name}\` in dist/styles.css.\n` +
        `      Declare it in src/styles/components.css.`,
    );
  }
}

/* ---- 3. Tailwind scanned anything at all ----
 * A total scanning failure would otherwise surface as hundreds of per-class
 * errors above; this names the actual cause once. The token and preflight
 * assertions live in `check:package`, which owns the published artefact. */
if (!present.has("inline-flex")) {
  errors.push(
    "dist/styles.css contains no utilities. Tailwind found no source to scan — check the " +
      "`@source` directives in src/styles/styles.src.css.",
  );
}

if (errors.length > 0) {
  console.error("check:styles failed\n");
  for (const e of errors) console.error(`  - ${e}\n`);
  process.exit(1);
}

console.log(
  `check:styles ok — ${referenced.size} class(es) and ${animations.size} animation(s) all resolve`,
);
