---
"@banaris/design-system": minor
---

Raise the font size of `TextField`, `Textarea`, `Select`, `DateTimeField` and the typed inputs of `DateTimePicker` to 16px on touch devices (`any-pointer: coarse`) so iOS Safari no longer zooms the page when one is focused. Desktop stays 14px. The new `text-input` type step (`--text-input`) carries the size and is the one to use on your own editable fields; `--text-base` is unchanged.
