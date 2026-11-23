# 0002 — Guidelines: WCAG 2.2 AA is the floor, APG is the behaviour reference, mobile rules are our own

## Context

The package had no recorded guideline. Consumers are dense form UIs (a settings panel with a dozen sliders) opened on desktop and on phones, so phones are a first-class target. Reading `src` showed gaps a guideline would have caught:

- Text inputs use `text-base`, which is 14px; iOS Safari zooms a focused input below 16px.
- `Checkbox` and `Radio` are 20px, below the 24px WCAG 2.2 AA target size (SC 2.5.8) unless the spacing exception applies.
- The `Slider` control is `touch-none`, so a vertical scroll that starts on a slider does not scroll.
- `Grid` has fixed 1–4 columns and does not reflow; `Dialog` and `Toast` ignore safe-area insets.

The owner chose to adopt a guideline stack, accepting changes to existing components.

## Decision

Three layers, strongest first:

1. **WCAG 2.2 AA is mandatory.** Relevant criteria: 1.4.10 Reflow (320 CSS px), 2.5.7 Dragging Movements (a single-pointer alternative to dragging), 2.5.8 Target Size (Minimum).
2. **WAI-ARIA Authoring Practices is the reference for keyboard and ARIA behaviour.** Base UI supplies the headless behaviour; this layer decides what we check it against.
3. **Banaris mobile rules are binding.** They go beyond AA where a phone needs it:
   - On `any-pointer: coarse`, every pointer target is at least 44×44 CSS px (by size or an expanded hit area) with at least 8px between targets. Desktop density is unchanged.
   - On `any-pointer: coarse`, editable fields have a computed `font-size` of at least 16px, through a separate input token.
   - Slider controls use `touch-action: pan-y`, and a value can be set by tapping the track.
   - Layouts reflow to 320 CSS px without two-dimensional scrolling; `Grid` columns reduce on narrow widths.
   - Fixed-position UI (`Dialog`, `Toast`) respects `env(safe-area-inset-*)`.
   - CI checks the built `styles.css` under mobile emulation, and real-device checks cover what emulation cannot show.

Material Design 3, Apple HIG, Primer, Carbon and Fluent are references, not requirements; we borrow a rule from one only through this ADR.

The switch is `any-pointer: coarse`, not width and not a size variant the caller picks.

## Candidates

| Candidate                            | Role here      | Why                                                                                                                                                                                                                                                                                   |
| ------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WCAG 2.2 AA + APG + own mobile rules | Chosen         | The floor is an external standard; the numbers beyond it stay ours to change.                                                                                                                                                                                                         |
| Material Design 3 in full            | Reference only | The web library is in maintenance mode and M3 Expressive is not implemented on web. Google states Expressive is not a new version and not "M4". Its 48dp targets and breakpoint classes are reachable from the sources above. Adopting it would also replace our palette and density. |
| Apple HIG / Liquid Glass             | Reference only | Argues from Apple platform behaviour and has no web component package; the 44pt target matches our 44px choice.                                                                                                                                                                       |
| Primer                               | Reference      | A mobile responsive reference. It avoids pointer media queries as unreliable and picks a larger size variant instead; we chose `any-pointer: coarse` (below).                                                                                                                         |
| Carbon, Fluent                       | Reference      | Dense-form and density-mode references.                                                                                                                                                                                                                                               |
| WCAG 3.0                             | Not adopted    | Still a working draft; W3C advises meeting WCAG 2.2 now.                                                                                                                                                                                                                              |

## Consequences

- `any-pointer: coarse` can misjudge a device (a phone with a mouse attached, a touch laptop). A misjudgement makes controls larger than needed; it never removes the ability to operate them. A size variant the caller picks stays possible later.
- `Checkbox`, `Radio`, `Switch` and the `Slider` control grow on coarse devices; the 44px rule applies to the target, not the drawn glyph.
- Calendar days in `DateTimePicker` touch each other: seven 44px days are 308px wide, so the 8px gap is waived between them; on a screen narrower than that the popover scrolls sideways.
- Not measured yet: iOS focus zoom at 14px, real tap areas, and whether `pan-y` on the Base UI slider stops a vertical scroll from changing the value. Each implementation issue carries a real-device check.
- Review when WCAG 3.0 becomes a W3C Recommendation, or when Material Web resumes feature work.
- `DateTimePicker` (#302) takes the touch-target, reflow and safe-area rules as acceptance criteria.
