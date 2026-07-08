import type { AuthSession } from '../domain/auth/session';
import { DEFAULT_WORKSPACE_ID } from './env';

/** Tenant context propagated from Studio session to Ratary data-plane. */
export interface StudioTenantContext {
  identityId: string;
  organizationId: string;
  workspaceId: string;
}

/**
 * Resolves organization + workspace for API calls.
 * Route workspace wins over session placeholder when user navigates workspaces.
 */
export function resolveStudioTenantContext(
  session: AuthSession | null | undefined,
  routeWorkspaceId?: string,
): StudioTenantContext | null {
  if (!session?.subject) return null;

  const organizationId = session.nativeOrganizationId ?? session.legacyOrganizationId;
  const sessionWorkspace =
    session.nativeWorkspaceId ?? session.legacyWorkspaceId ?? undefined;
  const workspaceId =
    routeWorkspaceId && routeWorkspaceId !== DEFAULT_WORKSPACE_ID
      ? routeWorkspaceId
      : sessionWorkspace;

  if (!organizationId || !workspaceId) return null;

  return {
    identityId: session.subject,
    organizationId,
    workspaceId,
  };
}

export function buildStudioTenantHeaders(
  tenant: StudioTenantContext,
): Record<string, string> {
  return {
    'X-Organization-Id': tenant.organizationId,
    'X-Workspace-Id': tenant.workspaceId,
  };
}
