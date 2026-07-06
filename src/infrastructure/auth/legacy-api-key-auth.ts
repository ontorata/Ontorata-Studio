import type { AuthPort, LegacyLoginCredentials } from '../../application/auth/auth-port';
import type { AuthSession } from '../../domain/auth/session';
import { verifyStudioCredentials } from '../ratary/studio-ratary-client';
import {
  clearLegacyStoredSession,
  readLegacyStoredSession,
  writeLegacyStoredSession,
} from '../storage/legacy-auth-session';

const LEGACY_SUBJECT = 'legacy-api-key-user';

function toDomainSession(stored: NonNullable<ReturnType<typeof readLegacyStoredSession>>): AuthSession {
  return {
    subject: LEGACY_SUBJECT,
    expiresAt: Number.MAX_SAFE_INTEGER,
    legacyApiKey: stored.apiKey,
    legacyBaseUrl: stored.baseUrl,
    legacyWorkspaceId: stored.workspaceId,
  };
}

/** v0.1 API-key auth behind AuthPort until Phase 04 OIDC. */
export class LegacyApiKeyAuthAdapter implements AuthPort {
  getSession(): AuthSession | null {
    const stored = readLegacyStoredSession();
    return stored ? toDomainSession(stored) : null;
  }

  isAuthenticated(): boolean {
    return readLegacyStoredSession() !== null;
  }

  async login(credentials: LegacyLoginCredentials): Promise<void> {
    await verifyStudioCredentials(credentials);
    writeLegacyStoredSession(credentials);
  }

  logout(): void {
    clearLegacyStoredSession();
  }
}

export function createLegacyApiKeyAuth(): AuthPort {
  return new LegacyApiKeyAuthAdapter();
}
