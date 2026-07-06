# Zitadel setup for Ontorata Studio

Production identity for multi-user Studio (GitHub, Google, email) without self-hosted Keycloak.

## 1. Zitadel Console

1. Open your instance (e.g. `https://<name>-<id>.zitadel.cloud`)
2. **Projects** → create or use project **Ontorata**
3. **Applications** → **New** → type **User Agent** (SPA)
4. Auth method: **PKCE**
5. **Development mode**: ON (required for `http://localhost:8765` during dev)

### Redirect URIs (exact match)

```
http://localhost:8765/callback
https://studio.ontorata.com/callback
```

### Post-logout redirect URIs

```
http://localhost:8765/login
https://studio.ontorata.com/login
```

Copy **Client ID** and **Issuer** (instance URL).

## 2. Social login (GitHub + Google)

**Settings** → **Identity Providers** → add:

| Provider | Notes |
|----------|--------|
| **Google** | OAuth client from Google Cloud Console |
| **GitHub** | OAuth App from GitHub Developer Settings |

Callback URLs use Zitadel’s IdP callback — follow Zitadel wizard for each provider.

## 3. Vercel environment variables

**Project → Settings → Environment Variables** (Production):

| Variable | Example |
|----------|---------|
| `VITE_AUTH_ISSUER` | `https://<instance>.zitadel.cloud` |
| `VITE_AUTH_CLIENT_ID` | `<client-id>` |
| `VITE_RATARY_BASE_URL` | `https://ratary.ontorata.com` |

Redeploy after saving.

**Important:** Issuer is the Zitadel **instance URL**, not Keycloak-style `/realms/ontorata`.

## 4. Local dev

```env
# Ontorata-Studio/.env.local
VITE_AUTH_ISSUER=https://<instance>.zitadel.cloud
VITE_AUTH_CLIENT_ID=<client-id>
VITE_RATARY_BASE_URL=http://localhost:9876
```

```bash
npm run dev   # http://localhost:8765
```

## 5. Smoke test

After deploy, open `https://studio.ontorata.com` → **Sign in** → Zitadel login → GitHub/Google → redirect to `/callback` → `/connect`.

> **Note:** Connection wizard still asks for Ratary API key until Phase 2 (JWT per-user Ratary) ships.

## 6. Zitadel discovery URL

```
https://<instance>.zitadel.cloud/.well-known/openid-configuration
```

Should return `issuer`, `authorization_endpoint`, `token_endpoint`.
