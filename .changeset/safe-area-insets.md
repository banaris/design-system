---
"@banaris/design-system": minor
---

Keep `Dialog` and `Toast` clear of the device safe-area insets: with `viewport-fit=cover` set on the page, the toast and the dialog no longer sit under the notch, the home indicator or a landscape cutout. The gap each keeps from an edge is exposed as `--ds-edge-*` (1rem, or the inset when that is larger) for your own fixed-position UI; with zero insets nothing moves.
