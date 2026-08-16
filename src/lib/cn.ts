import { extendTailwindMerge } from "tailwind-merge";

/* The design system's own `tailwind-merge` instance, and the `cn` helper every
 * component builds its class string with.
 *
 * ── Why merge at all ───────────────────────────────────────────────────
 * Concatenating a variant's classes with the caller's `className` only changes
 * the ORDER of the class attribute. Which one wins is then decided by the order
 * the rules happen to appear in the generated stylesheet — so
 *
 *   <Button variant="ghost" className="text-danger">
 *
 * can render in the variant's colour, and the caller reaches for `text-danger!`
 * to force it. A library that makes its consumers write `!important` has pushed
 * its own problem outwards. `twMerge` collapses same-property utilities to the
 * last one written, so position in the argument list IS the priority order.
 *
 * ── Why the theme has to be declared below ─────────────────────────────
 * `tailwind-merge` only knows Tailwind's stock scales. A custom token name it
 * does not recognise is treated as an unknown class and passed through
 * untouched — which puts it straight back into an order-dependent fight — or,
 * worse, is sorted into the wrong group.
 *
 * `text-*` is where that bites hardest, because it splits across two groups:
 * a known font-size name goes to font-size, and ANY other `text-*` falls
 * through to colour. So `text-danger` classifies correctly with no help, while
 * the semantic type steps (`text-body`, `text-h1`, …) are read as colours and
 * start annihilating `text-accent-soft`. Registering them under `text` fixes it.
 *
 * The same shape applies to radius, shadow and easing: without registration
 * `rounded-shell` and `rounded-md` are not mutually exclusive and both survive.
 *
 * ⚠ Every addition to `theme.css` needs a matching entry here.
 * `scripts/check-tw-merge.mjs` diffs the two and measures the resulting
 * classification, because a misgrouping is invisible to the type checker, the
 * build and the linter alike — it surfaces only as a consumer's broken layout.
 *
 * ── Not public ─────────────────────────────────────────────────────────
 * `src/index.ts` does not export this. A consumer depending on the internal
 * merge configuration would break every time a token is added.
 */
export const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      // Semantic type steps. Omitting these misfiles them as colours.
      text: ["display", "h1", "h2", "body", "small", "label"],
      // `xs`/`sm`/`md`/`lg` are stock t-shirt sizes; `shell` and `pill` are not.
      radius: ["shell", "pill"],
      shadow: ["soft", "raised", "overlay", "focus"],
      ease: ["spring", "standard"],
    },
  },
});

/**
 * Build a class string, resolving Tailwind conflicts left to right — later
 * arguments win. Pass the caller's `className` last so it beats the component.
 */
export const cn = (...classes: (string | false | null | undefined)[]): string =>
  twMerge(classes.filter(Boolean).join(" "));
