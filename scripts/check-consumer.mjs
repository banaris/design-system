#!/usr/bin/env node
/* Builds throwaway consumers that run their own Tailwind and import
 * `styles.css`, and asserts that each side keeps its own look.
 *
 * ── What this catches ──────────────────────────────────────────────────
 * `styles.css` and a consumer's Tailwind share one cascade and one set of class
 * names. Two failures are silent. The package's tokens outrank the consumer's
 * theme, so the consumer's own `rounded-md` changes across their app; or the
 * consumer's theme outranks tokens the package's components read, so the
 * components lose their radius, type scale and typeface. The structural check
 * in `check:package` sees only where a block sits; this one sees the outcome.
 *
 * ── What it checks ─────────────────────────────────────────────────────
 * For `styles.css` imported before and after `@import "tailwindcss"`:
 *   1. A consumer's `@theme` values for `--radius-md`, `--text-sm`,
 *      `--font-sans` and `--color-accent` are what `:root` ends up with.
 *   2. A consumer that overrides nothing keeps Tailwind's own `--radius-md`,
 *      `--text-sm` and `--font-sans`, and the package's `--radius-ds-md`,
 *      `--text-ds-sm` and `--font-ds-sans` keep their values.
 *   3. `rounded-md` in a Tailwind-only build reads `var(--radius-md)`, and the
 *      package's `rounded-ds-md` reads its own variable.
 *
 * ── How the winner is decided ──────────────────────────────────────────
 * By the cascade (layer order, then source order) over the built CSS, with
 * `effectiveRootValue` from `lib/css-cascade.mjs`; no browser is involved.
 * That reader is first run on small stylesheets with known answers.
 *
 * ── Failure policy ─────────────────────────────────────────────────────
 * A missing `dist/styles.css`, a failed consumer build or CSS the reader cannot
 * rank stops with a non-zero exit; nothing is reported as passing.
 */

import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { effectiveRootValue } from "./lib/css-cascade.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist", "styles.css");

const errors = [];

/* ---- The reader, on stylesheets whose answer is known ---- */
for (const [label, css, expected] of [
  [
    "unlayered beats layered",
    "@layer a, b; @layer b { :root { --x: 1 } } :root { --x: 2 }",
    "2",
  ],
  [
    "a layer's own rule beats its sublayer, whatever the source order",
    "@layer t, u; @layer t { @layer ds { :root { --x: 1 } } :root { --x: 2 } } @layer t.ds { :root { --x: 3 } }",
    "2",
  ],
  [
    "a later layer beats an earlier one",
    "@layer a, b; @layer b { :root { --x: 1 } } @layer a { :root { --x: 2 } }",
    "1",
  ],
  [
    "a dotted sublayer name belongs to its parent layer, here a later one",
    "@layer a, b; @layer b.x { :root { --x: 1 } } @layer a { :root { --x: 2 } }",
    "1",
  ],
  [
    "later source wins inside one layer",
    "@layer a { :root { --x: 1 } :root { --x: 2 } }",
    "2",
  ],
]) {
  const actual = effectiveRootValue(css, "--x");
  if (actual !== expected)
    errors.push(
      `cascade reader: ${label} — expected ${expected}, got ${actual}.`,
    );
}
let refused = false;
try {
  effectiveRootValue("@media (min-width: 1px) { :root { --x: 1 } }", "--x");
} catch {
  refused = true;
}
if (!refused)
  errors.push(
    "cascade reader: a conditional declaration was ranked, not refused.",
  );

if (!existsSync(DIST)) {
  console.error(
    `check:consumer failed\n\n  - no built stylesheet at ${DIST}\n    Run \`pnpm run build\` first.`,
  );
  process.exit(1);
}

const require = createRequire(import.meta.url);
const cli = join(
  dirname(require.resolve("@tailwindcss/cli/package.json")),
  "dist",
  "index.mjs",
);

