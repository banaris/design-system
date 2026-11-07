---
"@banaris/design-system": minor
---

Add `Dialog`, `Popover`, `Tooltip`, `Toaster` (with `ToastProvider` and `useToast`), `Tabs`, `Badge`, `Alert` and `Spinner`. Overlays stack at `--z-overlay` and toasts at `--z-toast`, and their motion follows `--duration-*`, so `prefers-reduced-motion` applies. `Button`'s loading state now renders the exported `Spinner`.
