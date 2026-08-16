#!/usr/bin/env node
/* Measures how the design system's tokens are classified by `tailwind-merge`.
 *
 * ── What this catches ──────────────────────────────────────────────────
 * `tailwind-merge` only knows Tailwind's stock scales, so a custom token name
 * lands wherever its prefix happens to point. Two failure modes, both silent:
 *
 *   - MISGROUPED. `text-body` is not a stock font-size, so it falls through to
 *     the colour group and starts annihilating `text-accent-soft` — one of the
 *     two disappears depending on argument order.
 *   - UNRECOGNISED. `rounded-shell` is passed through untouched, so it does not
 *     become exclusive with `rounded-md` and both survive. Which one wins is
 *     back to stylesheet order.
 *
 * Neither is visible to the type checker, the build or the linter. And the
 * classification cannot be reasoned about reliably — the only way to know is
 * to call `twMerge` and look, which is what this does.
 *
 * ── What it checks ─────────────────────────────────────────────────────
 *   1. Tokens declared in `theme.css` are registered in `cn.ts`, and vice
 *      versa — adding a token and forgetting the merge config is the common
 *      way this drifts.
 *   2. The measured grouping: same-group classes collapse, different-group
 *      classes coexist.
 *   3. A caller's `className` beats the component's own variant.
 *   4. Each variant sets each colour property exactly once — a component-shape
 *      convention rather than a classification one, but it lives here because
 *      it is only meaningful given how (3) resolves conflicts.
 */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { cn, twMerge } from "../src/lib/cn.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const log = [];

const expect = (label, actual, expected) => {
  const ok = actual === expected;
  log.push(`  ${ok ? "ok" : "NG"}  ${label}\n        → ${actual}`);
  if (!ok)
    errors.push(
      `${label}\n      expected: ${expected}\n      actual:   ${actual}`,
    );
};

/* ---- 1. theme.css and cn.ts agree ----
 * Comments are stripped first: `theme.css` writes prose that contains
 * declaration-shaped text, which a naive scan reads as real tokens. */
const theme = readFileSync(
  join(ROOT, "src", "styles", "theme.css"),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

/* De-duplicated: a token restated in the dark overlay is one token, not three. */
const declared = (prefix) =>
  [
    ...new Set(
      [...theme.matchAll(new RegExp(`--${prefix}-([\\w-]+):`, "g"))]
        .map((m) => m[1])
        /* `--text-body--line-height` and friends are modifiers on a step, not
           steps of their own. */
        .filter((name) => !name.includes("--")),
    ),
  ].sort();

const registered = (group) => {
  const source = readFileSync(join(ROOT, "src", "lib", "cn.ts"), "utf8");
  const block = new RegExp(`${group}:\\s*\\[([^\\]]*)\\]`).exec(source);
  if (block === null) return [];
  return [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]).sort();
};

/* Names `tailwind-merge` already classifies correctly out of the box, so
   registering them would be redundant rather than protective. */
const STOCK = new Set([
  "xs",
  "sm",
  "base",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "none",
  "full",
]);

for (const [cssPrefix, mergeGroup] of [
  ["text", "text"],
  ["radius", "radius"],
  ["shadow", "shadow"],
  ["ease", "ease"],
]) {
  const need = declared(cssPrefix).filter((n) => !STOCK.has(n));
  const have = registered(mergeGroup);
  const missing = need.filter((n) => !have.includes(n));
  const extra = have.filter((n) => !need.includes(n));

  if (missing.length > 0) {
    errors.push(
      `cn.ts is missing ${mergeGroup} entries declared in theme.css: ${missing.join(", ")}\n` +
        `      Without them these classes are misgrouped or passed through untouched.`,
    );
  }
  if (extra.length > 0) {
    errors.push(
      `cn.ts registers ${mergeGroup} entries that theme.css no longer declares: ${extra.join(", ")}`,
    );
  }
  log.push(
    `  --  ${mergeGroup}: ${have.length} registered, ${need.length} required`,
  );
}

