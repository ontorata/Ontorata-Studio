import type { AuthSession } from '../../domain/auth/session';
import type { LegacyLoginCredentials } from '../../application/auth/auth-port';
import type { AuthPort } from '../../application/auth/auth-port';

export interface RouteDefinition {
  path: string;
  requiresAuth: boolean;
  requiresConnection: boolean;
}

export const routeManifest: RouteDefinition[] = [
  { path: '/login', requiresAuth: false, requiresConnection: false },
  { path: '/', requiresAuth: true, requiresConnection: false },
  { path: '/memories', requiresAuth: true, requiresConnection: false },
  { path: '/memories/:id', requiresAuth: true, requiresConnection: false },
  { path: '/search', requiresAuth: true, requiresConnection: false },
  { path: '/graph', requiresAuth: true, requiresConnection: false },
  { path: '/workspaces', requiresAuth: true, requiresConnection: false },
  { path: '/ontory', requiresAuth: true, requiresConnection: false },
  { path: '/connect', requiresAuth: true, requiresConnection: false },
  { path: '/workspace/*', requiresAuth: true, requiresConnection: true },
];

export function findRouteMeta(pathname: string): RouteDefinition | undefined {
  if (pathname === '/login') return routeManifest.find((r) => r.path === '/login');
  if (pathname.startsWith('/workspace')) {
    return routeManifest.find((r) => r.path === '/workspace/*');
  }
  const exact = routeManifest.find((r) => r.path === pathname);
  if (exact) return exact;
  if (pathname.startsWith('/memories/')) {
    return routeManifest.find((r) => r.path === '/memories/:id');
  }
  return undefined;
}

/** Map domain session to legacy login shape for StudioClientProvider (until Phase 05). */
export function toLegacyCredentials(session: AuthSession): LegacyLoginCredentials | null {
  if (!session.legacyApiKey || !session.legacyBaseUrl) return null;
  return {
    apiKey: session.legacyApiKey,
    baseUrl: session.legacyBaseUrl,
    workspaceId: session.legacyWorkspaceId,
  };
}

export type { AuthPort };
