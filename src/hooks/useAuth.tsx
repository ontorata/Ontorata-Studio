import {

  createContext,

  useCallback,

  useContext,

  useEffect,

  useMemo,

  useState,

  type ReactNode,

} from 'react';

import type {

  LegacyLoginCredentials,

  NativeLoginCredentials,

  NativeRegisterInput,

} from '../application/auth/auth-port';

import type { AuthSession } from '../domain/auth/session';

import { createAuthPort } from '../infrastructure/auth/create-auth-port';

import { OidcAuthAdapter } from '../infrastructure/auth/oidc-auth-adapter';

import { RataryNativeAuthAdapter } from '../infrastructure/auth/ratary-native-auth-adapter';

import { clearAllConnectionData } from '../infrastructure/storage/connection-store';



interface AuthContextValue {

  session: AuthSession | null;

  isAuthenticated: boolean;

  authMode: 'legacy' | 'oidc' | 'native';

  login: (input?: LegacyLoginCredentials | NativeLoginCredentials) => Promise<void>;

  register: (input: NativeRegisterInput) => Promise<void>;

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



function readInitialSession(): AuthSession | null {

  if (authPort.mode === 'oidc') return null;

  return authPort.getSession();

}



export function AuthProvider({ children }: { children: ReactNode }) {

  const [session, setSession] = useState<AuthSession | null>(readInitialSession);

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



  const login = useCallback(async (input?: LegacyLoginCredentials | NativeLoginCredentials) => {

    if (authPort.mode === 'oidc') {

      await authPort.login();

      return;

    }

    if (authPort.mode === 'native') {

      if (!input || !('email' in input)) {

        throw new Error('Email and password required');

      }

      await (authPort as RataryNativeAuthAdapter).login(input);

      setSession(authPort.getSession());

      return;

    }

    if (!input || !('apiKey' in input)) {

      throw new Error('API key credentials required');

    }

    await authPort.login(input);

    setSession(authPort.getSession());

  }, []);



  const register = useCallback(async (input: NativeRegisterInput) => {

    if (authPort.mode !== 'native') {

      throw new Error('Registration is only available with native auth');

    }

    await (authPort as RataryNativeAuthAdapter).register(input);

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

      register,

      completeOidcRedirect,

      logout,

      loading,

    }),

    [session, login, register, completeOidcRedirect, logout, loading],

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


