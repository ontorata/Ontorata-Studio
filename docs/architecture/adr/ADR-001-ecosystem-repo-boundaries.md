# ADR-001: Ecosystem repository boundaries

**Status:** Proposed  
**Date:** 2026-07-06  
**Context:** Phase 01 — Workspace Foundation

## Decision

The Ontorata ecosystem consists of **three independent repositories**:

| Repository | Owns | Must not own |
|------------|------|--------------|
| `auth-ontorata` | Identity (Keycloak), OIDC, MFA, org SSO | AI data, Ratary credentials storage logic in Studio |
| `Ontorata-Studio` | Workspace UI, configuration, connection metadata | Memory, embeddings, conversations, Ratary DB access |
| `ratary` | AI runtime, memory, MCP, orchestration | Studio UI, end-user IdP (except validating AIC/OIDC) |

Cross-repo communication is **API-only** (REST, OIDC). No shared database between Studio and Ratary.

## Consequences

- `auth-ontorata` must be bootstrapped; Keycloak assets migrate out of `ratary/infra/keycloak` over Phase 02.
- Studio vendors `@ratary/sdk` — never imports `ratary/src`.
- Version compatibility is negotiated at connection time (Phase 05).

## Alternatives

- **Monorepo:** rejected — independent release and air-gapped packaging requirements.
