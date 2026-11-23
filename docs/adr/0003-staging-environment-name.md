# 0003 — The staging environment is named `stg`, matching the other Banaris repos

## Context

The staging Worker is deployed as `design-system-staging` with `wrangler deploy --name design-system-staging` (`.github/workflows/deploy.yml`). Issue #347 proposes declaring staging as a wrangler environment instead. No ADR covered the environment's name.

A wrangler environment deploys as a Worker named `<top-level-name>-<environment-name>`, served at `<worker-name>.<account-subdomain>.workers.dev`. The environment name therefore decides the Worker name and the URL, unless the environment sets `name` itself (`name` is an inheritable key).

Two things pull in different directions:

- Cloudflare's documentation uses `staging` in its examples (Wrangler Environments, Compare workflows).
- The other Banaris repos that deploy to Cloudflare already use `stg`: `banaris/timetracker` declares `env.stg` (`timetracker-stg`) and `banaris/website` declares `env.stg` (`website-stg`).

## Decision

The staging environment is named `stg`.

- `wrangler.json` declares `env.stg`, deployed with `wrangler deploy --env stg`.
- The Worker becomes `design-system-stg`; the old `design-system-staging` Worker is retired.
- The GitHub Environment and the workflow input value stay `staging`; they are CI labels, not wrangler names.

## Candidates

| Candidate                                    | Role here   | Why                                                                                                                                    |
| -------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `stg`                                        | Chosen      | One environment name across every Banaris repo that deploys to Cloudflare, so `--env stg` means the same thing everywhere.             |
| `staging`                                    | Not adopted | Matches Cloudflare's examples and keeps the current Worker name and URL, but would make this repo the only one using a different name. |
| `env.stg` with `name: design-system-staging` | Not adopted | Keeps the URL, but the Worker name would differ from the other repos' `<name>-stg`.                                                    |

## Consequences

- Issue #347 proceeds as written: the staging URL moves to `design-system-stg`, the old Worker is deleted, and the README line naming `design-system-staging` is updated.
- Anyone using the old staging URL must switch to the new one.
- The name departs from Cloudflare's documented examples; the `<name>-<environment>` rule they describe holds for any environment name.
- Revisit if the other repos move off `stg`, or if Cloudflare's guidance changes the convention.
