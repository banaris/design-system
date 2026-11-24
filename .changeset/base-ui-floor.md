---
"@banaris/design-system": patch
---

Raise the `@base-ui/react` floor from `^1.7.0` to `^1.9.0`, the version this package is built and tested against. Most public prop types are derived from Base UI's, so an older Base UI inside the range was an untested combination. `check:public-types` now compares the resolved public type surface with a committed snapshot, so adopting a Base UI release that changes it fails `verify` until the change is recorded here, instead of changing this package's API unrecorded.
