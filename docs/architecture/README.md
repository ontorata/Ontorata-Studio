# Studio architecture docs

**Last updated:** 2026-07-06 · Phases 01–20 shipped (MVP).

| Doc | Purpose |
|-----|---------|
| [PHASES.md](../PHASES.md) | Phase index 01–20 |
| [PHASE-01-WORKSPACE-FOUNDATION.md](PHASE-01-WORKSPACE-FOUNDATION.md) | Layered module baseline |
| [SECURITY.md](SECURITY.md) | Token storage, CSP, boundaries |
| [adr/](adr/) | Architecture decision records |

## Current stack

| Layer | Technology |
|-------|------------|
| Identity | Zitadel Cloud (OIDC PKCE) |
| Studio SPA | React 19 + Vite on Vercel |
| Data plane | Ratary REST via `@ratary/sdk` |
| Auth to Ratary | Zitadel JWT (`STUDIO_OIDC_ENABLED`) or `aic_` API key |

## Phase status

| Range | Status |
|-------|--------|
| 01–06 | Foundation, OIDC, connection, shell — **done** |
| 07–16 | Operator features — **MVP done** |
| 17–20 | Org, observability, enterprise, security — **MVP done** |

Legacy Keycloak (`auth` repo) is not used in Studio production; see ADR-003.
