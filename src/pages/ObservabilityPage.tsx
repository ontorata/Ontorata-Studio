import { useCallback, useEffect, useState } from 'react';
import { isOidcCloudAutoConnect } from '../config/env';
import { useAuth } from '../hooks/useAuth';
import { useConnection } from '../hooks/useConnection';
import { useOrgContext } from '../hooks/useOrgContext';
import { RataryConnectionNotice } from '../components/RataryConnectionNotice';
import { formatRataryApiError } from '../infrastructure/ratary/format-ratary-api-error';
import { useRataryTabClient } from '../hooks/useRataryTabClient';
import type { HealthStatus } from '../infrastructure/ratary/studio-ratary-client';
import { useCapabilities } from '../hooks/useCapabilities';
import { Button, Card, PageHeader } from '../presentation/design-system/primitives';

/** Phase 18 — Connection, health, and identity observability. */
export function ObservabilityPage() {
  const { session, authMode } = useAuth();
  const { activeConnection, connections } = useConnection();
  const org = useOrgContext();
  const { client, authLoading, missingConnection } = useRataryTabClient();
  const { manifest, loading: capsLoading } = useCapabilities();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [polledAt, setPolledAt] = useState<string | null>(null);

  const pollHealth = useCallback(() => {
    if (!client) return;
    client
      .getHealth()
      .then((h) => {
        setHealth(h);
        setHealthError(null);
        setPolledAt(new Date().toISOString());
      })
      .catch((err: Error) => setHealthError(formatRataryApiError(err)));
  }, [client]);

  useEffect(() => {
    pollHealth();
    const id = window.setInterval(pollHealth, 30_000);
    return () => window.clearInterval(id);
  }, [pollHealth]);

  const connectionMode = isOidcCloudAutoConnect()
    ? 'OIDC cloud auto-connect'
    : activeConnection
      ? `Saved (${activeConnection.mode})`
      : session?.legacyApiKey
        ? 'Legacy inline API key'
        : 'Unknown';

  if (authLoading) {
    return (
      <div className="page">
        <p>Loading session…</p>
      </div>
    );
  }

  if (missingConnection) {
    return <RataryConnectionNotice title="System Health" />;
  }

  return (
    <div className="page">
      <PageHeader
        title="Observability"
        description="Health, identity, and connection telemetry for operators."
        actions={
          <Button type="button" variant="ghost" onClick={pollHealth}>
            Refresh health
          </Button>
        }
      />
      <div className="grid two">
        <Card>
          <h2>Ratary health</h2>
          {healthError && <p className="error">{healthError}</p>}
          {health && (
            <dl className="kv">
              <dt>Status</dt>
              <dd className={health.status === 'ok' ? 'ok-text' : 'warn'}>{health.status}</dd>
              <dt>Service</dt>
              <dd>{health.service ?? 'ratary'}</dd>
              {health.checks &&
                Object.entries(health.checks).map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              {polledAt && (
                <>
                  <dt>Last poll</dt>
                  <dd>{polledAt}</dd>
                </>
              )}
            </dl>
          )}
        </Card>
        <Card>
          <h2>Session</h2>
          <dl className="kv">
            <dt>Auth mode</dt>
            <dd>{authMode}</dd>
            <dt>Connection</dt>
            <dd>{connectionMode}</dd>
            <dt>Subject</dt>
            <dd>{session?.subject ?? '—'}</dd>
            <dt>Token expiry</dt>
            <dd>{session?.expiresAt ? new Date(session.expiresAt).toLocaleString() : '—'}</dd>
            <dt>Saved connections</dt>
            <dd>{connections.length}</dd>
            {activeConnection && (
              <>
                <dt>Base URL</dt>
                <dd><code>{activeConnection.baseUrl}</code></dd>
              </>
            )}
          </dl>
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
            <p className="muted">No OIDC org claims.</p>
          )}
        </Card>
        <Card>
          <h2>Capabilities snapshot</h2>
          {capsLoading && <p>Loading…</p>}
          {manifest && (
            <dl className="kv">
              <dt>Protocol</dt>
              <dd>{manifest.protocolVersion}</dd>
              <dt>Studio OIDC on server</dt>
              <dd>{manifest.transport?.rest?.studioOidc?.enabled ? 'Yes' : 'No'}</dd>
              <dt>MCP tools</dt>
              <dd>{manifest.mcp?.toolCount ?? '—'}</dd>
            </dl>
          )}
        </Card>
      </div>
    </div>
  );
}
