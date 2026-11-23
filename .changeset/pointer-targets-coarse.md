---
"@banaris/design-system": minor
---

Make every pointer target at least 44×44 CSS px on touch devices (`any-pointer: coarse`), with 8px between neighbours inside a component, as ADR 0002 requires. This covers `Button` (every size), `IconButton`, `Checkbox`, `Radio`, `Switch`, the `Slider` control, `Tabs` triggers, the editable fields and the `Select` trigger, `DropdownMenu` and `Select` items, `Dialog` close controls, the `DateTimePicker` calendar days and the `Toast` buttons. Desktop sizes are unchanged.

`touch-target` is the one place the 44px floor is defined; use it on your own interactive elements. `Checkbox`, `Radio` and `Switch` now take the press on their root and draw the box in its first child, so the drawn box keeps its size while the target grows; a `className` still lands on the root, but a rule that styled the root's border or background must now reach that child. `DropdownMenu` and `SelectContent` popups space their items 8px apart on touch devices, and `DateTimePicker`'s popover is a little wider there so seven 44px days fit.
