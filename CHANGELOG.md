# @banaris/design-system

## 0.6.0

### Minor Changes

- [#399](https://github.com/banaris/design-system/pull/399) [`791cc0e`](https://github.com/banaris/design-system/commit/791cc0ea7beb6082a1197067cd5e2d700a16311e) - Five components are added. `Accordion` (with `AccordionItem`, `AccordionTrigger` and `AccordionPanel`) stacks sections that open in place; `multiple` lets several be open at once. `Progress` shows how far along some work is, takes `label` and `showValue`, and is indeterminate when `value` is `null`. `Avatar` shows a picture from `src` and falls back to its `children`, usually initials, while the picture loads or if it fails; `aria-label` names it. `Toggle` is a button that stays pressed or not, with `size`. `NumberField` is a number input with buttons that step the value, and reads typed text in the user's locale. All of them use the system's tokens, focus ring and touch-target size, and the "Choosing a component" guide says when to pick each over a neighbour.

- [#396](https://github.com/banaris/design-system/pull/396) [`3b10c2b`](https://github.com/banaris/design-system/commit/3b10c2bd96bd616ee745cbbdddd505b4c9f87068) - An `Autocomplete` is a text field that suggests options while the reader types and keeps whatever text they enter. Its value is the typed text (`value`, `defaultValue`, `onValueChange`); pass `items` so the suggestions filter by that text, and choosing one puts its label in the input. It is built from `Autocomplete`, `AutocompleteInput` and `AutocompleteItem`, and reuses `ComboboxContent`, `ComboboxList` and `ComboboxEmpty` for the popup (leave `ComboboxEmpty` out and the popup stays closed while nothing matches, and the input reports `aria-expanded="false"`). The input has the same field, error and disabled styling as `Combobox` and `TextField` and works inside a `Field`; `ArrowDown` opens the list, `Escape` closes it, and `Escape` pressed again clears the field. Multiple values, async loading and grouped options are not part of it.

- [#395](https://github.com/banaris/design-system/pull/395) [`7d19be8`](https://github.com/banaris/design-system/commit/7d19be8e2197437f51a2ca3e1623c2cba5d6346f) - A `Combobox` picks one value from a list the reader narrows by typing. It is built from `Combobox` (owns the value, the typed query and the open state; pass `items` so the list filters and the input shows labels), `ComboboxInput`, `ComboboxContent`, `ComboboxList`, `ComboboxItem` and `ComboboxEmpty`. The input has the same field, error and disabled styling as `Select` and works inside a `Field`; clicking it or pressing `ArrowDown` opens the list, `Escape` closes it, typed text that was not chosen is dropped when it closes, and emptying the input clears the chosen value. With no `ComboboxEmpty`, a list that has nothing to show is hidden and the input reports `aria-expanded="false"`. Free-text autocomplete, multiple selection, async loading and grouped options are not part of it.

- [#393](https://github.com/banaris/design-system/pull/393) [`a7f8337`](https://github.com/banaris/design-system/commit/a7f8337dfbbbce9a1eb8b72e81d5bc01a4b89166) - A `Drawer` slides in from the bottom edge or from the left or right, for a secondary task or a menu on a phone. It has the same parts as `Dialog` (`Drawer`, `DrawerTrigger`, `DrawerContent`, `DrawerTitle`, `DrawerDescription`, `DrawerClose`); `DrawerContent` takes `side` (`"bottom"`, `"left"` or `"right"`, default `"bottom"`) to choose the edge. It keeps the `--ds-edge-*` gap from the screen edges and the notch, closes on `Escape`, an outside press, `DrawerClose` or a swipe toward its edge, and returns focus to its trigger. Snap points and nested drawers are not part of it.

- [#375](https://github.com/banaris/design-system/pull/375) [`e80c987`](https://github.com/banaris/design-system/commit/e80c987743ed1b71957075349c2c0f2e1591d150) - `DateTimePicker` accepts `locale` (a BCP 47 tag for month, weekday and day names; default `"en"`; a malformed tag, or one the runtime has no data for, falls back to it), `labels` (overrides for the popup's accessible names and text, with the English strings as defaults; the trigger's empty text stays `placeholder`) and `firstDayOfWeek` (`0`–`6`, `0` = Sunday; by default taken from the locale). `DateTimePickerLabels` is exported.

- [#386](https://github.com/banaris/design-system/pull/386) [`e09990a`](https://github.com/banaris/design-system/commit/e09990a4d33daf833d582252c9f71145d9d71c58) - Add `createCn(extend?)`, a `cn` that merges Tailwind classes with the package's tokens (`text-body`, `text-small`, `rounded-shell`, `shadow-raised`, …) and the ones you add. A `cn()` of your own on stock `tailwind-merge` misreads these tokens: `text-small` drops `text-ink`, and `rounded-shell` does not replace `rounded-md`. `createCn({ theme: { text: ["tiny"] } })` takes `tailwind-merge`'s own `extend` option, merged on top of the package's configuration. `check:tw-merge` now measures `createCn()` and a consumer-defined token as well as the internal instance.

- [#392](https://github.com/banaris/design-system/pull/392) [`34bc97b`](https://github.com/banaris/design-system/commit/34bc97bd660aa8a9d42560fab45078d17aff9930) - New `Fieldset`, `FieldsetLegend`, `FieldsetHint` and `FieldsetError` give a group of controls a visible name, hint and error; a `RadioGroup` inside a `Fieldset` takes its name from the legend instead of needing an `aria-label`. New `CheckboxGroup` shares one value across its `Checkbox`es.

- [#392](https://github.com/banaris/design-system/pull/392) [`34bc97b`](https://github.com/banaris/design-system/commit/34bc97bd660aa8a9d42560fab45078d17aff9930) - `DateTimePicker` takes `name`, `required` and `ref`. With a `name` it submits its value with the surrounding form as `YYYY-MM-DDTHH:mm` (an empty or malformed `value` submits an empty string), and `required` blocks a native submit while it is empty, focusing the picker's button. `ref` reaches the trigger button. It stays controlled-only.

- [#392](https://github.com/banaris/design-system/pull/392) [`34bc97b`](https://github.com/banaris/design-system/commit/34bc97bd660aa8a9d42560fab45078d17aff9930) - `Field` now accepts Base UI's `invalid`, `validate`, `validationMode` and `validationDebounceTime`, and `FieldError` accepts `match`, so the browser's own validation messages (a `required` or `type="email"` control, or a `validate` function) show in a `Field` without a hand-passed `error` string; set `validationMode` to `"onBlur"` or `"onChange"` to see them outside a Base UI `Form`. The `error` string still works as before.

- [#391](https://github.com/banaris/design-system/pull/391) [`8cff916`](https://github.com/banaris/design-system/commit/8cff9169ea2b9b6c58a2a40e101e5f082fb43163) - A router's link can now stand in for the system's controls. `Button`, `IconButton` and `DropdownMenuLinkItem` accept Base UI's `render`, so `<Button render={<RouterLink to="/" />} nativeButton={false}>` draws a button-shaped link and `<DropdownMenuLinkItem render={<RouterLink to="/" />}>` navigates without a full page load. `Button` shows its `loading` spinner only while the rendered element is a native button; a link in `loading` still blocks interaction and sets `aria-busy`. The new `Link` component is an inline link in the accent text colour with a focus ring and hover and visited states in both themes, and takes `render` for a router link too. It is a plain function with no hooks, so a server component can render it.

- [#383](https://github.com/banaris/design-system/pull/383) [`409ef90`](https://github.com/banaris/design-system/commit/409ef90374539973a8cd1f77986860c981e0f330) - `styles.css` no longer overrides a consumer's Tailwind theme. The design tokens now sit in `@layer theme.ds`, a sublayer of `theme`, instead of outside every layer, so a consumer's own `@theme` (for example `--color-accent`) wins whichever stylesheet they import first. The 14 tokens that reused Tailwind's stock names with different values are renamed so that neither side changes the other: `--radius-{xs,sm,md,lg}` → `--radius-ds-*` (`rounded-ds-*`), `--text-{xs,sm,base,lg}` and their `--line-height` → `--text-ds-*` (`text-ds-*`), `--font-sans` / `--font-mono` → `--font-ds-sans` / `--font-ds-mono`. The package's components use the new names, so they keep their radius, type scale and typeface in a Tailwind consumer, and the consumer's `rounded-md`, `text-sm` and `font-sans` are no longer changed. If your own CSS read `var(--radius-md)`, `var(--text-sm)` or `var(--font-sans)` from `styles.css`, switch to the `-ds-` names. `theme.css` (for consumers who run their own Tailwind) still declares the old names, now as aliases of the new ones, and ships as three files: `tokens.css`, `variants.css` and `stock-aliases.css`. To override a colour that has a separate dark value, set the dark value too (see the README). Under `prefers-reduced-motion: reduce`, `styles.css` now actually zeroes the `--duration-*` tokens (the tokens used to outrank the rule that does it, so components kept animating).

### Patch Changes

- [#389](https://github.com/banaris/design-system/pull/389) [`6728f0b`](https://github.com/banaris/design-system/commit/6728f0bcc4a7a44310870d643fb3c0598858002d) - Raise the `@base-ui/react` floor from `^1.7.0` to `^1.9.0`, the version this package is built and tested against. Most public prop types are derived from Base UI's, so an older Base UI inside the range was an untested combination. `check:public-types` now compares the resolved public type surface with a committed snapshot, so adopting a Base UI release that changes it fails `verify` until the change is recorded here, instead of changing this package's API unrecorded.

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
