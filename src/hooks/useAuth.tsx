import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { LegacyLoginCredentials } from '../application/auth/auth-port';
import type { AuthSession } from '../domain/auth/session';
import { createAuthPort } from '../infrastructure/auth/create-auth-port';
import { OidcAuthAdapter } from '../infrastructure/auth/oidc-auth-adapter';
import { clearAllConnectionData } from '../infrastructure/storage/connection-store';

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  authMode: 'legacy' | 'oidc';
  login: (input?: LegacyLoginCredentials) => Promise<void>;
  completeOidcRedirect: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const authPort = createAuthPort();

async function loadSession(): Promise<AuthSession | null> {
  if (authPort.mode === 'oidc') {
    return (authPort as OidcAuthAdapter).getSessionAsync();
  }
  return authPort.getSession();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(authPort.mode === 'oidc');

  useEffect(() => {
    let cancelled = false;
    void loadSession().then((next) => {
      if (!cancelled) {
        setSession(next);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input?: LegacyLoginCredentials) => {
    if (authPort.mode === 'oidc') {
      await authPort.login();
      return;
    }
    if (!input) {
      throw new Error('API key credentials required');
    }
    await authPort.login(input);
    setSession(authPort.getSession());
  }, []);

  const completeOidcRedirect = useCallback(async () => {
    if (authPort.mode !== 'oidc') return;
    await (authPort as OidcAuthAdapter).completeRedirect();
    setSession(await (authPort as OidcAuthAdapter).getSessionAsync());
  }, []);

  const logout = useCallback(async () => {
    if (authPort.mode === 'oidc') {
      await authPort.logout();
    } else {
      authPort.logout();
    }
    clearAllConnectionData();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: session !== null,
      authMode: authPort.mode,
      login,
      completeOidcRedirect,
      logout,
      loading,
    }),
    [session, login, completeOidcRedirect, logout, loading],
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
