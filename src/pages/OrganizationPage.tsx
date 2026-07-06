import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrgContext } from '../hooks/useOrgContext';
import { useStudioClient } from '../hooks/useStudioClient';
import type { WorkspaceRecord } from '../infrastructure/ratary/studio-ratary-client';
import { useWorkspaceBasePath, useWorkspaceId } from '../hooks/useWorkspacePath';
import { Card, PageHeader } from '../presentation/design-system/primitives';

/** Phase 17 — Organization context and workspace switcher. */
export function OrganizationPage() {
  const org = useOrgContext();
  const client = useStudioClient();
  const workspaceId = useWorkspaceId();
  const base = useWorkspaceBasePath();
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    client
      .listWorkspaces()
      .then((res) => setWorkspaces(res.workspaces ?? []))
      .catch((err: Error) => setError(err.message));
  }, [client]);

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
          {error && <p className="error">{error}</p>}
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
