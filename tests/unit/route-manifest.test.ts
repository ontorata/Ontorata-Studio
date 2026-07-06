import { describe, expect, it } from 'vitest';
import { findRouteMeta, routeManifest } from '../../src/presentation/routes/manifest';

describe('route manifest', () => {
  it('defines login as public', () => {
    const login = routeManifest.find((r) => r.path === '/login');
    expect(login?.requiresAuth).toBe(false);
  });

  it('resolves workspace dashboard route', () => {
    const meta = findRouteMeta('/workspace/personal-default');
    expect(meta?.requiresAuth).toBe(true);
    expect(meta?.requiresConnection).toBe(true);
  });

  it('flags connect wizard before connection gate', () => {
    const meta = findRouteMeta('/connect');
    expect(meta?.requiresAuth).toBe(true);
    expect(meta?.requiresConnection).toBe(false);
    expect(meta?.phase).toBe(5);
  });

  it('flags workspace routes for connection gate', () => {
    const meta = findRouteMeta('/workspace/home/memories');
    expect(meta?.requiresConnection).toBe(true);
  });
});
