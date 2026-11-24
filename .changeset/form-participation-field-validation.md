---
"@banaris/design-system": minor
---

`Field` now accepts Base UI's `invalid`, `validate`, `validationMode` and `validationDebounceTime`, and `FieldError` accepts `match`, so the browser's own validation messages (a `required` or `type="email"` control, or a `validate` function) show in a `Field` without a hand-passed `error` string; set `validationMode` to `"onBlur"` or `"onChange"` to see them outside a Base UI `Form`. The `error` string still works as before.
