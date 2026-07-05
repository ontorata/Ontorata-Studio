# Ontorata Studio

**Ontorata Studio** is the web operator console for the [Ratary](https://github.com/ontorata/ratary) memory brain — browse memories, search, inspect relations, and view platform health.

Memory engine: **Ratary** · Memory MCP server id: **`ratary`** · This repo: **Ontorata Studio** (UI only).

## Architecture

```
Browser → Ontorata Studio (this repo) → @ratary/sdk → Ratary Server (REST)
IDE     → ratary MCP ───────────────────────────────→ same brain
```

All data plane traffic goes through **`@ratary/sdk`** only. No direct SQL, D1, or Ratary server imports in the SPA.

## Prerequisites

- Node.js 20+
- Running [Ratary Server](https://github.com/ontorata/ratary) (`npm run dev` or Docker)
- API key from Ratary bootstrap

## Setup (local dev)

Clone both repositories side by side:

```bash
git clone https://github.com/ontorata/ratary.git ../ratary
git clone https://github.com/ontorata/Ontorata-Studio.git
cd Ontorata-Studio
npm install
cp .env.example .env
# Edit VITE_RATARY_BASE_URL and VITE_RATARY_API_KEY
npm run dev
```

Open `http://localhost:5173`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production static bundle |
| `npm run test` | Unit tests (mocked SDK) |
| `npm run lint` | ESLint + SDK boundary check |

## Deploy (Vercel)

1. Deploy [Ratary Server](https://github.com/ontorata/ratary) first; bootstrap an API key (`aic_...`).
2. Import this repo in Vercel — **Framework: Vite**, **Output: `dist`** (or use repo `vercel.json`).
3. Set **Environment Variables** (build-time — redeploy after changes):

| Variable | Example |
|----------|---------|
| `VITE_RATARY_BASE_URL` | `https://ratary-xxx.vercel.app` |
| `VITE_RATARY_API_KEY` | `aic_...` |

`npm install` links the **vendored** `@ratary/sdk` at `vendor/ratary-sdk/` (Ratary repo is private — no clone on CI). After SDK changes in Ratary, maintainers run `node scripts/sync-ratary-sdk.mjs` from a sibling clone.

**Security:** `VITE_*` values are embedded in the static bundle — use team/internal keys only, or add a BFF/OIDC path for production.

Other hosts: `npm run build` → serve `dist/` on nginx or any CDN. **Not** bundled into Ratary Server Docker image by default.

## Feature gating

UI panels read **`GET /api/v1/capabilities`** from Ratary Server — graph and workspace nav items appear only when server flags are on.

## Ontory

Studio is the **operator console**. End-user assistant flows link out to **Ontory** (`VITE_ONTORY_URL`).

## License

MIT
