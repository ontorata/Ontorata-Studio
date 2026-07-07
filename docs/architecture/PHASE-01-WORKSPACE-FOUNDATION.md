# Phase 01 — Workspace Foundation

**Status:** Closed — superseded by [PHASES.md](../../PHASES.md) for phases 02–20  
**Scope:** Ontorata-Studio structural foundation + ecosystem boundaries  
**Out of scope:** Keycloak deployment (Phase 02), OIDC login flow (Phase 04), Connection Wizard UI (Phase 05)

---

## 1. Problem

Studio v0.1 is a functional operator console (API-key login, memory/search/graph pages) but lacks the modular foundation required for a 5–10 year AI Operating System:

- Auth is coupled to Ratary API keys (`aic_...`) with no IdP boundary
- No domain model for workspaces, connections, profiles, or stacks
- Flat `src/` layout will not scale to Ontory, Connection Manager, or coding workspace
- `auth-ontorata` repo exists as an empty workspace folder; Keycloak assets live in `ratary/infra/keycloak` today

Phase 01 establishes **structure, boundaries, and contracts** so Phases 02–05 can ship without rework.

---

## 2. Constraints (constitution)

| ID | Constraint |
|----|------------|
| C1 | Studio communicates with Ratary **only** via `@ratary/sdk` / REST — no SQL, D1, or server imports |
| C2 | Studio **never** stores customer AI data (memory, embeddings, conversations, prompts) |
| C3 | Authentication logic **never** lives in Studio beyond OIDC client + JWT validation |
| C4 | Permissions for AI data come from **Ratary**; org identity from **Keycloak** — Studio is not authority |
| C5 | Offline / air-gapped must remain viable (local Keycloak + local Ratary) |
| C6 | Incremental delivery — each phase production-ready before the next |

---

## 3. Current state (baseline)

### Studio v0.1

```
src/
  api/ratary-client.ts      # sole SDK boundary
  auth/auth-session.ts      # sessionStorage + aic_...
  hooks/ useAuth, useCapabilities, useStudioClient
  pages/                    # 8 routes, operator console
  components/ Layout, ProtectedRoute, CapabilityGate
```

- Login: API key → `GET /capabilities` verify → sessionStorage
- No workspace concept, no connection profiles, no encrypted credential store
- Tests: unit only (`auth-session`, `ratary-client`)

### auth-ontorata

- **Empty repository** (no files, no git)
- Production Keycloak today: `ratary/infra/keycloak` → `auth.ontorata.com/realms/ratary`
- Realm/client tuned for **MCP OAuth (ChatGPT)**, not yet for Studio SPA

### Implication

Phase 01 must define **interfaces and folder layout** that support Keycloak without implementing it. v0.1 API-key path remains until Phase 04 migration.

---

## 4. Decision — Target architecture

### 4.1 Layered modules (Studio)

```
┌─────────────────────────────────────────────────────────────┐
│  presentation/     pages, layouts, design-system components │
├─────────────────────────────────────────────────────────────┤
│  application/      use-cases, hooks, route guards, wizards  │
├─────────────────────────────────────────────────────────────┤
│  domain/           workspace, connection, profile (types)   │
├─────────────────────────────────────────────────────────────┤
│  infrastructure/   ratary-client, auth-client, storage      │
└─────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
    Ratary REST                    auth-ontorata (OIDC)
    (@ratary/sdk)                  (Phase 02+)
```

**Dependency rule:** `presentation` → `application` → `domain` ← `infrastructure`. Domain has zero framework imports.

### 4.2 Ecosystem boundaries

```
User → auth-ontorata (Keycloak) → JWT
     → Studio (SPA) → validates JWT, manages workspace UI
     → Ratary (REST) → AIC for AI data; Studio never proxies AI payloads
```

Studio stores **only**:

- OIDC session metadata (tokens in memory / secure storage — design in Phase 04)
- Connection **metadata** (URL, label, preferences) — AIC encrypted at rest (Phase 05)
- UI state, profile/stack **configuration** (not AI content)

