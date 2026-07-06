import type { AuthSession } from '../../domain/auth/session';
import type { LegacyLoginCredentials } from '../../application/auth/auth-port';
import type { AuthPort } from '../../application/auth/auth-port';

export interface RouteDefinition {
  path: string;
  requiresAuth: boolean;
  requiresConnection: boolean;
  phase?: number;
}

export const routeManifest: RouteDefinition[] = [
  { path: '/login', requiresAuth: false, requiresConnection: false },
  { path: '/callback', requiresAuth: false, requiresConnection: false, phase: 4 },
  { path: '/connect', requiresAuth: true, requiresConnection: false, phase: 5 },
  { path: '/workspace/:workspaceId', requiresAuth: true, requiresConnection: true, phase: 6 },
  { path: '/workspace/:workspaceId/memories', requiresAuth: true, requiresConnection: true, phase: 11 },
  { path: '/workspace/:workspaceId/memories/:id', requiresAuth: true, requiresConnection: true, phase: 11 },
  { path: '/workspace/:workspaceId/search', requiresAuth: true, requiresConnection: true, phase: 11 },
  { path: '/workspace/:workspaceId/graph', requiresAuth: true, requiresConnection: true, phase: 11 },
  { path: '/workspace/:workspaceId/ontory/chat', requiresAuth: true, requiresConnection: true, phase: 7 },
  { path: '/workspace/:workspaceId/profiles', requiresAuth: true, requiresConnection: true, phase: 8 },
  { path: '/workspace/:workspaceId/stacks', requiresAuth: true, requiresConnection: true, phase: 9 },
  { path: '/workspace/:workspaceId/stack-builder', requiresAuth: true, requiresConnection: true, phase: 10 },
  { path: '/workspace/:workspaceId/knowledge', requiresAuth: true, requiresConnection: true, phase: 12 },
  { path: '/workspace/:workspaceId/mcp', requiresAuth: true, requiresConnection: true, phase: 13 },
  { path: '/workspace/:workspaceId/agents', requiresAuth: true, requiresConnection: true, phase: 14 },
  { path: '/workspace/:workspaceId/models', requiresAuth: true, requiresConnection: true, phase: 15 },
  { path: '/workspace/:workspaceId/coding', requiresAuth: true, requiresConnection: true, phase: 16 },
  { path: '/workspace/:workspaceId/organization', requiresAuth: true, requiresConnection: true, phase: 17 },
  { path: '/workspace/:workspaceId/observability', requiresAuth: true, requiresConnection: true, phase: 18 },
  { path: '/workspace/:workspaceId/enterprise', requiresAuth: true, requiresConnection: true, phase: 19 },
  { path: '/workspace/:workspaceId/security', requiresAuth: true, requiresConnection: true, phase: 20 },
];

export function findRouteMeta(pathname: string): RouteDefinition | undefined {
  if (pathname === '/login') return routeManifest.find((r) => r.path === '/login');
  if (pathname === '/callback') return routeManifest.find((r) => r.path === '/callback');
  if (pathname === '/connect') return routeManifest.find((r) => r.path === '/connect');
  if (pathname.startsWith('/workspace')) {
    const exact = routeManifest.find((r) => {
      if (!r.path.startsWith('/workspace')) return false;
      const pattern = r.path.replace(':workspaceId', '[^/]+').replace(':id', '[^/]+');
      return new RegExp(`^${pattern}$`).test(pathname);
    });
    return exact ?? routeManifest.find((r) => r.path === '/workspace/:workspaceId');
  }
  return undefined;
}

/** Map domain session to legacy login shape for StudioClientProvider. */
export function toLegacyCredentials(session: AuthSession): LegacyLoginCredentials | null {
  if (!session.legacyApiKey || !session.legacyBaseUrl) return null;
  return {
    apiKey: session.legacyApiKey,
    baseUrl: session.legacyBaseUrl,
    workspaceId: session.legacyWorkspaceId,
  };
}

export type { AuthPort };
