# Branching & Vercel deploy

**Maintainer:** lutfi04 · lutfiramadhan04@gmail.com  
**Production:** [studio.ontorata.com](https://studio.ontorata.com)

## Branches

| Branch | Purpose | Vercel |
|--------|---------|--------|
| **`staging`** | Day-to-day development — push here first | Preview deployments (optional) |
| **`main`** | Production release | **Production** deploy to Vercel |

## Workflow

1. `git checkout staging` && `git pull origin staging`
2. Implement, commit, `git push origin staging`
3. Verify preview / local (`npm run dev` → `http://localhost:8765`)
4. PR **`staging` → `main`** when ready for production
5. Merge `main` → Vercel production auto-deploy

## Vercel settings

In Vercel project **Ontorata-Studio**:

- **Production Branch:** `main`
- Framework: Vite · Output: `dist` (see `vercel.json`)
- Env (Production):
  - `VITE_AUTH_ISSUER` — Zitadel instance URL
  - `VITE_AUTH_CLIENT_ID` — Zitadel SPA client ID
  - `VITE_RATARY_BASE_URL` — e.g. `https://ratary.ontorata.com`
- Do **not** set `VITE_RATARY_API_KEY` in production

## Related

- [Architecture](./architecture/README.md)
- [ZITADEL-SETUP.md](./ZITADEL-SETUP.md) — identity provider
- [PHASES.md](./PHASES.md) — feature index
