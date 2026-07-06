import { useMemo } from 'react';
import { useAuth } from './useAuth';

export interface OrgClaims {
  orgId?: string;
  orgName?: string;
  roles: string[];
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Phase 17 — parse org context from OIDC access token (Zitadel / Keycloak claims). */
export function useOrgContext(): OrgClaims | null {
  const { session } = useAuth();

  return useMemo(() => {
    if (!session?.accessToken) return null;
    const payload = decodeJwtPayload(session.accessToken);
    if (!payload) return null;

    const realmAccess = payload.realm_access as { roles?: string[] } | undefined;
    const zitadelRoles = payload['urn:zitadel:iam:org:project:roles'] as
      | Record<string, Record<string, string>>
      | undefined;
    const rolesFromZitadel = zitadelRoles
      ? Object.keys(zitadelRoles).flatMap((project) => Object.keys(zitadelRoles[project] ?? {}))
      : [];
    const roles = realmAccess?.roles ?? rolesFromZitadel;

    const zitadelOrgId = payload['urn:zitadel:iam:user:resourceowner:id'] as string | undefined;
    const orgId =
      (typeof payload.org_id === 'string' ? payload.org_id : undefined) ?? zitadelOrgId;
    const orgName =
      (typeof payload.org_name === 'string' ? payload.org_name : undefined) ??
      (typeof payload['urn:zitadel:iam:user:resourceowner:name'] === 'string'
        ? (payload['urn:zitadel:iam:user:resourceowner:name'] as string)
        : undefined);

    return { orgId, orgName, roles };
  }, [session?.accessToken]);
}
