---
"@banaris/design-system": patch
---

Keep the `Table` and `List` row dividers, and the `Table` header and footer lines, visible on a hovered row in the dark theme: they now use a `--color-divider` token that is `--color-border-strong` there, since `--color-border` is one unit from `--color-surface-hover`. The light theme is unchanged, and a caller's border colour on a row still wins.
