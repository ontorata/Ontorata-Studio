# Zitadel Setup (Legacy / Enterprise OIDC)

> **Note:** This document is preserved for enterprise customers using **Zitadel Cloud** as their OIDC provider.  
> **Production default** is now [native auth](../NATIVE-AUTH.md).  
> Canonical copy moved from `docs/ZITADEL-SETUP.md` — that file remains as a redirect stub.

Production identity for multi-user Studio (GitHub, Google, email) via Zitadel — **OIDC federation path**, not the native default.

---

## 1. Zitadel Console

1. Open your instance (e.g. `https://<name>-<id>.zitadel.cloud`)
2. **Projects** → create or use project **Ontorata**
3. **Applications** → **New** → type **User Agent** (SPA)
4. Auth method: **PKCE**
5. **Development mode**: ON (required for `http://localhost:8765` during dev)

### Redirect URIs (exact match)

Add each URI with **Enter/+** to create chips before Save:

```
http://localhost:8765/callback
http://localhost:8766/callback
https://studio.ontorata.com/callback
```

### Post-logout redirect URIs

```
http://localhost:8765/login
http://localhost:8766/login
https://studio.ontorata.com/login
```

Copy **Client ID** and **Issuer** (instance URL, not `/oauth/v2/authorize`).

## 2. Social login (GitHub + Google)

**Settings** → **Identity Providers** → add Google and/or GitHub OAuth apps. Follow Zitadel wizard for callback URLs.

## 3. Vercel environment variables (Studio)

| Variable | Example |
|----------|---------|
| `VITE_AUTH_ISSUER` | `https://auth-ql6ohn.au1.zitadel.cloud` |
| `VITE_AUTH_CLIENT_ID` | `380602682651525738` |
| `VITE_RATARY_BASE_URL` | `https://ratary.ontorata.com` |

Redeploy after saving. See [OIDC-FEDERATION.md](../OIDC-FEDERATION.md) for architecture context.

## 4. Ratary server (required for OIDC data plane)

On Ratary production (or local `.env`):

```env
STUDIO_OIDC_ENABLED=true
OIDC_ISSUER_URL=https://auth-ql6ohn.au1.zitadel.cloud
```

Redeploy Ratary. Studio sends Zitadel **access token** as `Authorization: Bearer` — Ratary validates via userinfo and auto-provisions per-user `ownerId`.

## 5. Local dev

```env
# Ontorata-Studio/.env.local
VITE_AUTH_ISSUER=https://<instance>.zitadel.cloud
VITE_AUTH_CLIENT_ID=<client-id>
VITE_RATARY_BASE_URL=http://localhost:9876
```

```bash
npm run dev   # http://localhost:8765
```

## 6. Smoke test

1. Open `https://studio.ontorata.com` → **Sign in**
2. Zitadel login (GitHub/Google/email)
3. Redirect `/callback` → workspace
4. Dashboard shows health + capabilities
5. Create a memory under **Memories**

## 7. Advanced / self-hosted

Users with a private Ratary instance can open **`/connect`** and paste `aic_...` API key (Phase 05 wizard). OIDC cloud users skip this path.

## 8. Discovery URL

```
https://<instance>.zitadel.cloud/.well-known/openid-configuration
```

## Related

- [OIDC-FEDERATION.md](../OIDC-FEDERATION.md)
- [AUTH-ARCHITECTURE.md](../AUTH-ARCHITECTURE.md)
- [../../architecture/adr/ADR-003-auth-external-keycloak.md](../../architecture/adr/ADR-003-auth-external-keycloak.md)
- [../../PHASES.md](../../PHASES.md)
