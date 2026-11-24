---
"@banaris/design-system": minor
---

A `Drawer` slides in from the bottom edge or from the left or right, for a secondary task or a menu on a phone. It has the same parts as `Dialog` (`Drawer`, `DrawerTrigger`, `DrawerContent`, `DrawerTitle`, `DrawerDescription`, `DrawerClose`); `DrawerContent` takes `side` (`"bottom"`, `"left"` or `"right"`, default `"bottom"`) to choose the edge. It keeps the `--ds-edge-*` gap from the screen edges and the notch, closes on `Escape`, an outside press, `DrawerClose` or a swipe toward its edge, and returns focus to its trigger. Snap points and nested drawers are not part of it.
