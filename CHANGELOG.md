# @banaris/design-system

## 0.2.0

### Minor Changes

- [#236](https://github.com/banaris/design-system/pull/236) [`ad6ad5b`](https://github.com/banaris/design-system/commit/ad6ad5bae17d098fb5adfd6a207691ed75003228) - Add `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` and `DropdownMenuLinkItem`: a `Button` that opens a popup of actions and links, closing on Escape and outside click, with arrow-key focus movement and `aria-expanded` on the trigger, so apps can drop their hand-rolled menus.

- [#234](https://github.com/banaris/design-system/pull/234) [`5cf0134`](https://github.com/banaris/design-system/commit/5cf0134f523e144ccaecf850b810c6c9e88c5895) - Add `TextField`, `DateTimeField`, `RadioGroup` and `Radio`, with the same focus ring and `control-border` contrast as `Button` plus invalid (`aria-invalid`) and disabled states, so apps can replace raw `<input>` elements.
  
  Controls and `Button` now keep a visible focus indicator in forced-colors mode (Windows High Contrast).

- [#244](https://github.com/banaris/design-system/pull/244) [`048228c`](https://github.com/banaris/design-system/commit/048228c5246035db2a7c99134a6dbc0261cbd67a) - Add `Field`, `FieldLabel`, `FieldHint`, `FieldError` and `FieldControl`, which link a label, a hint and an error message to a control (`TextField`, `DateTimeField` or a native `<input>` via `FieldControl`) through its accessible name and description. A non-empty `error` on `Field` is shown in a live region and sets `aria-invalid` on the control.

- [#239](https://github.com/banaris/design-system/pull/239) [`08eef6d`](https://github.com/banaris/design-system/commit/08eef6dd59c12a1e84043bcbb754ba25ac5af238) - Add `Table` (with `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead` and `TableCell`), `List` with `ListItem`, and `Card`: unstyled-by-default markup replaced with row dividers, hover and a raised surface drawn from the existing tokens, so apps can drop their bare `<table>`, `<ul>` and panel sections.

- [#232](https://github.com/banaris/design-system/pull/232) [`bf464d8`](https://github.com/banaris/design-system/commit/bf464d8f0ddc59dd2d6e9cc13e1c13cf60c9500a) - Add `Heading`, `Text` and `ErrorMessage`, plus a `text-h3` type step, so apps can apply the semantic text tiers and show an inline error without writing the classes themselves.

### Patch Changes

- [#241](https://github.com/banaris/design-system/pull/241) [`d3efefd`](https://github.com/banaris/design-system/commit/d3efefd40b21931939a08a936688c5d7a36903d0) - Keep the `Table` and `List` row dividers, and the `Table` header and footer lines, visible on a hovered row in the dark theme: they now use a `--color-divider` token that is `--color-border-strong` there, since `--color-border` is one unit from `--color-surface-hover`. The light theme is unchanged, and a caller's border colour on a row still wins.

- [#238](https://github.com/banaris/design-system/pull/238) [`f722e8c`](https://github.com/banaris/design-system/commit/f722e8c5af3bfc3b63656439c91af28b5f0f510a) - Fix the `closeOnClick` JSDoc of `DropdownMenuLinkItem`, which stated Base UI's default `false` while the item closes the menu by default.

## 0.1.1

### Patch Changes

- [#222](https://github.com/banaris/design-system/pull/222) [`cd7c84e`](https://github.com/banaris/design-system/commit/cd7c84e4712cd2958ae4bc69713f61a6100b0fc7) - Button sets a `data-loading` attribute while `loading` is true, so the loading state can be styled from CSS.

## 0.1.0

### Minor Changes

- First release: design tokens, a Button and a hexagonal LogoMark built on Base UI and Tailwind v4, with a Storybook catalogue and seven deterministic guards.
