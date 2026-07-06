import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { LegacyLoginCredentials } from '../application/auth/auth-port';
import type { AuthSession } from '../domain/auth/session';
import { createLegacyApiKeyAuth } from '../infrastructure/auth/legacy-api-key-auth';

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (input: LegacyLoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const authPort = createLegacyApiKeyAuth();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => authPort.getSession());

  const login = useCallback(async (input: LegacyLoginCredentials) => {
    await authPort.login(input);
    setSession(authPort.getSession());
  }, []);

  const logout = useCallback(() => {
    authPort.logout();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: session !== null,
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
