import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { StudioRataryClient } from '../infrastructure/ratary';
import { toLegacyCredentials } from '../presentation/routes/manifest';
import { useAuth } from './useAuth';

const StudioClientContext = createContext<StudioRataryClient | null>(null);

export function StudioClientProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const client = useMemo(() => {
    if (!session) return null;
    const creds = toLegacyCredentials(session);
    if (!creds) return null;
    return new StudioRataryClient({
      baseUrl: creds.baseUrl,
      apiKey: creds.apiKey,
      workspaceId: creds.workspaceId,
    });
  }, [session]);

  if (!client) {
    throw new Error('StudioClientProvider requires an authenticated session');
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
