# Changesets

Each file here is one pending release note. A pull request that changes what a
consumer of `@banaris/design-system` gets — a component, a token, a style, the
exports map — adds one under `src/`'s change; CI fails a PR that touches `src/`
without one. A change nobody consuming the package can observe (CI, docs, tests,
stories, dependency bumps) adds none.

```sh
pnpm run changeset
```

Or write the file by hand, any name ending in `.md`:

```md
---
"@banaris/design-system": minor
---

Add a Badge component
```

- `minor` for a new capability, `patch` for a fix. Pre-1.0, a breaking change
  is also `minor`.
- The note is the changelog line, verbatim — write it for the person reading the
  release, not the reviewer.
- A `src/` change with nothing to announce (a refactor): `pnpm run changeset --empty`.

Merging it to `main` opens or updates the `Version Packages` pull request.
Merging that pull request publishes to npm, then creates the GitHub Release
from the version's `CHANGELOG.md` section.