/* ---- 2. Measured classification ---- */
// `text-*` splits across two groups; these must NOT collapse into each other.
expect(
  "text-body (font-size) and text-accent-soft (colour) coexist",
  twMerge("text-body text-accent-soft"),
  "text-body text-accent-soft",
);
// Same group: last wins.
expect(
  "two semantic type steps collapse",
  twMerge("text-body text-h1"),
  "text-h1",
);
expect(
  "a semantic step and a utility step collapse",
  twMerge("text-body text-sm"),
  "text-sm",
);
expect(
  "custom radius is exclusive with a stock one",
  twMerge("rounded-md rounded-shell"),
  "rounded-shell",
);
expect(
  "custom shadows collapse",
  twMerge("shadow-soft shadow-overlay"),
  "shadow-overlay",
);
expect(
  "custom easings collapse",
  twMerge("ease-spring ease-standard"),
  "ease-standard",
);
expect("colours still collapse", twMerge("bg-accent bg-surface"), "bg-surface");

/* ---- 3. The caller wins ----
 * The property the whole merge exists for: overriding a variant must not
 * require `!`. Measured against Button's real variant strings, read from
 * source — copying them here would let the check pass while the component
 * drifts. (Node cannot import the `.tsx` itself: it strips types but not JSX.) */
const buttonSource = readFileSync(
  join(ROOT, "src", "components", "button.tsx"),
  "utf8",
);
const variantBlock = /const VARIANT[^{]*\{([\s\S]*?)\n\};/.exec(buttonSource);

/* An empty match is the dangerous outcome, not a missing one: reformat VARIANT
   to template literals or single quotes and the entry regex below matches
   nothing, both contracts loop over zero items, and the guard reports success.
   Cross-check the count against the declared union so silence cannot pass. */
const declaredVariants = /export type ButtonVariant =([\s\S]*?);/.exec(
  buttonSource,
);
const expectedCount =
  declaredVariants === null
    ? 0
    : [...declaredVariants[1].matchAll(/"[^"]+"/g)].length;

if (variantBlock === null) {
  errors.push("cannot find Button's VARIANT map — this check needs updating.");
} else {
  const entries = [...variantBlock[1].matchAll(/(\w+):\s*\n?\s*"([^"]+)"/g)];

  if (entries.length !== expectedCount) {
    errors.push(
      `parsed ${entries.length} VARIANT entries but ButtonVariant declares ${expectedCount}.\n` +
        `      Both contracts below iterate these entries, so a parse miss would pass them silently.`,
    );
  }

  for (const [, name, classes] of entries) {
    /* Contract 1: a caller's className beats the variant, with no `!`. */
    const kept = cn(classes, "bg-danger-surface")
      .split(" ")
      .filter((c) => c.startsWith("bg-") && !c.includes(":"));
    if (kept.length !== 1 || kept[0] !== "bg-danger-surface") {
      errors.push(
        `Button variant "${name}" does not yield to a caller's background.\n` +
          `      surviving bg utilities: ${kept.join(", ") || "(none)"}`,
      );
    }

    /* Contract 2: each variant sets each colour property exactly once, which
       is what keeps BASE and VARIANT from fighting over the same property. */
    const plain = classes.split(" ").filter((c) => !c.includes(":"));
    for (const [prop, test] of [
      ["background", (c) => c.startsWith("bg-")],
      [
        "text colour",
        (c) => c.startsWith("text-") && !/^text-(xs|sm|base|lg)$/.test(c),
      ],
      ["border colour", (c) => c.startsWith("border-")],
    ]) {
      const count = plain.filter(test).length;
      if (count !== 1) {
        errors.push(
          `Button variant "${name}" sets ${prop} ${count} times; it must set it exactly once.`,
        );
      }
    }
  }
  log.push(
    `  --  ${entries.length} Button variant(s): caller wins, each colour set once`,
  );
}

console.log(log.join("\n"));

if (errors.length > 0) {
  console.error("\ncheck:tw-merge failed\n");
  for (const e of errors) console.error(`  - ${e}\n`);
  process.exit(1);
}
console.log("\ncheck:tw-merge ok");
