/* Structural assertions about the published stylesheet. `check-package` is the
 * only caller — it owns the shipped artefact. (`check-consumer` reads its own
 * build output through `css-cascade.mjs`, not this file.)
 *
 * These lived in both `check-package` and `check-styles`, which meant the
 * preflight signature had to be edited twice; one copy being wrong is the state
 * this file was extracted from. The duplication is resolved by ownership rather
 * than by sharing: `check-styles` no longer makes these assertions at all.
 */

import { parseCssBlocks } from "./css-cascade.mjs";

/* Tailwind v4's preflight opens with a universal reset. Match it on the
 * pseudo-elements only v4's reset names, in any order, followed by `margin: 0`.
 *
 * ⚠ Do not narrow this to a literal selector string. The previous version
 * expected `*, ::before, ::after` while v4 actually emits
 * `*, ::after, ::before, ::backdrop, ::file-selector-button` — the order
 * differs, so the regex could never match and BOTH guards passed with preflight
 * present in dist (verified by importing full `tailwindcss` and rebuilding).
 */
const PREFLIGHT = /::file-selector-button[^{]*\{[^}]*margin:\s*0/;

/**
 * Returns an array of problem descriptions; empty means the stylesheet is sound.
 */
export const inspectDistCss = (css) => {
  const problems = [];

  if (!css.includes("--color-accent")) {
    problems.push("dist/styles.css carries no design tokens.");
  }

  if (PREFLIGHT.test(css)) {
    problems.push(
      "dist/styles.css contains Tailwind preflight, which would reset the " +
        "consuming page's global defaults. styles.src.css must import " +
        "`tailwindcss/utilities.css`, not `tailwindcss`.",
    );
  }

  return problems;
};

/* ---- Tokens in the published CSS ----
 * An unlayered token block beats a consumer's layered theme, and a token under
 * a Tailwind stock name that differs from Tailwind's value changes the
 * consumer's own utilities. */

const declaresToken = (rule) =>
  rule.decls.some(([prop]) => prop.startsWith("--"));
const squash = (value) => value.replace(/\s+/g, " ").trim();

export const stockTailwindValues = (themeCss) =>
  new Map(
    [...themeCss.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [
      m[1],
      squash(m[2]),
    ]),
  );

const family = (names, reason) => names.map((name) => [name, reason]);
const LISTED_BECAUSE =
  "prebuilt CSS imports only `tailwindcss/utilities.css`, so the utilities that read it generate nothing unless it is declared; the value is Tailwind's own";

const DELIBERATE_COLLISIONS = new Map([
  ["--spacing", LISTED_BECAUSE],
  ...family(
    ["sm", "md", "lg", "xl", "2xl"].map((n) => `--breakpoint-${n}`),
    LISTED_BECAUSE,
  ),
  ...family(
    [
      "3xs",
      "2xs",
      "xs",
      "sm",
      "md",
      "lg",
      "xl",
      "2xl",
      "3xl",
      "4xl",
      "5xl",
      "6xl",
      "7xl",
    ].map((n) => `--container-${n}`),
    LISTED_BECAUSE,
  ),
  ...family(
    ["normal", "medium", "semibold", "bold"].map((n) => `--font-weight-${n}`),
    LISTED_BECAUSE,
  ),
]);

export const inspectTokenLayering = (css, stockValues) => {
  const problems = [];
  const { rules } = parseCssBlocks(css);
  const tokenRules = rules.filter(declaresToken);

  if (tokenRules.length === 0)
    problems.push(
      "dist/styles.css declares no custom properties inside any block.",
    );

  for (const rule of tokenRules.filter((r) => r.layers.length === 0)) {
    const names = rule.decls
      .map(([prop]) => prop)
      .filter((prop) => prop.startsWith("--"));
    problems.push(
      `dist/styles.css declares ${names.slice(0, 3).join(", ")}${names.length > 3 ? ", …" : ""} outside every @layer (${[...rule.atRules, rule.selector].join(" ")}).\n` +
        "  An unlayered declaration beats a consumer's layered theme: import the token file with layer(theme.ds) in src/styles/styles.src.css.",
    );
  }

  const declarations = tokenRules.flatMap((r) =>
    r.decls
      .filter(([prop]) => prop.startsWith("--"))
      .map(([prop, value]) => [prop, squash(value)]),
  );
  const colliding = [...new Set(declarations.map(([prop]) => prop))].filter(
    (name) => stockValues.has(name),
  );

  const unlisted = colliding.filter((name) => !DELIBERATE_COLLISIONS.has(name));
  if (unlisted.length > 0)
    problems.push(
      `dist/styles.css declares Tailwind stock name(s) ${unlisted.join(", ")} that DELIBERATE_COLLISIONS (scripts/lib/dist-css.mjs) does not list.\n` +
        "  A consumer's own `rounded-md`, `text-sm`… would change; give the token a package-owned name (`--radius-ds-md`).",
    );

  const differing = declarations.filter(
    ([prop, value]) =>
      DELIBERATE_COLLISIONS.has(prop) &&
      stockValues.get(prop) !== undefined &&
      stockValues.get(prop) !== value,
  );
  if (differing.length > 0)
    problems.push(
      `Listed stock name(s) ${[...new Set(differing.map(([prop]) => prop))].join(", ")} no longer carry Tailwind's own value.\n` +
        "  A listed collision is harmless only while the values agree; rename the token or drop the entry.",
    );

  const declaredNames = new Set(declarations.map(([prop]) => prop));
  const read = [
    ...new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1])),
  ].filter((name) => stockValues.has(name) && !declaredNames.has(name));
  if (read.length > 0)
    problems.push(
      `dist/styles.css reads Tailwind stock name(s) ${read.join(", ")} without declaring them, so the components take the consumer's value.\n` +
        "  Use the package-owned name (`rounded-ds-md`, `text-ds-sm`, `font-ds-sans`) in src/.",
    );

  const stale = [...DELIBERATE_COLLISIONS.keys()].filter(
    (name) => !colliding.includes(name),
  );
  if (stale.length > 0)
    problems.push(
      `DELIBERATE_COLLISIONS lists ${stale.join(", ")}, which dist/styles.css no longer declares under a Tailwind stock name. Remove the entries.`,
    );

  return problems;
};
