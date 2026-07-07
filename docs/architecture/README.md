# Studio architecture docs

**Last updated:** 2026-07-07 · Phases 01–20 shipped (MVP).

| Doc | Purpose |
|-----|---------|
| [auth/](auth/) | **Authentication** — architecture, native default, OIDC federation |
| [PHASES.md](../PHASES.md) | Phase index 01–20 |
| [PHASE-01-WORKSPACE-FOUNDATION.md](PHASE-01-WORKSPACE-FOUNDATION.md) | Layered module baseline |
| [SECURITY.md](SECURITY.md) | Token storage, CSP, boundaries |
| [adr/](adr/) | Architecture decision records |

## Current stack

| Layer | Technology |
|-------|------------|
| Identity (default) | Native auth — Studio → Auth Gateway → Ratary |
| Identity (enterprise) | OIDC federation (Zitadel, Azure AD, Okta, …) |
| Studio SPA | React 19 + Vite on Vercel |
| Data plane | Ratary REST via `@ratary/sdk` |
| Auth to Ratary | Native JWT · OIDC JWT (`STUDIO_OIDC_ENABLED`) · `aic_` API key |

## Phase status

| Range | Status |
|-------|--------|
| 01–06 | Foundation, auth, connection, shell — **done** |
| 07–16 | Operator features — **MVP done** |
| 17–20 | Org, observability, enterprise, security — **MVP done** |

Legacy Keycloak Docker stack is retired. Auth Gateway (`auth-ontorata`) is API-only. See [auth/AUTH-ARCHITECTURE.md](auth/AUTH-ARCHITECTURE.md) and Ratary ADR-006.
