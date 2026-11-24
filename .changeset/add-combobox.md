---
"@banaris/design-system": minor
---

A `Combobox` picks one value from a list the reader narrows by typing. It is built from `Combobox` (owns the value, the typed query and the open state; pass `items` so the list filters and the input shows labels), `ComboboxInput`, `ComboboxContent`, `ComboboxList`, `ComboboxItem` and `ComboboxEmpty`. The input has the same field, error and disabled styling as `Select` and works inside a `Field`; clicking it or pressing `ArrowDown` opens the list, `Escape` closes it, typed text that was not chosen is dropped when it closes, and emptying the input clears the chosen value. With no `ComboboxEmpty`, a list that has nothing to show is hidden and the input reports `aria-expanded="false"`. Free-text autocomplete, multiple selection, async loading and grouped options are not part of it.
