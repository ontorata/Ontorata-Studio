# ADR-002: Studio layered module architecture

**Status:** Accepted  
**Date:** 2026-07-06  
**Context:** Phase 01 — Workspace Foundation

## Decision

Studio source code follows four layers:

1. **domain** — pure types and invariants (no React, no fetch)
2. **application** — use-cases, ports, hooks orchestration
3. **infrastructure** — adapters (Ratary SDK, OIDC, storage)
4. **presentation** — pages, components, routes

Dependency direction: `presentation → application → domain ← infrastructure`.

## Consequences

- ESLint `import/no-restricted-paths` enforces layer boundaries (Phase 01 task 1.8).
- Existing flat `src/` migrates incrementally via `legacy/` re-exports.
- Tests: domain + application are unit-testable without DOM.

## Alternatives

- **Feature folders only:** rejected — cross-cutting concerns (auth, connection) duplicate across features.
