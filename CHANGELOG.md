# @banaris/design-system

## 0.5.0

### Minor Changes

- [#332](https://github.com/banaris/design-system/pull/332) [`48c6514`](https://github.com/banaris/design-system/commit/48c6514ed3bdce74978d64a949edb26ec921e016) - Add `DateTimePicker`, a popup with a calendar, typed date, hour and minute inputs, and `Cancel` / `Apply`. Its required `onClose` reports `{ outcome: "dismissed" }` or `{ outcome: "applied", value }`, so a form can tell how it was closed. `PopoverContent` gains `portalContainer` for rendering inside a native modal `<dialog>`.

- [#348](https://github.com/banaris/design-system/pull/348) [`b785733`](https://github.com/banaris/design-system/commit/b7857339544c641e57d38a46e50cdc2d58d26da0) - Make `Grid` reflow on narrow screens: below the `sm` breakpoint a grid is one column whatever its `columns`, so a 4-column grid no longer squeezes or overflows at 320px; from `sm` up the column counts are unchanged. `Popover` (and so `DateTimePicker`) and `SelectContent` now stay within the viewport width instead of reaching past its right edge on a narrow screen.

- [#330](https://github.com/banaris/design-system/pull/330) [`072dc6d`](https://github.com/banaris/design-system/commit/072dc6d4826032614e1eefc39a74a367e58404c5) - Add `IconButton`, a square icon-only button with `xs`, `sm`, `md` and `lg` sizes and the same variants, focus ring and disabled styling as `Button`. It requires `aria-label`.

- [#343](https://github.com/banaris/design-system/pull/343) [`0028de0`](https://github.com/banaris/design-system/commit/0028de0b66f7858561ef8d4ad0222411e5228e18) - Raise the font size of `TextField`, `Textarea`, `Select`, `DateTimeField` and the typed inputs of `DateTimePicker` to 16px on touch devices (`any-pointer: coarse`) so iOS Safari no longer zooms the page when one is focused. Desktop stays 14px. The new `text-input` type step (`--text-input`) carries the size and is the one to use on your own editable fields; `--text-base` is unchanged.

- [#356](https://github.com/banaris/design-system/pull/356) [`36f37ef`](https://github.com/banaris/design-system/commit/36f37efbc1e7a0af87e0a27cecea4aba18a52acc) - Make every pointer target at least 44×44 CSS px on touch devices (`any-pointer: coarse`), with 8px between neighbours inside a component, as ADR 0002 requires. This covers `Button` (every size), `IconButton`, `Checkbox`, `Radio`, `Switch`, the `Slider` control, `Tabs` triggers, the editable fields and the `Select` trigger, `DropdownMenu` and `Select` items, `Dialog` close controls, the `DateTimePicker` calendar days and the `Toast` buttons. Desktop sizes are unchanged.
  
  `touch-target` is the one place the 44px floor is defined; use it on your own interactive elements. `Checkbox`, `Radio` and `Switch` now take the press on their root and draw the box in its first child, so the drawn box keeps its size while the target grows; a `className` still lands on the root, so a size class now resizes the target and not the drawn box, and a rule that styled the root's border or background must now reach that child. `DropdownMenu` and `SelectContent` popups space their items 8px apart on touch devices, and `DateTimePicker`'s popover is a little wider there so seven 44px days fit, and on a narrower screen the popover scrolls sideways. A `gap` or layout class you pass to `TabsList`, `DropdownMenuContent` or `SelectContent` is overridden by those spacings on touch devices; repeat it with the `coarse:` prefix to change it there.

- [#362](https://github.com/banaris/design-system/pull/362) [`04983fd`](https://github.com/banaris/design-system/commit/04983fdc15858d90c9ca13a1d6162da45a0d9fb8) - Keep the `Popover`, `Tooltip`, `DropdownMenu`, `Select` and `DateTimePicker` popups clear of the device safe-area insets: with `viewport-fit=cover` set on the page, they no longer open under the notch, the home indicator or a landscape cutout. With zero insets nothing moves. `Tooltip` and `SelectContent` now carry a `"use client"` boundary, as `Popover` and `DropdownMenu` already did.

- [#360](https://github.com/banaris/design-system/pull/360) [`4c7fe1d`](https://github.com/banaris/design-system/commit/4c7fe1d9529bc7e0341ada9f8d6a0ec51b97a09c) - Keep `Dialog` and `Toast` clear of the device safe-area insets: with `viewport-fit=cover` set on the page, the toast and the dialog no longer sit under the notch, the home indicator or a landscape cutout. The gap each keeps from an edge is exposed as `--ds-edge-*` (1rem, or the inset when that is larger) for your own fixed-position UI; with zero insets nothing moves.

- [#328](https://github.com/banaris/design-system/pull/328) [`845739c`](https://github.com/banaris/design-system/commit/845739cb281181680cb54293fd9e3a8b1c11dca8) - Add `Slider`, a single-value range control built on Base UI with `value` / `defaultValue`, `min`, `max`, `step` and `disabled`. Name it with `aria-label`, `aria-labelledby` or a `Field` label.

- [#350](https://github.com/banaris/design-system/pull/350) [`f70bf17`](https://github.com/banaris/design-system/commit/f70bf171a3aa0426ba277a59b6f45f20a2360cca) - Let a `Slider` show a number input beside the track with `showInput`, so a value can be typed instead of dragged. The typed value is applied on Enter or blur, clamped to `min`/`max` and snapped to `step`; text that is not a number, or Escape, puts the current value back. `inputReadOnly` keeps the input visible but not editable, and `inputAriaLabel` names it (it defaults to `aria-label`).

- [#345](https://github.com/banaris/design-system/pull/345) [`e8917d3`](https://github.com/banaris/design-system/commit/e8917d34489030506fbc996c97e384e9e58ea772) - Let a vertical swipe that starts on a `Slider` scroll the page on touch screens: the control is now `touch-action: pan-y` instead of `none`, and a swipe that turns into a scroll no longer changes the value. On touch, tapping the track sets the value when the finger lifts, and a horizontal drag still moves the thumb. `Slider` is now a client component.

### Patch Changes

- [#354](https://github.com/banaris/design-system/pull/354) [`8986b8f`](https://github.com/banaris/design-system/commit/8986b8f45523d4b8420fe48a717c08d15bf18c40) - Wire the `DateTimePicker` trigger into `Field`: the `FieldLabel` now names it (the current value stays in the name), a click on the label activates it, a disabled `Field` disables it, and the `Field`'s hint and error describe it. An explicit `aria-labelledby` on the trigger now also gets the current value appended to its name.

- [#353](https://github.com/banaris/design-system/pull/353) [`b5eaafb`](https://github.com/banaris/design-system/commit/b5eaafbf5eacecea5e39b7e3dca16e5c2dea247b) - Give the hour and minute inputs of `DateTimePicker` a fixed width that fits two digits at 14px and at the 16px touch size, so the time row no longer spills past the popover.

- [#355](https://github.com/banaris/design-system/pull/355) [`5e9c8c9`](https://github.com/banaris/design-system/commit/5e9c8c91061890cb14f936ce2922aec8072068e7) - Keep `Tooltip` and `DropdownMenu` popups within the available width: long content now wraps instead of reaching past the viewport's right edge on a narrow screen, and `SelectContent`, which shares the menu popup style, is capped the same way.

- [#304](https://github.com/banaris/design-system/pull/304) [`756204b`](https://github.com/banaris/design-system/commit/756204b14f68705a0f2c4855c2c30b8e31dab24f) - Fix importing the package from a React Server Component, which failed `next build` for every export. The build now emits one module per component, and only the ones that need a client boundary (`Field`, `Toaster`, `Textarea`, `Dialog`, `DropdownMenu` and `Popover`, with their parts) carry `"use client"`. The static components stay server-renderable, so `<Icon icon={Check} />` works from a server component. `pnpm run check:rsc` keeps the boundaries from drifting.

## 0.4.0

### Minor Changes

- [#271](https://github.com/banaris/design-system/pull/271) [`b9214b0`](https://github.com/banaris/design-system/commit/b9214b089da3631db25bf228d703780c55015565) - Add `Icon`, which sizes a glyph (`sm`, `md`, `lg`), colours it from `currentColor` and hides it from assistive technology unless given a `label`. The package ships no icon set: `lucide-react` is the recommended one (see the Foundations/Icon story). `Alert` now shows a glyph for its `status`.

- [#270](https://github.com/banaris/design-system/pull/270) [`c303026`](https://github.com/banaris/design-system/commit/c303026aaa37bcdcac565973b3d1a8da2bada680) - Add `Stack`, `Container` and `Grid`, which lay content out with the spacing scale instead of ad hoc utilities, and declare `--breakpoint-*` and `--container-*` in `theme.css` (Tailwind v4's default values, now this package's contract).

- [#262](https://github.com/banaris/design-system/pull/262) [`4a17bc9`](https://github.com/banaris/design-system/commit/4a17bc9be29449dbe72a86f2898675a9433af99d) - Add `Dialog`, `Popover`, `Tooltip`, `Toaster` (with `ToastProvider` and `useToast`), `Tabs`, `Badge`, `Alert` and `Spinner`. Overlays stack at `--z-overlay` and toasts at `--z-toast`, and their motion follows `--duration-*`, so `prefers-reduced-motion` applies. `Button`'s loading state now renders the exported `Spinner`.

### Patch Changes

- [#267](https://github.com/banaris/design-system/pull/267) [`1d5d39b`](https://github.com/banaris/design-system/commit/1d5d39bc78701e3000d4b21b7c4bb5986aa8b75a) - Stop `Spinner`, and the `Button` loading indicator that renders it, from rotating under `prefers-reduced-motion: reduce`. The static ring stays visible and `Spinner` keeps its `status` role.

## 0.3.0

### Minor Changes

- [#260](https://github.com/banaris/design-system/pull/260) [`8469eb3`](https://github.com/banaris/design-system/commit/8469eb3b41ea46903e52f8a1d552c80ed77a0684) - Add `Checkbox`, `Switch`, `Select` (with `SelectTrigger`, `SelectContent` and `SelectItem`) and `Textarea`. They share `TextField`'s and `Radio`'s border, focus ring and disabled styling, mark themselves invalid with `aria-invalid`, and work inside `Field`.

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
