import type { AuthSession } from '../../domain/auth/session';

export type AuthMode = 'legacy' | 'oidc' | 'native';

export interface LegacyLoginCredentials {
  apiKey: string;
  baseUrl: string;
  organizationId?: string;
  workspaceId?: string;
}

export interface NativeLoginCredentials {
  email: string;
  password: string;
}

export interface NativeRegisterInput {
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthPort {
  readonly mode: AuthMode;
  getSession(): AuthSession | null;
  isAuthenticated(): boolean;
  login(credentials?: LegacyLoginCredentials | NativeLoginCredentials): Promise<void>;
  register?(input: NativeRegisterInput): Promise<void>;
  logout(): void | Promise<void>;
}
