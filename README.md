# @banaris/design-system

Design tokens and React UI primitives for Banaris, built on [Base UI](https://base-ui.com/) and Tailwind CSS v4.

The palette is drawn from the Japanese pond turtle (クサガメ): dark brown over warm paper, with the yellow-green of its neck stripe as the accent, and the hexagons of its carapace as the brand mark.

- **Catalogue:** published from `main` (see [Publishing the catalogue](#publishing-the-catalogue))
- **Package:** `@banaris/design-system` on npm

## Install

```bash
pnpm add @banaris/design-system
```

```ts
import "@banaris/design-system/styles.css";
import { Button } from "@banaris/design-system";
```

That one stylesheet is self-contained — tokens, component CSS, and the Tailwind utilities this package uses, all generated at publish time. **You do not need Tailwind in your project**, and if you do use it, no version coupling applies.

> The class names that appear in the DOM (`inline-flex`, `bg-accent`, …) are not a public contract. Do not hook your own CSS to them.

### The three CSS entry points

| Entry point                             | Contents                                      | When                                                                                     |
| --------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `@banaris/design-system/styles.css`     | Tokens, component CSS and utilities, prebuilt | **Default.** Everything, one import                                                      |
| `@banaris/design-system/theme.css`      | Design tokens only (`@theme`)                 | You use Tailwind and want DS tokens (`bg-accent`, `text-ink-dim`) in **your own** markup |
| `@banaris/design-system/components.css` | Component CSS and keyframes only              | Rarely — only alongside `theme.css` if you are generating utilities yourself             |

Using Tailwind and want the tokens in your own markup? Import both. The duplicate `:root` variables are harmless.

```css
@import "tailwindcss";
@import "@banaris/design-system/theme.css";
```

```ts
import "@banaris/design-system/styles.css";
```

**Preflight is not shipped.** Resetting your page's global defaults is not this package's business; you already get preflight from your own `@import "tailwindcss"` if you want it. What ships is the minimum the components need to render correctly — `box-sizing` and font inheritance for form controls.

### Overriding styles

The distributed CSS lives in `@layer theme, base, components, utilities`, which means:

- Passing `className` wins over the component's own variant — no `!important`. Classes are merged with `tailwind-merge`, so conflicting utilities collapse and yours is the one that survives.
- Any CSS of yours outside a layer beats everything here. You always have the last word.

## Theming

**Light is the default.** Dark activates in two ways:

| `<html>` attribute   | Result                            |
| -------------------- | --------------------------------- |
| `data-theme="dark"`  | Dark                              |
| `data-theme="light"` | Light, ignoring the OS preference |
| none                 | Follows `prefers-color-scheme`    |

Products that never think about it get light. Products that offer a toggle set `data-theme` on `<html>` and nothing else — every token follows. The catalogue has a Theme control in its toolbar.

Tokens built with `color-mix()` against `--color-bg` — the status planes and their borders — follow automatically and are never restated per theme.

## Using the tokens

Tokens are named for their **role**, never their colour: `--color-accent`, not `--color-lime`. A palette named for its hue survives exactly one rebrand.

Two conventions worth knowing before you reach for a colour:

- **`accent` fills, `accent-soft` reads.** The yellow-green measures 1.08:1 on paper, so it can never be text on a light surface. Anything that has to be _read_ in the accent colour uses `--color-accent-soft`. Anything _filled_ uses `--color-accent`, with `--color-on-accent` for its label.
- **`border` is decorative, `control-border` is not.** On an unchecked checkbox the border is the only thing announcing the control exists, so it is held to WCAG 1.4.11's 3:1 on every surface. Dividers and card edges are deliberately softer.
- **Focus is two rings, not one.** Controls here sit on everything from paper to the dark shell to the accent fill, and no single colour clears 3:1 across that range. A light inner ring inside a dark outer one always leaves one of the two contrasting — worst case 8.13:1 across the eleven surfaces the system renders.

Typography has two tiers. The **semantic** tier (`text-display`, `text-h1`, `text-body`, …) bakes in weight and line-height — one class produces the intended voice. The **utility** tier (`text-lg`, `text-base`, `text-sm`, `text-xs`) sets size only and leaves weight to you; use it inside controls. Sizes overlap between tiers on purpose.

Every token, rendered from the live cascade, is in the catalogue under **Foundations / Tokens**.

## Development

```bash
mise install
pnpm install
pnpm run storybook   # http://localhost:6006
```

The catalogue imports the package by name, exactly as a consumer would, so stories double as usage examples. During development that self-reference resolves to source rather than `dist`.

### Checks

`pnpm run verify` is the single source of truth for what CI decides — the workflow calls it rather than listing the checks, so the two cannot drift apart.

```bash
pnpm run verify        # lint, types, tokens, build, package (seconds)
pnpm run verify:full   # the above plus axe over every story in a real browser
```

Beyond the usual lint and type checks, five deterministic guards cover failures that are otherwise **silent** — green build, green types, green lint, broken output:

| Check            | Catches                                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `check:contrast` | A token that no longer meets WCAG, in either theme. Measured, not asserted by hand — the ratios quoted in `theme.css` are kept honest by this. |
| `check:tw-merge` | A token missing from the merge config, which silently misgroups a class so two utilities annihilate each other.                                |
| `check:styles`   | A class that reaches the DOM with no CSS behind it — the classic Tailwind scanning failure, which raises no error anywhere.                    |
| `check:stories`  | An exported component with no story. Absent from the catalogue means undiscoverable, which for this package means it may as well not exist.    |
| `check:package`  | `exports` pointing at a file the build does not produce, and a stylesheet shipping preflight or missing tokens.                                |

They exist because each of these was possible to ship without a single tool complaining, and they have already earned it — `check:contrast` caught the accent button's label measuring 1.08:1 against its own fill in dark, and `check:styles` caught three separate cases of a class reaching the DOM with no rule behind it.

**A guard is only worth what it catches, so test it by breaking things.** Delete a rule from `dist/styles.css`, misspell a token, reformat a variant map — then confirm the guard fails. Mutating the guard's own assertions proves nothing; mutating the code it watches is the only evidence it has coverage. Three guards passed their first review clean and were still blind: the preflight regex could never match, template-literal classes were never scanned, and fractional utilities like `size-3.5` were silently skipped.

### Writing a component

Three rules the guards enforce, worth knowing before they fail on you:

1. **Class names must be static string literals.** A class assembled by interpolation is invisible to Tailwind's scanner, so it generates nothing and the style silently disappears. Map props to whole literal strings.
2. **Build the class string with `cn()`, caller's `className` last.** Argument order is priority order.
3. **Each variant sets background, text and border colour exactly once**, and the shared base sets none of them. Two utilities for one property makes the outcome an ordering detail.

Disabled state is written `data-disabled:`, never `disabled:` — Base UI switches to `aria-disabled` when a control stays keyboard-reachable, and `:disabled` stops matching at that point.

## Releasing

Versioning is driven by [changesets](https://github.com/changesets/changesets).

```bash
pnpm run changeset
```

Merging that to `main` opens a version PR; merging the version PR publishes to npm with provenance. A release is therefore always a reviewed commit rather than a consequence of pushing.

## Publishing the catalogue

Every push to `main` deploys the catalogue to Cloudflare Workers, and every pull request uploads a preview version whose URL is written into the PR description. Both need a `CLOUDFLARE_API_TOKEN` repository secret with Workers deploy permission.

## Licence

MIT
