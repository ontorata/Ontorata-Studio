/** Domain auth session — OIDC, native JWT, or legacy API key. */
export interface AuthSession {
  subject: string;
  expiresAt: number;
  idToken?: string;
  accessToken?: string;
  legacyApiKey?: string;
  legacyBaseUrl?: string;
  legacyWorkspaceId?: string;
  nativeEmail?: string;
  nativeDisplayName?: string;
  nativeOwnerId?: string;
}
