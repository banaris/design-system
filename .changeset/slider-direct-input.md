---
"@banaris/design-system": minor
---

Let a `Slider` show a number input beside the track with `showInput`, so a value can be typed instead of dragged. The typed value is applied on Enter or blur, clamped to `min`/`max` and snapped to `step`; text that is not a number, or Escape, puts the current value back. `inputReadOnly` keeps the input visible but not editable, and `inputAriaLabel` names it (it defaults to `aria-label`).
