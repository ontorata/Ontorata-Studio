# Security architecture

**Status:** Active — Phases 04–20  
**Last updated:** 2026-07-06

## Principles

1. **Privacy by design** — Studio never uploads memory, embeddings, or chat history to Studio servers (static SPA).
2. **API-first** — AI data flows browser → Ratary via `@ratary/sdk`.
3. **Least privilege** — OIDC for identity; Ratary enforces owner scope per user.
4. **No proxy** — Vercel serves static assets only.

## Storage

| Data | Storage | Notes |
|------|---------|-------|
| OIDC tokens | sessionStorage | Tab-scoped, `oidc-client-ts` |
| AIC (persistent mode) | Obfuscated connection store | Phase 05 wizard |
| Profiles / stacks / agent configs | localStorage | No secrets |
| Chat messages | React state only | Not persisted (Phase 07) |
| AI memory content | **Forbidden** in Studio | Ratary only |

## Production headers

Configured in `vercel.json`:

- Content-Security-Policy including `https://*.zitadel.cloud`
- `Referrer-Policy: strict-origin-when-cross-origin`

## SDK boundary

- `fetch` / Ratary calls only in `infrastructure/ratary/`
- Enforced by `scripts/check-sdk-boundary.mjs` in `npm run lint`

## Checklist UI

`/workspace/:id/security` — Phase 20 live checklist (OIDC, CSP, `STUDIO_OIDC_ENABLED`).

See ADR-003, ADR-004, ADR-005, [ZITADEL-SETUP.md](../ZITADEL-SETUP.md).
