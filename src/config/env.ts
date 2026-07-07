import type { AuthSession } from '../domain/auth/session';

const PRODUCTION_RATARY_URL = 'https://ratary.ontorata.com';
const PRODUCTION_AUTH_URL = 'https://auth.ontorata.com';
const DEFAULT_WORKSPACE_ID = 'personal-default';

export type StudioProfile = 'local' | 'staging' | 'production';

export function getStudioProfile(): StudioProfile {
  const raw = import.meta.env.VITE_STUDIO_PROFILE?.trim().toLowerCase();
  if (raw === 'local' || raw === 'staging' || raw === 'production') return raw;
  return import.meta.env.PROD ? 'production' : 'local';
}

export function getAuthIssuer(): string | undefined {
  return import.meta.env.VITE_AUTH_ISSUER?.trim() || undefined;
}

export function getAuthClientId(): string {
  return import.meta.env.VITE_AUTH_CLIENT_ID?.trim() || 'studio-spa';
}

export function getDefaultRataryBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_RATARY_BASE_URL?.trim();
  if (fromEnv) return fromEnv;
  if (import.meta.env.PROD) return PRODUCTION_RATARY_URL;
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:9876';
}

/** Auth API — register/login only (auth.ontorata.com). Memory API uses Ratary URL. */
export function getAuthBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_AUTH_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (import.meta.env.PROD) return PRODUCTION_AUTH_URL;
  return 'http://localhost:8780';
}

export function isOidcEnabled(): boolean {
  return Boolean(getAuthIssuer());
}

/** Inline email/password — auth.ontorata.com gateway. Takes precedence over legacy Zitadel OIDC. */
export function isNativeAuthEnabled(): boolean {
  const flag =
    import.meta.env.VITE_NATIVE_AUTH?.trim().toLowerCase() ??
    import.meta.env.VITE_STUDIO_NATIVE_AUTH?.trim().toLowerCase();
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  if (import.meta.env.VITE_AUTH_BASE_URL?.trim()) return true;
  if (isOidcEnabled()) return false;
  return import.meta.env.PROD;
}

/** Bearer JWT to Ratary (OIDC cloud or native accounts). */
export function isRataryBearerAuth(): boolean {
  if (isOidcCloudAutoConnect()) return true;
  return isNativeAuthEnabled();
}

/** Phase 2 — OIDC users auto-connect to configured cloud Ratary (no AIC wizard). */
export function isOidcCloudAutoConnect(): boolean {
  if (!isOidcEnabled()) return false;
  if (import.meta.env.VITE_STUDIO_OIDC_AUTO_CONNECT === 'false') return false;
  return Boolean(getDefaultRataryBaseUrl());
}

export function getDefaultWorkspaceId(): string {
  return import.meta.env.VITE_RATARY_WORKSPACE_ID?.trim() || DEFAULT_WORKSPACE_ID;
}

/** Prefer Ratary-provisioned workspace from native/legacy session over Studio placeholder. */
export function resolveWorkspaceId(session: AuthSession | null | undefined): string {
  if (session?.nativeWorkspaceId) return session.nativeWorkspaceId;
  if (session?.legacyWorkspaceId) return session.legacyWorkspaceId;
  return getDefaultWorkspaceId();
}

export { DEFAULT_WORKSPACE_ID, PRODUCTION_RATARY_URL, PRODUCTION_AUTH_URL };
