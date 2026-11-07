---
"@banaris/design-system": patch
---

Stop `Spinner`, and the `Button` loading indicator that renders it, from rotating under `prefers-reduced-motion: reduce`. The static ring stays visible and `Spinner` keeps its `status` role.
