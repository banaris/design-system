---
"@banaris/design-system": minor
---

Keep the `Popover`, `Tooltip`, `DropdownMenu`, `Select` and `DateTimePicker` popups clear of the device safe-area insets: with `viewport-fit=cover` set on the page, they no longer open under the notch, the home indicator or a landscape cutout. With zero insets nothing moves. `Tooltip` and `SelectContent` now carry a `"use client"` boundary, as `Popover` and `DropdownMenu` already did.
