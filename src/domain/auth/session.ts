/** Domain auth session — OIDC fields added in Phase 04. */
export interface AuthSession {
  subject: string;
  expiresAt: number;
  idToken?: string;
  accessToken?: string;
  legacyApiKey?: string;
  legacyBaseUrl?: string;
  legacyWorkspaceId?: string;
}
