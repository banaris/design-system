# 0001 — Icons: recommend `lucide-react`, ship only `Icon` and the glyphs our components use

## Context

The package had no icon policy. Components that needed a chevron, check or status symbol each drew private SVG, and consumers drew their own. Two directions were open: a set of our own, or no set and a recommended library. The owner chose the second; this records which library and why.

## Decision

Recommend `lucide-react`. The package does not depend on it. It ships `Icon` (size steps, `currentColor`, accessible-name rule) and keeps the few glyphs its own components draw in the internal `src/lib/control-icons.tsx`, drawn in the style `lucide-react` uses: stroke 2, round caps and joins, `currentColor`.

## Candidates

Each row was checked against the published package contents, not a summary of them.

| Candidate               | Licence | Style                                                                                                      | Why not / why                                                                                                                                                                                                          |
| ----------------------- | ------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lucide-react`          | ISC     | 24 grid, stroke 2, round, `currentColor`; hidden from assistive technology unless an `aria` prop is passed | Chosen. Matches the existing glyphs, has every glyph our components need (check, chevron, x, plus, minus, info, circle-check, triangle-alert, circle-alert, external-link), `sideEffects: false`, one module per glyph |
| `@tabler/icons-react`   | MIT     | 24 grid, stroke 2                                                                                          | Same line style, but the set is so large that "the recommended handful" stops meaning anything                                                                                                                         |
| `@heroicons/react`      | MIT     | 24 grid, stroke 1.5 outline; solid variants                                                                | Thinner stroke than our glyphs, and a small set that lacks some status shapes                                                                                                                                          |
| `@phosphor-icons/react` | MIT     | Six weights                                                                                                | A convention that fixes one stroke weight fits poorly with a set built around switching weight                                                                                                                         |
| `@radix-ui/react-icons` | MIT     | 15px, filled                                                                                               | Filled shapes do not sit beside our stroked glyphs                                                                                                                                                                     |
| `@mui/icons-material`   | MIT     | Filled paths, 24 grid                                                                                      | Filled paths do not match; peer-depends on `@mui/material`, while this package uses the headless Base UI and not MUI's styled layer                                                                                    |

Set aside before comparing: `react-icons` (several unrelated sets under one name, so no single style or licence) and `@carbon/icons-react` (a distinct IBM house style).

## Consequences

- Consumers install the library themselves. Updating or replacing it never touches this package's version.
- `Icon` accepts any component that renders an SVG and takes SVG props, so choosing another library later changes documentation, not code.
- Our own glyphs are drawn at 16px with stroke 2. `lucide-react` glyphs drawn at 16px by `Icon` have a thinner rendered stroke than ours, because they are authored on a 24 grid.
