# Real-device checks for the mobile rules

[ADR 0002](adr/0002-design-guidelines.md) makes the mobile rules binding and says "real-device checks cover what emulation cannot show". This page is that list: what to try on a phone, what counts as a pass, and which phone it needs. Use it when a change touches a component's size, spacing, input, scroll, layout or fixed positioning.

The numbers (target size, gap, font size, reflow width) live in the ADR's Decision section and are not repeated here, so a change to a number never leaves this page stale.

## Setup

Open the Storybook catalogue on the phone, on the story named in the table. Use either the catalogue deployed from the branch or `main` (`.github/workflows/deploy.yml`, ADR 0003 for the staging name), or the local `pnpm run storybook` server reached over the LAN.

Two device classes, each a physical phone running its own system's default browser. No particular model is required.

| Class   | Browser          | Why it is separate                                                                    |
| ------- | ---------------- | ------------------------------------------------------------------------------------- |
| iPhone  | Safari (iOS)     | iOS Safari zooms a focused field (ADR Context); it also has its own safe areas.       |
| Android | Chrome (Android) | Chromium with the system's touch handling, gesture navigation and address-bar sizing. |

A check that lists both classes passes only when both pass. One that lists a single class does not need the other.

## Checks, one per binding rule

| ADR rule                                                              | Try on the phone                                                                                                                                                                                        | Pass when                                                                                                                                                                                                    | Needs           |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| Pointer targets meet the minimum size and gap                         | In `Foundations/Coarse pointer`, tap every control of the changed component with a thumb, including the ones next to each other (Checkbox, Radio, Switch, Tabs, the days in `Controls/DateTimePicker`). | Each tap lands on the control you aimed at, never on a neighbour, and none needs a second try. The date picker days' waived gap (ADR Consequences) is the one place a neighbour tap is expected to be tight. | iPhone, Android |
| Editable fields use the input font size                               | Tap into each text field of `Forms/Field` and of any story with an input, then tap outside.                                                                                                             | The page does not zoom or shift when the field is focused, and it is not left zoomed after you tap away.                                                                                                     | iPhone          |
| Sliders use `touch-action: pan-y`, and tapping the track sets a value | In `Forms/Slider`, start a vertical swipe on the slider control, then a vertical swipe on the track, then a horizontal drag, then a tap on the track.                                                   | The vertical swipe scrolls the page and leaves the value unchanged; the horizontal drag changes the value; the tap moves the thumb to that point.                                                            | iPhone, Android |
| Layouts reflow to the ADR's width without two-dimensional scrolling   | In `Layout/Grid` and any story using a layout component, load the story on the phone (the narrowest one you have), in portrait.                                                                         | Content scrolls in one direction only; no horizontal scroll bar or sideways drag appears, apart from the date picker popover the ADR names.                                                                  | iPhone, Android |
| Fixed-position UI respects the safe-area insets                       | Open `Overlays/Dialog` and `Overlays/Toast` in portrait and in landscape, then scroll the page behind them.                                                                                             | No part of the Dialog or Toast sits under the notch, the home bar, the rounded corners or the system navigation bar, and the controls inside stay tappable.                                                  | iPhone, Android |

A rule changes shape → change its row. A new binding rule in the ADR → add a row in the same PR.

## What an emulated test cannot show

CI runs the catalogue in Chromium with touch emulation (the `storybook-coarse` and `storybook-narrow` projects in `vitest.config.ts`). That proves the styles are applied. It cannot show:

- **Focus zoom.** Whether iOS Safari zooms a focused field is WebKit's own decision; the Chromium CI runs does not do it, so a green test says nothing about it.
- **Where a finger lands.** Emulation taps an exact point. A real thumb covers an area and drifts, so only a phone shows whether a target and its gap are enough.
- **Scroll against drag.** Which gesture the browser hands to the page and which to the control, and the momentum that follows, belong to the real touch pipeline. Emulation sends scripted touch events.
- **Safe areas and browser chrome.** Emulation reports no notch or home bar unless the test sets them, and it has no collapsing address bar or system gesture area.

## Reporting it in a PR

The PR template's `Verification beyond CI` section is where this goes, and it is unchanged. Name the check and the device class, for example `Slider scroll check, iPhone Safari: pass`.

Without a phone, write `tested in emulation only`. That is a recognised answer: it tells the reviewer that the four things above are unchecked.

Not in scope: automating real devices and a device lab. This page is a manual list.