### 4.3 Auth evolution path (no implementation in Phase 01)

| Stage | Mechanism | Phase |
|-------|-----------|-------|
| Now | API key `aic_...` in sessionStorage | v0.1 (legacy, dev operator) |
| Next | OIDC PKCE → JWT; Studio validates | Phase 04 |
| Then | Post-login → Connection Wizard (Ratary URL + AIC) | Phase 05 |
| Steady | Persistent vs temporary connection modes | Phase 05 |

Phase 01 adds `domain/connection` types and `infrastructure/auth` **ports** (interfaces) only.

---

## 5. Target folder structure (Studio)

Incremental migration from flat `src/` — **no big-bang move in Phase 01**.

```
Ontorata-Studio/
├── docs/
│   └── architecture/           # ADRs, phase docs (this folder)
├── src/
│   ├── app/                    # bootstrap: main, App, router config
│   ├── domain/
│   │   ├── workspace/          # WorkspaceId, WorkspaceType (personal|org)
│   │   ├── connection/         # RataryConnection, ConnectionMode, ValidationResult
│   │   ├── profile/            # stubs for Phase 08
│   │   └── stack/              # stubs for Phase 09
│   ├── application/
│   │   ├── auth/               # AuthPort, session orchestration (wraps legacy)
│   │   ├── connection/         # ConnectionPort (validate, persist — stubs)
│   │   └── capabilities/       # move useCapabilities logic
│   ├── infrastructure/
│   │   ├── ratary/             # ratary-client.ts (move from api/)
│   │   ├── auth/               # LegacyApiKeyAuthAdapter, future OidcAuthAdapter
│   │   └── storage/            # sessionStorage, future encrypted store
│   ├── presentation/
│   │   ├── pages/              # existing pages (re-export during migration)
│   │   ├── components/         # Layout, gates, design-system/
│   │   └── routes/             # route table + guards
│   ├── legacy/                 # temporary re-exports from old paths (1 release)
│   └── styles/
├── tests/
│   ├── unit/
│   └── integration/            # scaffold only in Phase 01
└── vendor/ratary-sdk/
```

**Phase 01 deliverable:** create `domain/`, `application/*/ports`, `infrastructure/*/adapters` skeleton + ADRs; **keep existing pages working** via `legacy/` re-exports.

### auth-ontorata (bootstrap plan — Phase 02, documented now)

```
auth-ontorata/
├── README.md
├── docker-compose.yml          # extract from ratary/infra/keycloak
├── realms/
│   ├── studio.json             # new realm: studio users, orgs
│   └── ratary-mcp.json         # migrate existing MCP realm
├── themes/ontorata/            # Keycloak theme (Phase 02)
├── scripts/
│   ├── up.ps1 / up.sh
│   └── export-realm.sh
├── deploy/
│   ├── render.yaml
│   └── fly.toml
└── docs/
    ├── LOCAL.md
    ├── STUDIO-INTEGRATION.md
    └── OFFLINE.md
```

**Migration:** copy `ratary/infra/keycloak/*` → `auth-ontorata`, add Studio client (`studio-spa`, PKCE, redirect URIs). Ratary repo keeps a **submodule link** or docs pointer — no duplicate IdP long term.

---

## 6. Domain model (Phase 01 — types only)

### Workspace

```typescript
type WorkspaceType = 'personal' | 'organization';

interface WorkspaceRef {
  id: string;
  type: WorkspaceType;
  displayName: string;
  organizationId?: string; // from JWT claims in Phase 04
}
```

### Connection (Ratary)

