import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { getDefaultRataryBaseUrl, getDefaultWorkspaceId, isOidcCloudAutoConnect } from '../config/env';
import { StudioRataryClient } from '../infrastructure/ratary';
import { toLegacyCredentials } from '../presentation/routes/manifest';
import { useAuth } from './useAuth';
import { useConnection } from './useConnection';

const StudioClientContext = createContext<StudioRataryClient | null>(null);

function buildClient(
  session: ReturnType<typeof useAuth>['session'],
  activeConnection: ReturnType<typeof useConnection>['activeConnection'],
  getApiKey: ReturnType<typeof useConnection>['getApiKey'],
): StudioRataryClient | null {
  if (!session) return null;

  const legacy = toLegacyCredentials(session);
  if (legacy) {
    return new StudioRataryClient({
      baseUrl: legacy.baseUrl,
      apiKey: legacy.apiKey,
      workspaceId: legacy.workspaceId,
    });
  }

  if (session.accessToken && isOidcCloudAutoConnect() && session.expiresAt > Date.now()) {
    return new StudioRataryClient({
      baseUrl: getDefaultRataryBaseUrl(),
      accessToken: session.accessToken,
      workspaceId: getDefaultWorkspaceId(),
    });
  }

  if (activeConnection) {
    const apiKey = getApiKey(activeConnection.id);
    if (apiKey) {
      return new StudioRataryClient({
        baseUrl: activeConnection.baseUrl,
        apiKey,
        workspaceId: activeConnection.workspaceId,
      });
    }
  }

  return null;
}

export function StudioClientProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const { activeConnection, getApiKey } = useConnection();

  const client = useMemo(
    () => buildClient(session, activeConnection, getApiKey),
    [session, activeConnection, getApiKey],
  );

  return <StudioClientContext.Provider value={client}>{children}</StudioClientContext.Provider>;
}

export function useOptionalStudioClient(): StudioRataryClient | null {
  return useContext(StudioClientContext);
}

export function useStudioClient(): StudioRataryClient | null {
  return useContext(StudioClientContext);
}
