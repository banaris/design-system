#!/usr/bin/env node
/* Verifies that what `package.json` promises actually exists in `dist/`.
 *
 * ── What this catches ──────────────────────────────────────────────────
 * The `exports` map is a set of string literals that nothing type-checks
 * against the build output. A bundler that emits `index.mjs` while the map
 * points at `index.js` produces a package that builds green, publishes
 * cleanly, and then fails at the consumer's very first import — the error
 * surfaces one repository away from the mistake.
 *
 * This is not hypothetical: the map and the build disagreed on exactly this
 * during initial setup, and neither `tsdown` nor `tsc` said a word.
 *
 * ── What it checks ─────────────────────────────────────────────────────
 *   1. Every path in `exports` resolves to a file that exists.
 *   2. Every path in `files` exists (a typo silently ships an empty package).
 *   3. `sideEffects` still protects CSS from tree-shaking.
 *   4. The published CSS carries tokens and does not carry preflight.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { inspectDistCss } from "./lib/dist-css.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const errors = [];

/* ---- 1. Exported paths resolve ---- */
const exportTargets = [];
const collect = (node) => {
  if (typeof node === "string") {
    exportTargets.push(node);
    return;
  }
  for (const value of Object.values(node)) collect(value);
};
collect(pkg.exports);

for (const target of exportTargets) {
  if (!existsSync(join(ROOT, target))) {
    errors.push(
      `exports points at a file that does not exist: ${target}\n` +
        `  Run \`pnpm run build\` first; if it was built, the bundler's output ` +
        `name and the exports map have drifted apart.`,
    );
  }
}

/* ---- 2. Published files exist ----
 * A typo here ships a package missing the very thing it advertises. Files
 * written by the release itself are exempt: changesets creates CHANGELOG.md at
 * version time, so requiring it before the first release would fail for a
 * reason that is not a defect. */
const GENERATED_AT_RELEASE = new Set(["CHANGELOG.md"]);
for (const entry of pkg.files) {
  if (GENERATED_AT_RELEASE.has(entry)) continue;
  if (!existsSync(join(ROOT, entry))) {
    errors.push(`files lists a path that does not exist: ${entry}`);
  }
}

/* ---- 3. CSS is protected from tree-shaking ----
 * `"sideEffects": false` is the usual advice and is wrong for a package that
 * ships CSS: bundlers will drop the stylesheet entirely. */
/* The pattern has to cover the stylesheet this package actually ships. A
   looser test — any entry merely containing ".css" — passes on `other.css`
   while `dist/styles.css` stays tree-shakeable, which is the failure the
   assertion exists to prevent. */
const CSS_PATTERNS = new Set([
  "**/*.css",
  "*.css",
  "./dist/styles.css",
  "dist/styles.css",
]);
if (
  !Array.isArray(pkg.sideEffects) ||
  !pkg.sideEffects.some((p) => CSS_PATTERNS.has(p))
) {
  errors.push(
    'sideEffects must be an array covering the shipped stylesheet, e.g. ["**/*.css"]. ' +
      "A bare `false` — or a pattern that misses dist/styles.css — lets bundlers " +
      "tree-shake it away.",
  );
}

/* ---- 4. The distributed CSS is actually usable ---- */
const cssPath = join(ROOT, "dist", "styles.css");
if (existsSync(cssPath)) {
  errors.push(...inspectDistCss(readFileSync(cssPath, "utf8")));
} else {
  errors.push(`no built stylesheet at ${cssPath} — run \`pnpm run build\`.`);
}

if (errors.length > 0) {
  console.error("check:package failed\n");
  for (const e of errors) console.error(`  - ${e}\n`);
  process.exit(1);
}
console.log("check:package ok");