```typescript
type ConnectionMode = 'persistent' | 'temporary';

interface RataryConnection {
  id: string;
  workspaceId: string;
  baseUrl: string;           // normalized, no trailing slash
  label?: string;
  description?: string;
  mode: ConnectionMode;
  // aicCredentialRef — opaque handle to encrypted storage (Phase 05)
  createdAt: string;
  lastValidatedAt?: string;
}

interface ConnectionValidation {
  ok: boolean;
  health: boolean;
  apiCompatible: boolean;
  rataryVersion?: string;
  latencyMs?: number;
  features?: string[];
  errors: ConnectionDiagnostic[];
}

interface ConnectionDiagnostic {
  code: string;              // e.g. AUTH_FAILED, VERSION_MISMATCH
  message: string;
  action?: string;           // user-facing fix hint
}
```

### Auth session (port)

```typescript
interface AuthSession {
  subject: string;
  expiresAt: number;
  idToken?: string;          // Phase 04
  accessToken?: string;
  // Legacy bridge:
  legacyApiKey?: string;     // removed after Phase 04 cutover
}
```

---

## 7. Application ports (interfaces)

| Port | Responsibility | Phase 01 | Implementation phase |
|------|----------------|----------|----------------------|
| `AuthPort` | login, logout, getSession, isAuthenticated | Interface + legacy adapter | Phase 04 OIDC |
| `ConnectionPort` | validate, list, save, revoke | Interface + no-op/stub | Phase 05 |
| `RataryPort` | memory, search, capabilities, graph | Existing `StudioRataryClient` | Move to infrastructure |
| `WorkspacePort` | current workspace, switch | Interface + single default | Phase 06 shell |

---

## 8. ADRs (Architecture Decision Records)

| ADR | Title | Decision |
|-----|-------|----------|
| [ADR-001](./adr/ADR-001-ecosystem-repo-boundaries.md) | Ecosystem repo boundaries | Three independent repos; Studio API-only to Ratary |
| [ADR-002](./adr/ADR-002-studio-layered-modules.md) | Studio layered modules | domain / application / infrastructure / presentation |
| [ADR-003](./adr/ADR-003-auth-external-keycloak.md) | External Keycloak auth | auth-ontorata owns IdP; Studio OIDC client only |
| [ADR-004](./adr/ADR-004-connection-wizard-gate.md) | Connection wizard gate | No dashboard until Ratary connection validates |
| [ADR-005](./adr/ADR-005-legacy-api-key-bridge.md) | Legacy API-key bridge | v0.1 auth preserved behind AuthPort until Phase 04 |

Full text in `docs/architecture/adr/`.

---

## 9. Design system foundation (Phase 01)

Minimal token scaffold — **not** full UI rewrite.

```
src/presentation/design-system/
  tokens.css        # color, spacing, typography, radius
  primitives/       # Button, Input, Card, Stack (thin wrappers)
  patterns/         # PageHeader, EmptyState, DiagnosticPanel (stub)
```

**Principles:** minimal, keyboard-first, accessible (WCAG 2.1 AA target), unique Ontorata language (inspired by quality of Vercel/Linear — not copied).

Phase 01: tokens + 3 primitives used on LoginPage only (prove pattern).

---

## 10. Routing evolution

### Current

`/login` → protected shell → feature pages

### Target (after Phase 04–06)

```
/                    → redirect based on auth + connection state
/login               → redirect to auth-ontorata (Phase 04)
/callback            → OIDC callback (Phase 04)
/connect             → Connection Wizard (Phase 05) — mandatory before /workspace
/workspace/*         → dashboard shell (Phase 06)
/legacy/*            → v0.1 pages during migration (temporary)
```

Phase 01: define `routes/manifest.ts` with **route metadata** (auth required, connection required, feature flag) — no new routes yet.

---

## 11. Security review checklist (Phase 01)

| Item | Phase 01 action |
|------|-----------------|
| SDK boundary (`fetch` only in ratary adapter) | Keep `check-sdk-boundary.mjs`; extend path to `infrastructure/ratary/` |
| No AI data in localStorage | ADR + lint rule: ban `localStorage` for credentials |
| CSP headers | Document in `docs/architecture/SECURITY.md` (scaffold) |
| AIC encryption | Specify Web Crypto + user-derived key in Phase 05 ADR |
| JWT validation | Specify `jose` + JWKS from auth-ontorata in Phase 04 |

