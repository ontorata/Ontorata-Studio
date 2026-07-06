# Ontorata Studio

**Ontorata Studio** is the web operator console for the [Ratary](https://github.com/ontorata/ratary) memory brain — browse memories, search, graph traversal, agent tooling, and platform health.

Memory engine: **Ratary** · MCP server id: **`ratary`** · This repo: **Ontorata Studio** (UI only).

## Architecture

```
Browser → Ontorata Studio (Vercel) → @ratary/sdk → Ratary Server (REST)
         ↘ Zitadel OIDC (identity)              ↘ per-user owner scope
IDE      → ratary MCP ─────────────────────────→ same brain
```

All data plane traffic goes through **`@ratary/sdk`** only. No direct SQL, D1, or Ratary server imports in the SPA.

**Branches:** push to `staging` · production Vercel deploy from `main` — see [docs/BRANCHING.md](docs/BRANCHING.md).  
**Phases 01–20:** [docs/PHASES.md](docs/PHASES.md) · **Architecture:** [docs/architecture/](docs/architecture/).

## Prerequisites

- Node.js 20+
- Running [Ratary Server](https://github.com/ontorata/ratary) (`npm run dev` on port **9876**)
- **Production:** Zitadel app + Ratary `STUDIO_OIDC_ENABLED=true`

## Setup (local dev)

```bash
git clone https://github.com/ontorata/ratary.git ../ai-brain   # or ../ratary
git clone https://github.com/ontorata/Ontorata-Studio.git
cd Ontorata-Studio
npm install
cp .env.example .env.local
```

### Option A — OIDC (matches production)

```env
VITE_AUTH_ISSUER=https://<instance>.zitadel.cloud
VITE_AUTH_CLIENT_ID=<client-id>
VITE_RATARY_BASE_URL=http://localhost:9876
```

Ratary `.env`: `STUDIO_OIDC_ENABLED=true`, `OIDC_ISSUER_URL=<same issuer>`

### Option B — API key only

```env
VITE_RATARY_BASE_URL=http://localhost:9876
# Leave VITE_AUTH_ISSUER unset — legacy login form
```

```bash
npm run dev   # http://localhost:8765
```

## Authentication

| Mode | Login | Ratary connection |
|------|-------|-------------------|
| **OIDC (production)** | Zitadel → `/callback` → workspace | Auto — Zitadel access token |
| **Legacy / self-hosted** | `/login` API key or `/connect` wizard | `aic_...` per connection |

OIDC tokens live in **sessionStorage** (tab-scoped). API keys from the connect wizard use obfuscated local storage.

See [docs/ZITADEL-SETUP.md](docs/ZITADEL-SETUP.md).

## Workspace routes

All operator features live under `/workspace/:workspaceId/`:

| Path | Feature |
|------|---------|
| `/` | Dashboard (health + capabilities) |
| `/memories` | Memory CRUD |
| `/search` | Memory search |
| `/graph` | Graph traversal |
| `/ontory/chat` | Memory-grounded chat |
| `/profiles`, `/stacks`, `/stack-builder` | Agent composition |
| `/knowledge`, `/mcp`, `/agents`, `/models` | Platform surfaces |
| `/coding` | Lightweight coding + memory context |
| `/organization` | OIDC org + workspace switch |
| `/observability`, `/security`, `/enterprise` | Ops |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server (`http://localhost:8765`) |
| `npm run build` | Production static bundle |
| `npm run test` | Unit tests |
| `npm run lint` | ESLint + SDK boundary check |
| `node scripts/sync-ratary-sdk.mjs` | Sync SDK from sibling `ai-brain` clone |

## Deploy (Vercel)

1. Deploy [Ratary](https://github.com/ontorata/ratary) with `STUDIO_OIDC_ENABLED=true` and `OIDC_ISSUER_URL`.
2. Import this repo — **Framework: Vite**, **Output: `dist`**.
3. Environment variables (Production):

| Variable | Example |
|----------|---------|
| `VITE_AUTH_ISSUER` | `https://<instance>.zitadel.cloud` |
| `VITE_AUTH_CLIENT_ID` | `<zitadel-client-id>` |
| `VITE_RATARY_BASE_URL` | `https://ratary.ontorata.com` |

Do **not** set `VITE_RATARY_API_KEY` on Vercel.

## Feature gating

UI panels read **`GET /api/v1/capabilities`** — graph nav, workspace admin, and knowledge fabric sections appear when server flags are on.

## Ontory

Studio embeds **Ontory Chat** (`/ontory/chat`) for memory-grounded assistance. Full Ontory product links via `VITE_ONTORY_URL` when set.

## License

MIT
