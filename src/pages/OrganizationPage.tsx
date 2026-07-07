import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrgContext } from '../hooks/useOrgContext';
import { RataryConnectionNotice } from '../components/RataryConnectionNotice';
import { formatRataryApiError } from '../infrastructure/ratary/format-ratary-api-error';
import { useRataryTabClient } from '../hooks/useRataryTabClient';
import type { WorkspaceRecord } from '../infrastructure/ratary/studio-ratary-client';
import { useWorkspaceBasePath, useWorkspaceId } from '../hooks/useWorkspacePath';
import { Card, PageHeader } from '../presentation/design-system/primitives';

/** Phase 17 — Organization context and workspace switcher. */
export function OrganizationPage() {
  const org = useOrgContext();
  const { client, authLoading, missingConnection } = useRataryTabClient();
  const workspaceId = useWorkspaceId();
  const base = useWorkspaceBasePath();
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client) return;
    client
      .listWorkspaces()
      .then((res) => setWorkspaces(res.workspaces ?? []))
      .catch((err: Error) => setError(formatRataryApiError(err)));
  }, [client]);

  if (authLoading) {
    return (
      <div className="page">
        <p>Loading session…</p>
      </div>
    );
  }

  if (missingConnection) {
    return <RataryConnectionNotice title="Organization" />;
  }

  return (
    <div className="page">
      <PageHeader
        title="Organization"
        description="OIDC organization claims and Ratary workspace scope."
      />
      <div className="grid two">
        <Card>
          <h2>Identity organization</h2>
          {org ? (
            <dl className="kv">
              <dt>Org ID</dt>
              <dd>{org.orgId ?? '—'}</dd>
              <dt>Org name</dt>
              <dd>{org.orgName ?? '—'}</dd>
              <dt>Roles</dt>
              <dd>{org.roles.length ? org.roles.join(', ') : '—'}</dd>
            </dl>
          ) : (
            <p className="muted">No organization claims in OIDC token (personal Zitadel org or legacy mode).</p>
          )}
        </Card>
        <Card>
          <h2>Workspaces</h2>
          <p>
            Active: <code>{workspaceId}</code>
          </p>
          {error && (
            <Card className="ratary-connection-notice">
              <p className="error">{error}</p>
            </Card>
          )}
          <ul className="simple-list">
            {workspaces.map((w) => (
              <li key={w.id}>
                <Link to={`/workspace/${w.id}`}>
                  <strong>{w.name}</strong>
                </Link>
                {w.id === workspaceId && <span className="tag">current</span>}
                {w.slug && <span className="muted"> — {w.slug}</span>}
              </li>
            ))}
            {!workspaces.length && !error && (
              <li className="muted">No workspaces returned — using default scope.</li>
            )}
          </ul>
          <Link to={`${base}/workspaces`} className="btn ghost">
            Workspace admin →
          </Link>
        </Card>
      </div>
    </div>
  );
}
