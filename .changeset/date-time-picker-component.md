---
"@banaris/design-system": minor
---

Add `DateTimePicker`, a popup with a calendar, typed date, hour and minute inputs, and `Cancel` / `Apply`. Its required `onClose` reports `{ outcome: "dismissed" }` or `{ outcome: "applied", value }`, so a form can tell how it was closed. `PopoverContent` gains `portalContainer` for rendering inside a native modal `<dialog>`.
