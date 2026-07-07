# Native Authentication (Production Default)

**Status:** Production default path (2026-07-07)  
**Authority:** [AUTH-ARCHITECTURE.md](./AUTH-ARCHITECTURE.md) · Ratary ADR-006

---

## Flow

```
Studio (email/password form)
    → POST https://auth.ontorata.com/api/v1/auth/register|login
        → Auth Gateway (audit + rate limit + CORS)
            → POST https://ratary.ontorata.com/api/v1/auth/register|login
                → Ratary (auth_accounts, JWT, owner_id, workspaceId)
```

Studio stores the returned bearer token in **sessionStorage** and calls Ratary data APIs with `Authorization: Bearer`.

---

## Production environment

### Studio (Vercel)

```env
VITE_AUTH_BASE_URL=https://auth.ontorata.com
VITE_RATARY_BASE_URL=https://ratary.ontorata.com
```

**Remove** (if present):

```env
# VITE_AUTH_ISSUER=...
# VITE_AUTH_CLIENT_ID=...
```

### Auth Gateway (Vercel)

```env
RATARY_BASE_URL=https://ratary.ontorata.com
CORS_ORIGINS=https://studio.ontorata.com,http://localhost:8765,http://localhost:8766
NODE_ENV=production
```

### Ratary

```env
NATIVE_AUTH_ENABLED=true
```

Run migrations once:

```bash
npm run db:migrate
```

---

## Local dev: UI local + API public

To test against production APIs from `npm run dev`:

```env
# Ontorata-Studio/.env
VITE_AUTH_BASE_URL=https://auth.ontorata.com
VITE_RATARY_BASE_URL=https://ratary.ontorata.com
```

Restart `npm run dev` after changing `.env`. Verify in DevTools → Network that requests hit public domains (not `localhost:8766/api`).

Ensure Auth Gateway `CORS_ORIGINS` includes your local Studio port (`8765` or `8766`).

---

## Local dev: full stack local

**Terminal 1 — Ratary** (`:9876`):

```env
NATIVE_AUTH_ENABLED=true
PORT=9876
```

**Terminal 2 — Auth Gateway** (`:8780`):

```env
RATARY_BASE_URL=http://localhost:9876
CORS_ORIGINS=http://localhost:8765,http://localhost:8766
```

**Terminal 3 — Studio** (`:8765`):

```env
VITE_AUTH_BASE_URL=http://localhost:8780
VITE_RATARY_BASE_URL=http://localhost:9876
```

---

## API contract

### Register

`POST /api/v1/auth/register`

```json
{
  "email": "user@example.com",
  "password": "SecurePass1",
  "display_name": "Optional"
}
```

Response includes: `accessToken`, `ownerId`, `identityId`, `workspaceId`, `expiresIn`.

### Login

`POST /api/v1/auth/login` — same response shape.

Password rules: min 8 chars, at least one letter and one number.

---

## Studio implementation

| File | Role |
|------|------|
| `src/infrastructure/auth/ratary-native-auth-adapter.ts` | HTTP client to Auth Gateway |
| `src/infrastructure/auth/create-auth-port.ts` | Native priority over OIDC |
| `src/config/env.ts` | `getAuthBaseUrl()`, `isNativeAuthEnabled()` |
| `src/components/NativeWorkspaceBootstrap.tsx` | Redirect placeholder workspace URL to UUID |

---

## Smoke test

```bash
curl -s https://auth.ontorata.com/health
curl -s -X POST https://auth.ontorata.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"...","password":"..."}'
```

In Studio: register → land on `/workspace/<uuid>` → create memory under Memories.

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| Redirect to Zitadel | `VITE_AUTH_ISSUER` still set | Remove from Vercel env; redeploy Studio |
| Invalid JWT audience | Old Ratary deploy | Deploy Ratary `main`; re-login |
| `personal-default` not found | Old Studio deploy | Deploy Studio with `workspaceId` fix |
| CORS error from localhost | Port not in `CORS_ORIGINS` | Add `http://localhost:8766` to Auth env |
| Still calls localhost API | `.env` not loaded | Restart `npm run dev` |

---

## Related

- [AUTH-ARCHITECTURE.md](./AUTH-ARCHITECTURE.md)
- [OIDC-FEDERATION.md](./OIDC-FEDERATION.md) — enterprise alternative
- [auth repo README](https://github.com/ontorata/auth)
