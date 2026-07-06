# ADR-005: Legacy API-key auth bridge

**Status:** Proposed  
**Date:** 2026-07-06  
**Context:** Phase 01 — Workspace Foundation

## Decision

Until Phase 04 OIDC ships, Studio keeps v0.1 **API-key authentication** behind `AuthPort` as `LegacyApiKeyAuthAdapter`:

- Wraps existing `auth-session.ts` + `verifyStudioCredentials`
- No change to operator workflows during Phase 01–03
- Feature flag `VITE_LEGACY_API_KEY_AUTH=true` for local dev / air-gapped bootstrap

Cutover: Phase 04 enables OIDC by default in production; legacy path dev-only unless owner extends parallel mode.

## Consequences

- `AuthSession` type includes optional `legacyApiKey` field removed at cutover.
- Documentation must state API-key login is **not** the long-term enterprise path.

## Alternatives

- **Remove API-key immediately:** rejected — breaks current Studio prod operator flow before Keycloak Studio client exists.
- **Dual auth permanently:** rejected — increases attack surface and UX confusion.