/* Inside the repo so `@import "tailwindcss"` resolves from its node_modules. */
const cache = join(ROOT, "node_modules", ".cache");
mkdirSync(cache, { recursive: true });
const dir = mkdtempSync(join(cache, "check-consumer-"));

const build = (name, lines) => {
  const input = join(dir, `${name}.css`);
  const output = join(dir, `${name}.out.css`);
  writeFileSync(input, lines.join("\n"));
  execFileSync(process.execPath, [cli, "-i", input, "-o", output], {
    cwd: dir,
    stdio: ["ignore", "ignore", "inherit"],
  });
  return readFileSync(output, "utf8");
};

const OVERRIDES = {
  "--radius-md": "3px",
  "--text-sm": "13px",
  "--font-sans": "Georgia",
  "--color-accent": "#123456",
};
const STOCK = {
  "--radius-md": "0.375rem",
  "--text-sm": "0.875rem",
};
const PACKAGE = {
  "--radius-ds-md": "10px",
  "--text-ds-sm": "12px",
};
const PACKAGE_FONT = "--font-ds-sans";

const expectValue = (css, label, property, expected) => {
  const actual = effectiveRootValue(css, property);
  if (actual !== expected)
    errors.push(
      `${label}: \`${property}\` ends up as ${actual ?? "undeclared"}, expected ${expected}.`,
    );
};

let built = 0;
try {
  copyFileSync(DIST, join(dir, "ds.css"));
  writeFileSync(
    join(dir, "index.html"),
    '<div class="rounded-md bg-accent text-sm font-sans"></div>\n',
  );
  const source = '@source "./index.html";';
  const overrideTheme = `@theme { ${Object.entries(OVERRIDES)
    .map(([name, value]) => `${name}: ${value};`)
    .join(" ")} }`;

  const alone = build("alone", ['@import "tailwindcss";', source]);
  built += 1;
  if (!/\.rounded-md\s*\{[^}]*border-radius:\s*var\(--radius-md\)/.test(alone))
    errors.push(
      "a Tailwind-only build: `.rounded-md` does not read `var(--radius-md)`, so the consumer's value could not reach it.",
    );

  for (const order of ["before", "after"]) {
    const imports = ['@import "tailwindcss";', '@import "./ds.css";'];
    if (order === "before") imports.reverse();

    const overridden = build(`${order}-overridden`, [
      ...imports,
      source,
      overrideTheme,
    ]);
    const untouched = build(`${order}-untouched`, [...imports, source]);
    built += 2;

    const label = `styles.css imported ${order} Tailwind`;
    for (const [property, expected] of Object.entries(OVERRIDES))
      expectValue(
        overridden,
        `${label}, consumer overrides`,
        property,
        expected,
      );
    for (const [property, expected] of Object.entries(STOCK))
      expectValue(
        untouched,
        `${label}, consumer overrides nothing`,
        property,
        expected,
      );
    for (const [property, expected] of Object.entries(PACKAGE))
      expectValue(
        untouched,
        `${label}, consumer overrides nothing`,
        property,
        expected,
      );
    if (
      !/Helvetica Neue/.test(effectiveRootValue(untouched, PACKAGE_FONT) ?? "")
    )
      errors.push(
        `${label}, consumer overrides nothing: \`${PACKAGE_FONT}\` lost the package's typeface.`,
      );
    if (
      !/\.rounded-ds-md\s*\{[^}]*border-radius:\s*var\(--radius-ds-md\)/.test(
        untouched,
      )
    )
      errors.push(
        `${label}: the package's \`.rounded-ds-md\` does not read \`var(--radius-ds-md)\`.`,
      );
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

if (errors.length > 0) {
  console.error("check:consumer failed\n");
  for (const e of errors) console.error(`  - ${e}\n`);
  process.exit(1);
}
console.log(
  `check:consumer ok — each side keeps its own look in ${built} build(s) (styles.css before and after Tailwind)`,
);
