export interface AuthSession {
  apiKey: string;
  baseUrl: string;
  workspaceId?: string;
}

const STORAGE_KEY = 'ontorata-studio-auth';

export function readAuthSession(): AuthSession | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed.apiKey?.trim() || !parsed.baseUrl?.trim()) return null;
    return {
      apiKey: parsed.apiKey.trim(),
      baseUrl: parsed.baseUrl.trim().replace(/\/$/, '').replace(/\/api\/v1$/, ''),
      workspaceId: parsed.workspaceId?.trim() || undefined,
    };
  } catch {
    return null;
  }
}

export function writeAuthSession(session: AuthSession): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      apiKey: session.apiKey.trim(),
      baseUrl: session.baseUrl.trim().replace(/\/$/, '').replace(/\/api\/v1$/, ''),
      workspaceId: session.workspaceId?.trim() || undefined,
    }),
  );
}

export function clearAuthSession(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function defaultRataryBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_RATARY_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '').replace(/\/api\/v1$/, '');
  return import.meta.env.PROD ? 'https://ratary.ontorata.com' : 'http://localhost:9876';
}
