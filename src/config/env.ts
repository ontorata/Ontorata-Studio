const PRODUCTION_RATARY_URL = 'https://ratary.ontorata.com';
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

export function isOidcEnabled(): boolean {
  return Boolean(getAuthIssuer());
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

export { DEFAULT_WORKSPACE_ID, PRODUCTION_RATARY_URL };
