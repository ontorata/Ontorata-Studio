import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { StudioRataryClient } from '../infrastructure/ratary';
import { toLegacyCredentials } from '../presentation/routes/manifest';
import { useAuth } from './useAuth';
import { useConnection } from './useConnection';

const StudioClientContext = createContext<StudioRataryClient | null>(null);

export function StudioClientProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const { activeConnection, getApiKey } = useConnection();

  const client = useMemo(() => {
    if (!session) return null;

    const legacy = toLegacyCredentials(session);
    if (legacy) {
      return new StudioRataryClient({
        baseUrl: legacy.baseUrl,
        apiKey: legacy.apiKey,
        workspaceId: legacy.workspaceId,
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
  }, [session, activeConnection, getApiKey]);

  if (!client) {
    throw new Error('StudioClientProvider requires an active Ratary connection');
  }

  return <StudioClientContext.Provider value={client}>{children}</StudioClientContext.Provider>;
}

export function useStudioClient(): StudioRataryClient {
  const client = useContext(StudioClientContext);
  if (!client) {
    throw new Error('useStudioClient must be used within StudioClientProvider');
  }
  return client;
}
