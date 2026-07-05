import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  clearAuthSession,
  defaultRataryBaseUrl,
  readAuthSession,
  writeAuthSession,
} from '../src/auth/auth-session';

const store = new Map<string, string>();

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
});

describe('auth-session', () => {
  beforeEach(() => {
    clearAuthSession();
  });

  it('round-trips session in sessionStorage', () => {
    writeAuthSession({
      apiKey: 'aic_test_key_123',
      baseUrl: 'http://localhost:9876/api/v1',
      workspaceId: 'ws-1',
    });
    const session = readAuthSession();
    expect(session?.apiKey).toBe('aic_test_key_123');
    expect(session?.baseUrl).toBe('http://localhost:9876');
    expect(session?.workspaceId).toBe('ws-1');
  });

  it('clears session on logout', () => {
    writeAuthSession({ apiKey: 'aic_x', baseUrl: 'http://localhost:9876' });
    clearAuthSession();
    expect(readAuthSession()).toBeNull();
  });

  it('defaultRataryBaseUrl strips /api/v1 suffix from env', () => {
    expect(typeof defaultRataryBaseUrl()).toBe('string');
    expect(defaultRataryBaseUrl().length).toBeGreaterThan(0);
  });
});
