# ADR-003: External OIDC authentication (Zitadel)

**Status:** Accepted (superseded as **production default** by Ratary ADR-006 native auth, 2026-07-07)  
**Date:** 2026-07-06 · Updated 2026-07-07

> **Default path:** [../../auth/NATIVE-AUTH.md](../../auth/NATIVE-AUTH.md)  
> **This ADR remains valid** for enterprise OIDC federation — see [../../auth/OIDC-FEDERATION.md](../../auth/OIDC-FEDERATION.md).

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
