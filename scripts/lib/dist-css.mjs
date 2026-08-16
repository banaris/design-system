/* Structural assertions about the built stylesheet, shared by `check-styles`
 * and `check-package`.
 *
 * Both guards need them and both had their own copy, which meant the preflight
 * signature had to be edited in two places — and one of them being wrong is
 * exactly the state this file was extracted from.
 */

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
