import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { RataryConnection } from '../domain/connection/connection';
import { isOidcCloudAutoConnect } from '../config/env';
import { createLocalConnectionPort } from '../infrastructure/connection/local-connection-port';
import {
  getActiveConnectionId,
  setActiveConnectionId,
} from '../infrastructure/storage/connection-store';
import { useAuth } from './useAuth';

interface ConnectionContextValue {
  connections: RataryConnection[];
  activeConnection: RataryConnection | null;
  hasActiveConnection: boolean;
  refresh: () => Promise<void>;
  selectConnection: (connectionId: string) => void;
  getApiKey: (connectionId: string) => string | null;
  connectionPort: ReturnType<typeof createLocalConnectionPort>;
}

const ConnectionContext = createContext<ConnectionContextValue | null>(null);
const connectionPort = createLocalConnectionPort();

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [connections, setConnections] = useState<RataryConnection[]>([]);
  const [activeId, setActiveId] = useState<string | null>(() => getActiveConnectionId());

  const refresh = useCallback(async () => {
    setConnections(await connectionPort.list());
    setActiveId(getActiveConnectionId());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, session]);

  const activeConnection = useMemo(
    () => connections.find((c) => c.id === activeId) ?? null,
    [connections, activeId],
  );

  const getApiKey = useCallback(
    (connectionId: string) => connectionPort.getApiKey(connectionId),
    [],
  );

  const hasActiveConnection = useMemo(() => {
    if (session?.legacyApiKey && session.legacyBaseUrl) return true;
    if (
      session?.accessToken &&
      isOidcCloudAutoConnect() &&
      session.expiresAt > Date.now()
    ) {
      return true;
    }
    if (!activeConnection) return false;
    return Boolean(getApiKey(activeConnection.id));
  }, [session, activeConnection, getApiKey]);

  const selectConnection = useCallback((connectionId: string) => {
    setActiveConnectionId(connectionId);
    setActiveId(connectionId);
  }, []);

  const value = useMemo(
    () => ({
      connections,
      activeConnection,
      hasActiveConnection,
      refresh,
      selectConnection,
      getApiKey,
      connectionPort,
    }),
    [
      connections,
      activeConnection,
      hasActiveConnection,
      refresh,
      selectConnection,
      getApiKey,
    ],
  );

  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>;
}

export function useConnection(): ConnectionContextValue {
  const ctx = useContext(ConnectionContext);
  if (!ctx) {
    throw new Error('useConnection must be used within ConnectionProvider');
  }
  return ctx;
}
