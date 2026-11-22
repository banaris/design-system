---
"@banaris/design-system": minor
---

Make `Grid` reflow on narrow screens: below the `sm` breakpoint a grid is one column whatever its `columns`, so a 4-column grid no longer squeezes or overflows at 320px; from `sm` up the column counts are unchanged. `Popover` (and so `DateTimePicker`) and `SelectContent` now stay within the viewport width instead of reaching past its right edge on a narrow screen.
