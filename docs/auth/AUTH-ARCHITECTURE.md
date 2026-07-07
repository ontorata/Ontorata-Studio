# Ontorata Authentication Architecture

**Last updated:** 2026-07-07  
**Authority:** [Ratary ADR-006](../../../ai-brain/.ai/core/adr/ADR-006-native-auth-gateway.md) · [Engineering Constitution](../../../ai-brain/.ai/core/constitution/ENGINEERING-CONSTITUTION.md)

---

## Overview

Ontorata uses a **three-tier authentication architecture**. Auth is a **boundary service** — not the AI data plane.

```
                 User
                  |
                  v
          Ontorata Studio
        (SPA · inline login UI)
                  |
                  |  VITE_AUTH_BASE_URL
                  v
          Auth Gateway
       auth.ontorata.com
     (register · login · audit)
                  |
                  |  RATARY_BASE_URL (server-side)
                  v
              Ratary Core
        ratary.ontorata.com
    (native auth · JWT · owner_id)
                  |
                  v
         Memory · Knowledge
         Agents · MCP · REST
```

Studio never stores passwords. Auth Gateway never stores user data. Ratary owns `auth_accounts`, JWT issuance, and `owner_id` isolation.

---

## Authentication modes

| Mode | Default? | Studio env | Use case |
|------|----------|------------|----------|
| **Native** | ✅ Production | `VITE_AUTH_BASE_URL` | Email/password via Auth Gateway |
| **OIDC federation** | Enterprise option | `VITE_AUTH_ISSUER` | SSO (Zitadel, Azure AD, Okta, …) |
| **Legacy API key** | Self-hosted dev | unset issuer + `aic_` key | Private Ratary, `/connect` wizard |

Priority in code (`create-auth-port.ts`): **native → OIDC → legacy API key**.

See [NATIVE-AUTH.md](./NATIVE-AUTH.md) · [OIDC-FEDERATION.md](./OIDC-FEDERATION.md).

---

## Repositories

| Repo | Role | Deploy |
|------|------|--------|
| [Ontorata-Studio](https://github.com/ontorata/Ontorata-Studio) | UI + session client | `studio.ontorata.com` |
| [auth](https://github.com/ontorata/auth) | Auth Gateway (API only) | `auth.ontorata.com` |
| [ratary](https://github.com/ontorata/ratary) | Auth implementation + data | `ratary.ontorata.com` |

---

## Security boundaries

| Layer | Responsibility |
|-------|----------------|
| **Studio** | Render login UI; store bearer token (sessionStorage); never see raw password after submit |
| **Auth Gateway** | HTTPS, CORS, rate limits, structured audit JSON |
| **Ratary** | Password hash (scrypt), JWT sign/verify, `owner_id` scope on all data |

---

## Workspace scoping

Each native registration receives:

- Unique `owner_id`
- Unique `identity_id`
- Default workspace (UUID, slug `default`)

Studio must use the **Ratary-provisioned `workspaceId`** — not the placeholder `personal-default` URL segment. Returned on register/login responses.

---

## Enterprise positioning

| Capability | Native (now) | OIDC federation (enterprise) |
|------------|--------------|------------------------------|
| Email/password | ✅ | Via IdP |
| Google / GitHub SSO | — | ✅ via IdP |
| Azure AD / Okta | — | ✅ via OIDC |
| Audit at credential edge | ✅ Auth Gateway | ✅ IdP + Auth optional |
| Per-tenant IdP | — | ✅ `VITE_AUTH_ISSUER` per deploy |

Zitadel is **one valid OIDC provider**, not the default path. See [legacy/ZITADEL.md](./legacy/ZITADEL.md).

---

## Observability (current → next)

**Current:** Auth Gateway emits JSON audit lines to stdout (`auth.register`, `auth.login`).

**Next phase (not blocker):**

```
Auth Gateway → Audit Event → Event Pipeline → Log Storage → SIEM / Monitoring
```

---

## Related documents

| Doc | Purpose |
|-----|---------|
| [NATIVE-AUTH.md](./NATIVE-AUTH.md) | Production setup (native default) |
| [OIDC-FEDERATION.md](./OIDC-FEDERATION.md) | Enterprise SSO path |
| [legacy/ZITADEL.md](./legacy/ZITADEL.md) | Zitadel-specific setup (legacy doc) |
| [../architecture/adr/ADR-003-auth-external-keycloak.md](../architecture/adr/ADR-003-auth-external-keycloak.md) | Historical OIDC ADR |
| [../architecture/SECURITY.md](../architecture/SECURITY.md) | Token storage, CSP |
