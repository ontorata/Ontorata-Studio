import type { AuthPort, NativeLoginCredentials, NativeRegisterInput } from '../../application/auth/auth-port';
import type { AuthSession } from '../../domain/auth/session';
import { getAuthBaseUrl, getDefaultRataryBaseUrl } from '../../config/env';

const SESSION_KEY = 'ontorata-studio-native-session';

interface StoredNativeSession {
  subject: string;
  email: string;
  displayName: string;
  accessToken: string;
  expiresAt: number;
  ownerId: string;
  organizationId?: string;
  workspaceId?: string;
}

interface StudioAuthResponse {
  success: boolean;
  data?: {
    accessToken: string;
    expiresIn: number;
    tokenType: string;
    ownerId: string;
    identityId: string;
    organizationId?: string;
    email: string;
    displayName: string;
    workspaceId?: string;
  };
  error?: { message?: string };
}

function readStored(): StoredNativeSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredNativeSession;
    if (!parsed.accessToken || parsed.expiresAt <= Date.now()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(session: StoredNativeSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function toAuthSession(stored: StoredNativeSession): AuthSession {
  return {
    subject: stored.subject,
    expiresAt: stored.expiresAt,
    accessToken: stored.accessToken,
    nativeEmail: stored.email,
    nativeDisplayName: stored.displayName,
    nativeOwnerId: stored.ownerId,
    nativeOrganizationId: stored.organizationId,
    nativeWorkspaceId: stored.workspaceId,
  };
}

function formatAuthFetchError(err: unknown, baseUrl: string): Error {
  const message = err instanceof Error ? err.message : 'Auth request failed';
  const lower = message.toLowerCase();
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network request failed') ||
    lower.includes('load failed')
  ) {
    return new Error(
      `Cannot reach Auth Gateway at ${baseUrl}. Restart Studio dev server after env changes, or start auth locally (npm run dev in auth-ontorata on :8780).`,
    );
  }
  return err instanceof Error ? err : new Error(message);
}

async function postAuth(path: string, body: Record<string, string>): Promise<StudioAuthResponse['data']> {
  const baseUrl = getAuthBaseUrl();
  if (import.meta.env.PROD && !baseUrl.startsWith('https://')) {
    throw new Error('Production Studio requires HTTPS auth URL');
  }
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/v1/auth/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw formatAuthFetchError(err, baseUrl);
  }
  const json = (await response.json()) as StudioAuthResponse;
  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.error?.message ?? `Auth failed (${response.status})`);
  }
  return json.data;
}

function persistAuthSession(data: NonNullable<StudioAuthResponse['data']>): void {
  const expiresAt = Date.now() + data.expiresIn * 1000;
  writeStored({
    subject: data.identityId,
    email: data.email,
    displayName: data.displayName,
    accessToken: data.accessToken,
    expiresAt,
    ownerId: data.ownerId,
    organizationId: data.organizationId,
    workspaceId: data.workspaceId,
  });
}

async function backfillTenantFromWorkspaces(
  accessToken: string,
  current: { organizationId?: string; workspaceId?: string },
): Promise<{ organizationId?: string; workspaceId?: string }> {
  if (current.organizationId && current.workspaceId) {
    return current;
  }

  const baseUrl = getDefaultRataryBaseUrl().replace(/\/$/, '').replace(/\/api\/v1$/, '');
  try {
    const response = await fetch(`${baseUrl}/api/v1/workspaces`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) return current;

    const json = (await response.json()) as {
      workspaces?: Array<{ id: string; organizationId?: string; slug?: string }>;
    };
    const defaultWs =
      json.workspaces?.find((workspace) => workspace.slug === 'default') ?? json.workspaces?.[0];

    return {
      organizationId: current.organizationId ?? defaultWs?.organizationId,
      workspaceId: current.workspaceId ?? defaultWs?.id,
    };
  } catch {
    return current;
  }
}

async function persistAuthSessionWithTenant(
  data: NonNullable<StudioAuthResponse['data']>,
): Promise<void> {
  const tenant = await backfillTenantFromWorkspaces(data.accessToken, {
    organizationId: data.organizationId,
    workspaceId: data.workspaceId,
  });
  persistAuthSession({ ...data, ...tenant });
}

/** Update tenant fields after workspace bootstrap (listWorkspaces). */
export function updateNativeSessionTenant(input: {
  organizationId?: string;
  workspaceId?: string;
}): void {
  const stored = readStored();
  if (!stored) return;
  writeStored({
    ...stored,
    organizationId: input.organizationId ?? stored.organizationId,
    workspaceId: input.workspaceId ?? stored.workspaceId,
  });
}

/** Built-in Ratary email/password auth — no Zitadel or Keycloak. */
export class RataryNativeAuthAdapter implements AuthPort {
  readonly mode = 'native' as const;

  getSession(): AuthSession | null {
    const stored = readStored();
    return stored ? toAuthSession(stored) : null;
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  async login(credentials?: NativeLoginCredentials): Promise<void> {
    if (!credentials) {
      throw new Error('Email and password required');
    }
    const data = await postAuth('login', {
      email: credentials.email,
      password: credentials.password,
    });
    if (!data) throw new Error('Login failed');
    await persistAuthSessionWithTenant(data);
  }

  async register(input: NativeRegisterInput): Promise<void> {
    const data = await postAuth('register', {
      email: input.email,
      password: input.password,
      display_name: input.displayName ?? '',
    });
    if (!data) throw new Error('Registration failed');
    await persistAuthSessionWithTenant(data);
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function createRataryNativeAuth(): RataryNativeAuthAdapter {
  return new RataryNativeAuthAdapter();
}
