# ADR-003: External OIDC authentication (Zitadel)

**Status:** Accepted  
**Date:** 2026-07-06 · Updated 2026-07-06 (Zitadel production)

## Decision

All production user authentication flows through **Zitadel Cloud** (OIDC). Studio is a public SPA client (PKCE). Studio:

- Redirects to Zitadel for login
- Stores access token in sessionStorage (`oidc-client-ts`)
- Never implements password storage or registration UI

Legacy **Keycloak** (`auth` repo) remains for MCP OAuth experiments; Studio production uses Zitadel.

## Implementation

- Phase 04: `OidcAuthAdapter`, `/callback`, CSP for `*.zitadel.cloud`
- Phase 02 extension: Ratary `STUDIO_OIDC_ENABLED` — JWT per user, no `aic_` wizard

## Consequences

- `VITE_AUTH_ISSUER`, `VITE_AUTH_CLIENT_ID` on Vercel
- Legacy API-key login when `VITE_AUTH_ISSUER` unset (local dev)

## Alternatives

- **Keycloak self-host:** deferred — Zitadel Cloud chosen for zero-ops
- **Ratary bootstrap as login:** rejected — conflates identity with AI credentials
