# Real-device checks for the mobile rules

[ADR 0002](adr/0002-design-guidelines.md) makes the mobile rules binding and says "real-device checks cover what emulation cannot show". This page is that list: what to try on a phone, what counts as a pass, and which phone it needs. Use it when a change touches a component's size, spacing, input, scroll, layout or fixed positioning.

The numbers (target size, gap, font size, reflow width) live in the ADR's Decision section and are not repeated here, so a change to a number never leaves this page stale.

## Setup

Open the Storybook catalogue on the phone, on the story named in the table. Use the preview URL in the PR description (same-repo PRs only), or the local `pnpm run storybook` server reached over the LAN.

Two device classes, each a physical phone running its own system's default browser. No particular model is required.

| Class   | Browser          | Why it is separate                                                                    |
| ------- | ---------------- | ------------------------------------------------------------------------------------- |
| iPhone  | Safari (iOS)     | iOS Safari zooms a focused field (ADR Context); it also has its own safe areas.       |
| Android | Chrome (Android) | Chromium with the system's touch handling, gesture navigation and address-bar sizing. |

A check that lists both classes passes only when both pass. One that lists a single class does not need the other.

## Checks, one per binding rule

| ADR rule                                                                                                                              | Try on the phone                                                                                                                                                                                                                                                            | Pass when                                                                                                                                                                                           | Needs           |
| ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Pointer targets meet the minimum size and gap                                                                                         | Open the story of the changed component (`Forms/Checkbox`, `Forms/Radio`, `Forms/Switch`, `Navigation/Tabs`, `Controls/DateTimePicker`, …) and tap every control in it with a thumb, including the ones next to each other.                                                 | Each tap lands on the control you aimed at, never on a neighbour, and none needs a second try. Date picker days touch each other by design (ADR Consequences): there, aim at one day at a time.     | iPhone, Android |
| Editable fields use the input font size                                                                                               | Tap into each text field of `Forms/Field` and of any story with an input, then tap outside.                                                                                                                                                                                 | The page does not zoom or shift when the field is focused, and it is not left zoomed after you tap away.                                                                                            | iPhone          |
| Sliders use `touch-action: pan-y`, and tapping the track sets a value                                                                 | In `Forms/Slider` → `TouchSwipe` (the only story tall enough to scroll), start a vertical swipe on the slider control, then a vertical swipe on the track, then a horizontal drag, then a tap on the track.                                                                 | Both vertical swipes scroll the page and leave the value unchanged; the horizontal drag changes the value; the tap moves the thumb to that point.                                                   | iPhone, Android |
| Layouts reflow to the ADR's width without two-dimensional scrolling                                                                   | Load `Layout/Grid` and the stories of other layout components in portrait, on the narrowest phone you have. CI already asserts the ADR's width in `storybook-narrow`; the phone adds the real browser chrome.                                                               | Content scrolls in one direction only. No horizontal scroll bar or sideways drag appears; the date picker popover may scroll sideways only on a screen narrower than the ADR names.                 | iPhone, Android |
| Fixed-position UI respects the safe-area insets                                                                                       | Open `Overlays/Dialog`, `Overlays/Drawer` (each side) and `Overlays/Toast`, and the popups of `Overlays/Popover`, `Overlays/Tooltip`, `Actions/DropdownMenu`, `Forms/Select` and `Controls/DateTimePicker`, in portrait and in landscape, then scroll the page behind them. | No part of the Dialog, Drawer, Toast or popup sits under the notch, the home bar, the rounded corners or the system navigation bar, and the controls inside stay tappable.                          | iPhone, Android |
| A `Drawer` swipes closed under a real finger (the touch pipeline is outside ADR 0002's numbers, and emulation sends scripted touches) | Open `Overlays/Drawer` → `Left`, `Right`, and the default bottom drawer. Drag each toward its own edge slowly past halfway, then flick it, then drag it part way and let go. In `Left`, scroll its list with a thumb, starting the drag on the list.                        | The drawer follows the finger; a drag past halfway or a flick closes it, and an early release springs it back open. Scrolling the list never closes the drawer and the page behind does not scroll. | iPhone, Android |

The safe-area row is only meaningful where the page sets `viewport-fit=cover`: the browser reports non-zero insets only then (the catalogue's Getting started page shows the tag). The catalogue's own page does not set it, so on its stories this row can pass whatever the component does; run it in an app that opts in, or say so in the PR.

When the ADR changes what a rule requires (not only a number), update its row; a new binding rule gets a new row in the same PR.

## What an emulated test cannot show

CI runs the catalogue in Chromium: touch emulation in `storybook-coarse` and a 320px viewport in `storybook-narrow` (both in `vitest.config.ts`). That proves the styles are applied. It cannot show:

- **Focus zoom.** Whether iOS Safari zooms a focused field is WebKit's own decision; Chromium in CI does not do it, so a green test says nothing about it.
- **Where a finger lands.** Emulation taps an exact point. A real thumb covers an area and drifts, so only a phone shows whether a target and its gap are enough.
- **Scroll against drag.** Which gesture the browser hands to the page and which to the control, and the momentum that follows, belong to the real touch pipeline. Emulation sends scripted touch events.
- **Safe areas and browser chrome.** Emulation reports no notch or home bar unless the test sets them, and it has no collapsing address bar or system gesture area.

## Reporting it in a PR

The PR template's `Verification beyond CI` section is where this goes. Name the check and the device class, for example `Slider scroll check, iPhone Safari: pass`.

Without a phone, write `tested in emulation only`. That is a recognised answer: it tells the reviewer that the items above are unchecked.
