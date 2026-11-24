---
"@banaris/design-system": minor
---

An `Autocomplete` is a text field that suggests options while the reader types and keeps whatever text they enter. Its value is the typed text (`value`, `defaultValue`, `onValueChange`); pass `items` so the suggestions filter by that text, and choosing one puts its label in the input. It is built from `Autocomplete`, `AutocompleteInput` and `AutocompleteItem`, and reuses `ComboboxContent`, `ComboboxList` and `ComboboxEmpty` for the popup. The input has the same field, error and disabled styling as `Combobox` and `TextField` and works inside a `Field`; `ArrowDown` opens the list and `Escape` closes it. Multiple values, async loading and grouped options are not part of it.
