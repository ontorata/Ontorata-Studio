import type { AuthSession } from '../../domain/auth/session';

export interface LegacyLoginCredentials {
  apiKey: string;
  baseUrl: string;
  workspaceId?: string;
}

export interface AuthPort {
  getSession(): AuthSession | null;
  isAuthenticated(): boolean;
  login(credentials: LegacyLoginCredentials): Promise<void>;
  logout(): void;
}
