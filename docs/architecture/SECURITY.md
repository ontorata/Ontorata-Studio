# Security architecture (scaffold)

**Status:** Draft — expanded per phase  
**Phase 01:** policy checklist only

## Principles

1. **Privacy by design** — Studio never uploads memory, embeddings, prompts, or conversations.
2. **API-first** — all AI data flows browser → Ratary directly (Bearer AIC).
3. **Least privilege** — JWT roles for UI; AIC scopes from Ratary for AI operations.
4. **No proxy** — Studio does not mirror or cache Ratary AI payloads server-side (static SPA).

## Storage classes

| Data | Allowed storage | Phase |
|------|-----------------|-------|
| OIDC tokens | sessionStorage or memory; refresh strategy TBD | 04 |
| AIC (persistent mode) | Encrypted IndexedDB / Web Crypto | 05 |
| Connection metadata | localStorage or IndexedDB (no secrets plaintext) | 05 |
| AI memory/content | **Forbidden** in Studio | — |

## Headers (production)

- Content-Security-Policy (strict, no inline scripts in prod build)
- `Referrer-Policy: strict-origin-when-cross-origin`
- HSTS at CDN (Vercel)

## Lint rules (Phase 01)

- `fetch` only in `infrastructure/ratary/`
- No `localStorage` for credentials (eslint custom rule or grep in CI)

See ADR-003, ADR-004, ADR-005.
