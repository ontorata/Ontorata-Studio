# Ontorata Studio — Architecture

Long-term architecture for the Ontorata AI Operating System workspace.

| Phase | Document | Status |
|-------|----------|--------|
| 01 | [PHASE-01-WORKSPACE-FOUNDATION.md](./PHASE-01-WORKSPACE-FOUNDATION.md) | Draft — pending approval |
| 02 | auth-ontorata (Keycloak) — see `auth-ontorata` repo | Not started |
| 03+ | TBD after Phase 01 gate | Blocked |

**Ecosystem repos**

| Repo | Role |
|------|------|
| [Ontorata-Studio](https://github.com/ontorata/Ontorata-Studio) | AI Workspace & control plane (this repo) |
| [auth-ontorata](https://github.com/ontorata/auth-ontorata) | Identity platform (Keycloak) — **to be bootstrapped** |
| [ratary](https://github.com/ontorata/ratary) | AI runtime, memory, MCP — API only from Studio |

**Rule:** Studio never stores customer AI data and never accesses Ratary databases.
