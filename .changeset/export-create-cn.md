---
"@banaris/design-system": minor
---

Add `createCn(extend?)`, a `cn` that merges Tailwind classes with the package's tokens (`text-body`, `text-small`, `rounded-shell`, `shadow-raised`, …) and the ones you add. A `cn()` of your own on stock `tailwind-merge` misreads these tokens: `text-small` drops `text-ink`, and `rounded-shell` does not replace `rounded-md`. `createCn({ theme: { text: ["tiny"] } })` takes `tailwind-merge`'s own `extend` option, merged on top of the package's configuration. `check:tw-merge` now measures `createCn()` and a consumer-defined token as well as the internal instance.
