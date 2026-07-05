import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createStudioClientFromEnv, type StudioRataryClient } from '../api/ratary-client';

const StudioClientContext = createContext<StudioRataryClient | null>(null);

export function StudioClientProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => createStudioClientFromEnv(), []);
  return <StudioClientContext.Provider value={client}>{children}</StudioClientContext.Provider>;
}

export function useStudioClient(): StudioRataryClient {
  const client = useContext(StudioClientContext);
  if (!client) {
    throw new Error('useStudioClient must be used within StudioClientProvider');
  }
  return client;
}
