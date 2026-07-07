# Ontorata Studio — Phase index (01–20)

**Status:** Phases 01–20 implemented (MVP scope).  
**Production:** https://studio.ontorata.com  
**Identity:** Native auth (default) · OIDC federation (enterprise) · see [auth/](auth/)

| Phase | Name | Route | Status |
|-------|------|-------|--------|
| 01 | Workspace Foundation | layered modules | ✅ |
| 02 | Auth Gateway | auth.ontorata.com | ✅ API-only (ADR-006) |
| 03 | Studio Foundation | design system | ✅ |
| 04 | Authentication | inline login, `/callback` | ✅ native + OIDC |
| 05 | Connection Manager | `/connect` | ✅ + OIDC auto-connect |
| 06 | Workspace Shell | `/workspace/:id` | ✅ |
| 07 | Ontory Chat | `…/ontory/chat` | ✅ search + context |
| 08 | AI Profiles | `…/profiles` | ✅ local registry |
| 09 | AI Stacks | `…/stacks` | ✅ local registry |
| 10 | Stack Builder | `…/stack-builder` | ✅ compose + export |
| 11 | Memory Explorer | `…/memories`, `search`, `graph` | ✅ |
| 12 | Knowledge | `…/knowledge` | ✅ fabric status |
| 13 | MCP Manager | `…/mcp` | ✅ tool inventory |
| 14 | Agent Manager | `…/agents` | ✅ read-only |
| 15 | Model Providers | `…/models` | ✅ manifest policy |
| 16 | Coding Workspace | `…/coding` | ✅ editor + memory sidebar |
| 17 | Organization | `…/organization` | ✅ OIDC + workspaces |
| 18 | Observability | `…/observability` | ✅ health polling |
| 19 | Enterprise & Offline | `…/enterprise` | ✅ self-hosted guide |
| 20 | Production Hardening | `…/security` | ✅ checklist |

## Auth modes

| Mode | When | Ratary auth |
|------|------|-------------|
| **Native (default)** | `VITE_AUTH_BASE_URL` set | JWT via Auth Gateway → Ratary |
| **OIDC federation** | `VITE_AUTH_ISSUER` set (enterprise) | IdP JWT → `STUDIO_OIDC_ENABLED` |
| **API key wizard** | `/connect` or legacy login | `aic_...` bearer |
| **Self-hosted** | Custom Ratary URL + key | Per-connection |

See [auth/NATIVE-AUTH.md](auth/NATIVE-AUTH.md) · [auth/OIDC-FEDERATION.md](auth/OIDC-FEDERATION.md) · [architecture/](architecture/).
