# OIDC Federation (Enterprise)

**Status:** Supported enterprise path — **not** the production default (see [NATIVE-AUTH.md](./NATIVE-AUTH.md))  
**Authority:** [AUTH-ARCHITECTURE.md](./AUTH-ARCHITECTURE.md) · Studio ADR-003 (historical)

---

## When to use OIDC

Enable OIDC federation when customers require:

- **SSO** with corporate identity
- **Azure AD** / **Microsoft Entra ID**
- **Google Workspace**
- **Okta**
- **Zitadel Cloud** (or other OIDC-compliant IdP)

Native auth remains the default for greenfield and self-serve deployments. OIDC is a **configuration switch**, not a separate product.

---

## Architecture with OIDC

```
                 User
                  |
                  v
          Ontorata Studio
                  |
         +--------+---------+
         |                  |
    Native Auth         OIDC PKCE
    (default)          (enterprise)
         |                  |
         v                  v
    Auth Gateway      Enterprise IdP
         |            (Zitadel, Azure,
         v             Okta, ...)
      Ratary                  |
         +----------+----------+
                    |
                    v
                Ratary Core
```

When `VITE_AUTH_ISSUER` is set and native auth is not forced, Studio uses `OidcAuthAdapter` (PKCE, `oidc-client-ts`).

---

## Studio configuration

```env
VITE_AUTH_ISSUER=https://<your-idp>/
VITE_AUTH_CLIENT_ID=<spa-client-id>
VITE_RATARY_BASE_URL=https://ratary.ontorata.com
```

Do **not** set `VITE_AUTH_BASE_URL` when using OIDC-only mode (or set `VITE_NATIVE_AUTH=false` explicitly if both are present during migration).

Redirect URIs (SPA):

```
https://studio.ontorata.com/callback
http://localhost:8765/callback
http://localhost:8766/callback
```

---

## Ratary configuration

```env
STUDIO_OIDC_ENABLED=true
OIDC_ISSUER_URL=https://<same-issuer-as-studio>
```

Ratary validates the IdP access token via userinfo/JWKS and auto-provisions per-user `ownerId`.

---

## Zitadel-specific setup

Zitadel is one supported IdP. Step-by-step console setup:

→ [legacy/ZITADEL.md](./legacy/ZITADEL.md)

---

## Future: OIDC via Auth Gateway

ADR-006 reserves the Auth Gateway as the credential boundary. Future work may terminate OIDC at the gateway (token exchange, unified audit) without changing Ratary data APIs.

Current implementation: Studio talks **directly** to IdP for OIDC; Auth Gateway serves **native** path only.

---

## Migration: OIDC → Native

| Step | Action |
|------|--------|
| 1 | Deploy Ratary with `NATIVE_AUTH_ENABLED=true` |
| 2 | Deploy Auth Gateway |
| 3 | Remove `VITE_AUTH_ISSUER` from Studio Vercel |
| 4 | Set `VITE_AUTH_BASE_URL=https://auth.ontorata.com` |
| 5 | Redeploy Studio; users re-register or migrate accounts |

Enterprise tenants on dedicated IdP: keep OIDC until tenant migration planned.

---

## Related

| Doc | Purpose |
|-----|---------|
| [legacy/ZITADEL.md](./legacy/ZITADEL.md) | Zitadel Cloud setup |
| [../architecture/adr/ADR-003-auth-external-keycloak.md](../architecture/adr/ADR-003-auth-external-keycloak.md) | ADR-003 (Zitadel) |
| [../architecture/adr/ADR-004-connection-wizard-gate.md](../architecture/adr/ADR-004-connection-wizard-gate.md) | Connection wizard vs OIDC auto-connect |
| [NATIVE-AUTH.md](./NATIVE-AUTH.md) | Default path |
