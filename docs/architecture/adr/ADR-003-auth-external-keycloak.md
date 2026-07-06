# ADR-003: External Keycloak authentication

**Status:** Proposed  
**Date:** 2026-07-06  
**Context:** Phase 01 — Workspace Foundation

## Decision

All user authentication flows through **`auth-ontorata`** (Keycloak). Studio is an OIDC public client (PKCE). Studio:

- Redirects to Keycloak for login
- Validates JWT via JWKS (`jose` or equivalent)
- Never implements password storage, MFA, or registration UI beyond redirect

Implementation lands in **Phase 04**; Phase 01 defines `AuthPort` only.

## Current state

Keycloak runs at `auth.ontorata.com` from `ratary/infra/keycloak` with realm `ratary` tuned for MCP OAuth. Studio integration requires a dedicated client (`studio-spa`) and likely a `studio` or `ontorata` realm.

## Consequences

- `LoginPage` API-key form becomes legacy/dev path, then removed or hidden behind feature flag.
- Studio `.env` gains `VITE_AUTH_ISSUER`, `VITE_AUTH_CLIENT_ID`, redirect URI config.

## Alternatives

- **Supabase Auth:** rejected — master prompt mandates Keycloak; Ratary MCP already uses KC.
- **Ratary bootstrap as login:** rejected — conflates identity with AI runtime credentials.
