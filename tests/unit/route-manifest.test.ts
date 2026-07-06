import { describe, expect, it } from 'vitest';
import { findRouteMeta, routeManifest } from '../../src/presentation/routes/manifest';

describe('route manifest', () => {
  it('defines login as public', () => {
    const login = routeManifest.find((r) => r.path === '/login');
    expect(login?.requiresAuth).toBe(false);
  });

  it('resolves dashboard route', () => {
    const meta = findRouteMeta('/');
    expect(meta?.requiresAuth).toBe(true);
    expect(meta?.requiresConnection).toBe(false);
  });

  it('flags future workspace routes for connection gate', () => {
    const meta = findRouteMeta('/workspace/home');
    expect(meta?.requiresConnection).toBe(true);
  });
});
