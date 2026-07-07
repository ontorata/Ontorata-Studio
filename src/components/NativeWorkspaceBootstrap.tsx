import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getDefaultWorkspaceId } from '../config/env';
import { useAuth } from '../hooks/useAuth';
import { useOptionalStudioClient } from '../hooks/useStudioClient';

const SESSION_KEY = 'ontorata-studio-native-session';
const PLACEHOLDER_WS = getDefaultWorkspaceId();

/** Resolve Ratary workspace UUID for native auth (fixes personal-default placeholder). */
export function NativeWorkspaceBootstrap({ children }: { children: ReactNode }) {
  const { session, authMode } = useAuth();
  const { workspaceId: routeWorkspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const client = useOptionalStudioClient();
  const [ready, setReady] = useState(authMode !== 'native');

  useEffect(() => {
    if (authMode !== 'native' || !session?.accessToken) {
      setReady(true);
      return;
    }

    let cancelled = false;

    async function syncWorkspace(): Promise<void> {
      let workspaceId = session?.nativeWorkspaceId;

      if (!workspaceId && client) {
        try {
          const { workspaces } = await client.listWorkspaces();
          const defaultWs = workspaces.find((w) => w.slug === 'default') ?? workspaces[0];
          workspaceId = defaultWs?.id;
          if (workspaceId) {
            const raw = sessionStorage.getItem(SESSION_KEY);
            if (raw) {
              const parsed = JSON.parse(raw) as Record<string, unknown>;
              parsed.workspaceId = workspaceId;
              sessionStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
            }
          }
        } catch {
          if (!cancelled) setReady(true);
          return;
        }
      }

      if (cancelled) return;

      if (workspaceId && routeWorkspaceId === PLACEHOLDER_WS) {
        const suffix = location.pathname.replace(`/workspace/${PLACEHOLDER_WS}`, '');
        navigate(`/workspace/${workspaceId}${suffix}${location.search}`, { replace: true });
        return;
      }

      setReady(true);
    }

    void syncWorkspace();
    return () => {
      cancelled = true;
    };
  }, [
    authMode,
    client,
    location.pathname,
    location.search,
    navigate,
    routeWorkspaceId,
    session?.accessToken,
    session?.nativeWorkspaceId,
  ]);

  if (!ready) return null;
  return <>{children}</>;
}
