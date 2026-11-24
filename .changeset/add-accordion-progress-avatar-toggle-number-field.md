---
"@banaris/design-system": minor
---

Five components are added. `Accordion` (with `AccordionItem`, `AccordionTrigger` and `AccordionPanel`) stacks sections that open in place; `multiple` lets several be open at once. `Progress` shows how far along some work is, takes `label` and `showValue`, and is indeterminate when `value` is `null`. `Avatar` shows a picture from `src` and falls back to its `children`, usually initials, while the picture loads or if it fails; `aria-label` names it. `Toggle` is a button that stays pressed or not, with `size`. `NumberField` is a number input with buttons that step the value, and reads typed text in the user's locale. All of them use the system's tokens, focus ring and touch-target size, and the "Choosing a component" guide says when to pick each over a neighbour.
