import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LegacyApiKeyAuthAdapter } from '../../src/infrastructure/auth/legacy-api-key-auth';
import { clearLegacyStoredSession } from '../../src/infrastructure/storage/legacy-auth-session';

const store = new Map<string, string>();

vi.mock('../../src/infrastructure/ratary/studio-ratary-client', () => ({
  verifyStudioCredentials: vi.fn().mockResolvedValue({ capabilities: {} }),
}));

beforeEach(() => {
  store.clear();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  });
  clearLegacyStoredSession();
});

describe('LegacyApiKeyAuthAdapter', () => {
  it('implements AuthPort login and logout', async () => {
    const auth = new LegacyApiKeyAuthAdapter();
    expect(auth.isAuthenticated()).toBe(false);

    await auth.login({
      apiKey: 'aic_test',
      baseUrl: 'http://localhost:9876',
    });

    expect(auth.isAuthenticated()).toBe(true);
    const session = auth.getSession();
    expect(session?.legacyApiKey).toBe('aic_test');
    expect(session?.legacyBaseUrl).toBe('http://localhost:9876');

    auth.logout();
    expect(auth.isAuthenticated()).toBe(false);
  });
});
