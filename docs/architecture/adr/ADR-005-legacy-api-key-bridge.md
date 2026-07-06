# ADR-005: Legacy API-key auth bridge

**Status:** Accepted  
**Date:** 2026-07-06 · Updated 2026-07-06

## Decision

Studio supports **dual auth** in production:

1. **Primary:** Zitadel OIDC → cloud Ratary JWT (no API key)
2. **Secondary:** Legacy API-key login + `/connect` wizard for self-hosted Ratary

`LegacyApiKeyAuthAdapter` wraps `auth-session.ts` when `VITE_AUTH_ISSUER` is unset.

## Consequences

- `AuthSession` may include `legacyApiKey` or `accessToken`
- `/connect` retained for advanced operators (Phase 19 enterprise path)
- Production Vercel: OIDC only; no `VITE_RATARY_API_KEY`

## Future

Remove legacy login from production build when all operators use Zitadel (Phase 20 checklist).
