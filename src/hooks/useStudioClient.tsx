import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { getDefaultRataryBaseUrl, isRataryBearerAuth } from '../config/env';
import { resolveStudioTenantContext } from '../config/tenant-context';
import { StudioRataryClient } from '../infrastructure/ratary';
import { toLegacyCredentials } from '../presentation/routes/manifest';
import { useAuth } from './useAuth';
import { useConnection } from './useConnection';
import { useWorkspaceId } from './useWorkspacePath';

const StudioClientContext = createContext<StudioRataryClient | null>(null);

function buildClient(
  session: ReturnType<typeof useAuth>['session'],
  activeConnection: ReturnType<typeof useConnection>['activeConnection'],
  getApiKey: ReturnType<typeof useConnection>['getApiKey'],
  routeWorkspaceId: string,
): StudioRataryClient | null {
  if (!session) return null;

  const tenant = resolveStudioTenantContext(session, routeWorkspaceId);

  const legacy = toLegacyCredentials(session);
  if (legacy) {
    return new StudioRataryClient({
      baseUrl: legacy.baseUrl,
      apiKey: legacy.apiKey,
      organizationId: tenant?.organizationId ?? legacy.organizationId,
      workspaceId: tenant?.workspaceId ?? legacy.workspaceId,
    });
  }

  if (session.accessToken && isRataryBearerAuth() && session.expiresAt > Date.now()) {
    if (!tenant) return null;
    return new StudioRataryClient({
      baseUrl: getDefaultRataryBaseUrl(),
      accessToken: session.accessToken,
      organizationId: tenant.organizationId,
      workspaceId: tenant.workspaceId,
    });
  }

  if (activeConnection) {
    const apiKey = getApiKey(activeConnection.id);
    if (apiKey) {
      return new StudioRataryClient({
        baseUrl: activeConnection.baseUrl,
        apiKey,
        organizationId: tenant?.organizationId ?? activeConnection.organizationId,
        workspaceId: tenant?.workspaceId ?? activeConnection.workspaceId,
      });
    }
  }

  return null;
}

export function StudioClientProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const { activeConnection, getApiKey } = useConnection();
  const routeWorkspaceId = useWorkspaceId();

  const client = useMemo(
    () => buildClient(session, activeConnection, getApiKey, routeWorkspaceId),
    [session, activeConnection, getApiKey, routeWorkspaceId],
  );

  return <StudioClientContext.Provider value={client}>{children}</StudioClientContext.Provider>;
}

export function useOptionalStudioClient(): StudioRataryClient | null {
  return useContext(StudioClientContext);
}

export function useStudioClient(): StudioRataryClient | null {
  return useContext(StudioClientContext);
}
