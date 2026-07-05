import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { StudioRataryClient } from '../api/ratary-client';
import { useAuth } from './useAuth';

const StudioClientContext = createContext<StudioRataryClient | null>(null);

export function StudioClientProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const client = useMemo(() => {
    if (!session) return null;
    return new StudioRataryClient({
      baseUrl: session.baseUrl,
      apiKey: session.apiKey,
      workspaceId: session.workspaceId,
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
