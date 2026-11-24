---
"@banaris/design-system": minor
---

`DateTimePicker` takes `name`, `required` and `ref`. With a `name` it submits its value with the surrounding form as `YYYY-MM-DDTHH:mm` (an empty or malformed `value` submits an empty string), and `required` blocks a native submit while it is empty, focusing the picker's button. `ref` reaches the trigger button. It stays controlled-only.
