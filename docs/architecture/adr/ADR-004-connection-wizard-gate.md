# ADR-004: Connection wizard gate

**Status:** Proposed  
**Date:** 2026-07-06  
**Context:** Phase 01 — Workspace Foundation

## Decision

After OIDC login (Phase 04), users **must not** enter the workspace dashboard until a Ratary connection passes automated validation:

- Health (`GET /health`)
- API compatibility / capabilities manifest
- Ratary version range
- AIC authentication
- Feature and permission scope check
- Latency threshold (configurable)

Failed validation shows **actionable diagnostics** — no silent bypass.

Implementation: Phase 05. Phase 01 defines `ConnectionPort`, `ConnectionValidation`, route manifest flag `requiresConnection: true`.

## Consequences

- Route guard chain: `authenticated → connected → workspace`
- Personal and organization workspaces use the same wizard; org Ratary URL may be pre-provisioned (Phase 17).

## Alternatives

- **Optional Ratary connection:** rejected — Studio cannot operate without AI runtime per product vision.
- **Studio proxies Ratary:** rejected — security principle C1/C2.
