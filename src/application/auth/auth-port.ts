import type { AuthSession } from '../../domain/auth/session';

export type AuthMode = 'legacy' | 'oidc';

export interface LegacyLoginCredentials {
  apiKey: string;
  baseUrl: string;
  workspaceId?: string;
}

export interface AuthPort {
  readonly mode: AuthMode;
  getSession(): AuthSession | null;
  isAuthenticated(): boolean;
  login(credentials?: LegacyLoginCredentials): Promise<void>;
  logout(): void | Promise<void>;
}
