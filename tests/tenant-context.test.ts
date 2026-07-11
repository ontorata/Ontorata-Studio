import { describe, expect, it } from 'vitest';
import type { AuthSession } from '../src/domain/auth/session';
import {
  buildStudioTenantHeaders,
  resolveStudioTenantContext,
} from '../src/config/tenant-context';

function session(partial: Partial<AuthSession> & { subject: string }): AuthSession {
  return {
    expiresAt: Date.now() + 60_000,
    ...partial,
  };
}

describe('resolveStudioTenantContext', () => {
  it('returns identity + tenant from native session', () => {
    const ctx = resolveStudioTenantContext(
      session({
        subject: 'identity-1',
        nativeOrganizationId: 'org-1',
        nativeWorkspaceId: 'ws-1',
      }),
    );

    expect(ctx).toEqual({
      identityId: 'identity-1',
      organizationId: 'org-1',
      workspaceId: 'ws-1',
    });
  });

  it('prefers route workspace over session placeholder', () => {
    const ctx = resolveStudioTenantContext(
      session({
        subject: 'identity-1',
        nativeOrganizationId: 'org-1',
        nativeWorkspaceId: 'personal-default',
      }),
      'ws-route',
    );

    expect(ctx?.workspaceId).toBe('ws-route');
    expect(ctx?.organizationId).toBe('org-1');
  });

  it('returns null when organization is missing', () => {
    expect(
      resolveStudioTenantContext(
        session({
          subject: 'identity-1',
          nativeWorkspaceId: 'ws-1',
        }),
      ),
    ).toBeNull();
  });

  it('builds Ratary tenant headers', () => {
    const headers = buildStudioTenantHeaders({
      identityId: 'identity-1',
      organizationId: 'org-1',
      workspaceId: 'ws-1',
    });

    expect(headers).toEqual({
      'X-Organization-Id': 'org-1',
      'X-Workspace-Id': 'ws-1',
    });
  });
});
