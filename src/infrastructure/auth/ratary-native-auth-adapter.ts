import type { AuthPort, NativeLoginCredentials, NativeRegisterInput } from '../../application/auth/auth-port';
import type { AuthSession } from '../../domain/auth/session';
import { getAuthBaseUrl } from '../../config/env';

const SESSION_KEY = 'ontorata-studio-native-session';

interface StoredNativeSession {
  subject: string;
  email: string;
  displayName: string;
  accessToken: string;
  expiresAt: number;
  ownerId: string;
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
    nativeWorkspaceId: stored.workspaceId,
  };
}

async function postAuth(path: string, body: Record<string, string>): Promise<StudioAuthResponse['data']> {
  const baseUrl = getAuthBaseUrl();
  if (import.meta.env.PROD && !baseUrl.startsWith('https://')) {
    throw new Error('Production Studio requires HTTPS auth URL');
  }
  const response = await fetch(`${baseUrl}/api/v1/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const json = (await response.json()) as StudioAuthResponse;
  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.error?.message ?? `Auth failed (${response.status})`);
  }
  return json.data;
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
    const expiresAt = Date.now() + data.expiresIn * 1000;
    writeStored({
      subject: data.identityId,
      email: data.email,
      displayName: data.displayName,
      accessToken: data.accessToken,
      expiresAt,
      ownerId: data.ownerId,
      workspaceId: data.workspaceId,
    });
  }

  async register(input: NativeRegisterInput): Promise<void> {
    const data = await postAuth('register', {
      email: input.email,
      password: input.password,
      display_name: input.displayName ?? '',
    });
    if (!data) throw new Error('Registration failed');
    const expiresAt = Date.now() + data.expiresIn * 1000;
    writeStored({
      subject: data.identityId,
      email: data.email,
      displayName: data.displayName,
      accessToken: data.accessToken,
      expiresAt,
      ownerId: data.ownerId,
      workspaceId: data.workspaceId,
    });
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function createRataryNativeAuth(): RataryNativeAuthAdapter {
  return new RataryNativeAuthAdapter();
}
