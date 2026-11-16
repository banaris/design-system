---
"@banaris/design-system": patch
---

Fix importing the package from a React Server Component, which failed `next build` for every export. The build now emits one module per component, and only the ones that need a client boundary (`Field`, `Toaster`, `Textarea`, `Dialog`, `DropdownMenu` and `Popover`, with their parts) carry `"use client"`. The static components stay server-renderable, so `<Icon icon={Check} />` works from a server component. `pnpm run check:rsc` keeps the boundaries from drifting.
