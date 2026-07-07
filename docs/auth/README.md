# Auth documentation index

**Last updated:** 2026-07-07

| Doc | Purpose |
|-----|---------|
| [AUTH-ARCHITECTURE.md](./AUTH-ARCHITECTURE.md) | Official architecture diagram + boundaries |
| [NATIVE-AUTH.md](./NATIVE-AUTH.md) | **Production default** — email/password via Auth Gateway |
| [OIDC-FEDERATION.md](./OIDC-FEDERATION.md) | Enterprise SSO (Azure AD, Okta, Zitadel, …) |
| [legacy/ZITADEL.md](./legacy/ZITADEL.md) | Zitadel Cloud step-by-step (OIDC provider) |

## Governance

| Document | Location |
|----------|----------|
| Engineering Constitution | `ai-brain/.ai/core/constitution/ENGINEERING-CONSTITUTION.md` |
| ADR-006 Native Auth Gateway | `ai-brain/.ai/core/adr/ADR-006-native-auth-gateway.md` |

## Historical (preserved, not default)

| Doc | Notes |
|-----|-------|
| [../ZITADEL-SETUP.md](../ZITADEL-SETUP.md) | Redirect stub → `legacy/ZITADEL.md` |
| [../architecture/adr/ADR-003-auth-external-keycloak.md](../architecture/adr/ADR-003-auth-external-keycloak.md) | OIDC ADR; superseded as **default** by native auth |
