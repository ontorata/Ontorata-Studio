import { useConnection } from '../hooks/useConnection';
import { useOrgContext } from '../hooks/useOrgContext';
import { Card, PageHeader } from '../presentation/design-system/primitives';

/** Phase 18 — Connection and org observability panel. */
export function ObservabilityPage() {
  const { activeConnection, connections } = useConnection();
  const org = useOrgContext();

  return (
    <div className="page">
      <PageHeader title="Observability" description="Identity, connection, and org context at a glance." />
      <div className="grid two">
        <Card>
          <h2>Ratary connection</h2>
          {activeConnection ? (
            <dl className="kv">
              <dt>Label</dt>
              <dd>{activeConnection.label ?? activeConnection.id}</dd>
              <dt>Base URL</dt>
              <dd><code>{activeConnection.baseUrl}</code></dd>
              <dt>Mode</dt>
              <dd>{activeConnection.mode}</dd>
              <dt>Saved connections</dt>
              <dd>{connections.length}</dd>
            </dl>
          ) : (
            <p className="muted">Using legacy inline credentials.</p>
          )}
        </Card>
        <Card>
          <h2>Organization (OIDC)</h2>
          {org ? (
            <dl className="kv">
              <dt>Org ID</dt>
              <dd>{org.orgId ?? '—'}</dd>
              <dt>Org name</dt>
              <dd>{org.orgName ?? '—'}</dd>
              <dt>Roles</dt>
              <dd>{org.roles.join(', ') || '—'}</dd>
            </dl>
          ) : (
            <p className="muted">No OIDC org claims (legacy API-key mode or missing token).</p>
          )}
        </Card>
      </div>
    </div>
  );
}