---

## 12. Implementation plan (Phase 01 tasks)

Ordered; each task is shippable without breaking v0.1.

| # | Task | Files | Verification |
|---|------|-------|--------------|
| 1.1 | Create architecture docs + ADRs | `docs/architecture/**` | Owner review |
| 1.2 | Add domain types | `src/domain/**/*.ts` | `tsc` clean |
| 1.3 | Define ports | `src/application/**/ports.ts` | Unit: mock implementations |
| 1.4 | Legacy auth adapter | `infrastructure/auth/legacy-api-key-auth.ts` wraps `auth-session` | Existing auth tests pass |
| 1.5 | Move ratary client | `api/` → `infrastructure/ratary/` + legacy re-export | `ratary-client.test.ts` pass |
| 1.6 | Route manifest | `presentation/routes/manifest.ts` | Unit test route metadata |
| 1.7 | Design tokens + 3 primitives | `design-system/` | Visual check LoginPage |
| 1.8 | Extend SDK boundary script | `scripts/check-sdk-boundary.mjs` | `npm run lint` |
| 1.9 | Integration test scaffold | `tests/integration/.gitkeep` + README | CI runs (empty pass) |
| 1.10 | auth-ontorata README + extract plan | separate repo doc only | Link from Studio README |

**Estimated effort:** 3–5 dev days (no Phase 02 Keycloak work).

---

## 13. Success criteria (Phase 01 gate)

All must pass before Phase 02 begins:

- [ ] ADR-001 through ADR-005 approved by owner
- [ ] `npm run build`, `npm run test`, `npm run lint` green
- [ ] v0.1 user flows unchanged (API-key login, all pages work)
- [ ] Domain types and ports documented; no Ratary schema leakage into domain
- [ ] Folder structure exists with legacy re-exports — no broken imports
- [ ] Route manifest defines future `/connect` gate without implementing wizard
- [ ] auth-ontorata bootstrap plan documented; extraction path from `ratary/infra/keycloak` agreed
- [ ] Security checklist scaffold committed
- [ ] Release notes: "Phase 01 — structural foundation, no user-facing auth change"

---

## 14. Alternatives considered

| Alternative | Rejected because |
|-------------|------------------|
| Monorepo (studio + auth + ratary) | Violates independent repo vision; different deploy lifecycles |
| Auth inside Studio (Next.js API routes) | C2/C3 — auth must stay in auth-ontorata |
| Skip domain layer; grow flat `src/` | Blocks Ontory, stacks, connection manager at scale |
| Big-bang rewrite to new router/auth | Risk; incremental with `legacy/` bridge is safer |
| Keep Keycloak only in ratary repo | MCP and Studio need different clients/realms; auth-ontorata is correct home |

---

## 15. Open questions (owner input)

1. **Realm strategy:** one Keycloak realm (`ontorata`) with Studio + MCP clients, or separate `studio` / `ratary-mcp` realms?
2. **Org model:** Keycloak organizations (KC 26+) vs custom `organizationId` claim?
3. **v0.1 cutover:** hard switch to OIDC for production Studio, or parallel API-key dev mode indefinitely?
4. **Connection storage:** IndexedDB + Web Crypto vs OS keychain (desktop wrapper future)?
5. **Package name:** keep `Ontorata-Studio` repo name or rename to `ontorata-studio` lowercase?

---

## 16. Phase map (context)

| Phase | Focus | Depends on |
|-------|-------|------------|
| **01** | Workspace foundation (this doc) | — |
| 02 | auth-ontorata Keycloak repo + realms | 01 |
| 03 | Studio foundation (design system, app shell refactor) | 01 |
| 04 | OIDC authentication flow | 02, 03 |
| 05 | Ratary Connection Manager + wizard | 04 |
| 06 | Workspace shell (personal / org) | 05 |
| 07+ | Ontory, profiles, stacks, … | 06 |

---

*Draft — Ontorata Studio Phase 01. Approve sections before implementation (forge-intent gate).*
