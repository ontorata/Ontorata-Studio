import { getDefaultRataryBaseUrl } from '../../config/env';

export interface LegacyStoredSession {
  apiKey: string;
  baseUrl: string;
  workspaceId?: string;
}

const STORAGE_KEY = 'ontorata-studio-auth';

export function readLegacyStoredSession(): LegacyStoredSession | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LegacyStoredSession;
    if (!parsed.apiKey?.trim() || !parsed.baseUrl?.trim()) return null;
    return {
      apiKey: parsed.apiKey.trim(),
      baseUrl: normalizeBaseUrl(parsed.baseUrl),
      workspaceId: parsed.workspaceId?.trim() || undefined,
    };
  } catch {
    return null;
  }
}

export function writeLegacyStoredSession(session: LegacyStoredSession): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      apiKey: session.apiKey.trim(),
      baseUrl: normalizeBaseUrl(session.baseUrl),
      workspaceId: session.workspaceId?.trim() || undefined,
    }),
  );
}

export function clearLegacyStoredSession(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function defaultRataryBaseUrl(): string {
  return getDefaultRataryBaseUrl();
}

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/$/, '').replace(/\/api\/v1$/, '');
}

/** Back-compat aliases for v0.1 imports */
export type AuthSession = LegacyStoredSession;
export const readAuthSession = readLegacyStoredSession;
export const writeAuthSession = writeLegacyStoredSession;
export const clearAuthSession = clearLegacyStoredSession;
