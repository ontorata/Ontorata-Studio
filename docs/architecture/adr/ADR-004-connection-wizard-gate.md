# ADR-004: Connection wizard gate

**Status:** Accepted  
**Date:** 2026-07-06 · Updated 2026-07-06

## Decision

Users **must not** enter workspace routes without an active Ratary connection:

| Auth path | Connection |
|-----------|------------|
| OIDC + cloud Ratary | Auto — Zitadel access token (`isOidcCloudAutoConnect`) |
| Legacy API key | Inline session credentials |
| Self-hosted | `/connect` wizard with `aic_...` validation |

Validation checks health + capabilities via `@ratary/sdk`.

## Route guard chain

`authenticated → connected → workspace`

`ConnectionGate` + `StudioClientProvider` enforce this.

## Phase 17 note

Organization workspace pre-provision from OIDC org claims is **partial** — `OrganizationPage` lists Ratary workspaces; full org URL mapping is future work.
