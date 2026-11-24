---
"@banaris/design-system": minor
---

A router's link can now stand in for the system's controls. `Button`, `IconButton` and `DropdownMenuLinkItem` accept Base UI's `render`, so `<Button render={<RouterLink to="/" />} nativeButton={false}>` draws a button-shaped link and `<DropdownMenuLinkItem render={<RouterLink to="/" />}>` navigates without a full page load. `Button` shows its `loading` spinner only while the rendered element is a native button; a link in `loading` still blocks interaction and sets `aria-busy`. The new `Link` component is an inline link in the accent text colour with a focus ring and hover and visited states in both themes, and takes `render` for a router link too. It is a plain function with no hooks, so a server component can render it.
