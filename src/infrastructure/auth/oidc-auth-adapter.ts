import { UserManager, WebStorageStateStore, type User } from 'oidc-client-ts';
import type { AuthPort } from '../../application/auth/auth-port';
import type { AuthSession } from '../../domain/auth/session';
import { getAuthClientId, getAuthIssuer, getDefaultWorkspaceId } from '../../config/env';

const OIDC_STORAGE_KEY = 'ontorata-studio-oidc';

function userToSession(user: User): AuthSession {
  return {
    subject: user.profile.sub ?? 'unknown',
    expiresAt: (user.expires_at ?? 0) * 1000,
    idToken: user.id_token,
    accessToken: user.access_token,
  };
}

function createUserManager(): UserManager {
  const issuer = getAuthIssuer();
  if (!issuer) {
    throw new Error('VITE_AUTH_ISSUER is required for OIDC auth');
  }

  return new UserManager({
    authority: issuer.replace(/\/$/, ''),
    client_id: getAuthClientId(),
    redirect_uri: `${window.location.origin}/callback`,
    post_logout_redirect_uri: `${window.location.origin}/workspace/${getDefaultWorkspaceId()}`,
    response_type: 'code',
    scope: 'openid profile email',
    automaticSilentRenew: true,
    userStore: new WebStorageStateStore({ store: window.sessionStorage, prefix: OIDC_STORAGE_KEY }),
  });
}

/** Phase 04 — Keycloak OIDC PKCE behind AuthPort. */
export class OidcAuthAdapter implements AuthPort {
  readonly mode = 'oidc' as const;
  private readonly userManager: UserManager;

  constructor(userManager?: UserManager) {
    this.userManager = userManager ?? createUserManager();
  }

  getSession(): AuthSession | null {
    return null;
  }

  async getSessionAsync(): Promise<AuthSession | null> {
    const user = await this.userManager.getUser();
    if (!user || user.expired) return null;
    return userToSession(user);
  }

  isAuthenticated(): boolean {
    return false;
  }

  async isAuthenticatedAsync(): Promise<boolean> {
    const session = await this.getSessionAsync();
    return session !== null;
  }

  async login(): Promise<void> {
    await this.userManager.signinRedirect();
  }

  async completeRedirect(): Promise<void> {
    await this.userManager.signinRedirectCallback();
  }

  async logout(): Promise<void> {
    const user = await this.userManager.getUser();
    await this.userManager.removeUser();
    if (user?.id_token) {
      await this.userManager.signoutRedirect({ id_token_hint: user.id_token });
      return;
    }
    await this.userManager.signoutRedirect();
  }

  getUserManager(): UserManager {
    return this.userManager;
  }
}

export function createOidcAuth(): OidcAuthAdapter {
  return new OidcAuthAdapter();
}
