import { useEffect, useState } from 'react';
import type { HealthStatus } from '../api/ratary-client';
import { useCapabilities } from '../hooks/useCapabilities';
import { useStudioClient } from '../hooks/useStudioClient';

export function HomePage() {
  const client = useStudioClient();
  const { manifest, capabilities, loading, error } = useCapabilities();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    client
      .getHealth()
      .then(setHealth)
      .catch((err: Error) => setHealthError(err.message));
  }, [client]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>
          Operator view of your Ratary memory brain — authenticated session via{' '}
          <code>@ratary/sdk</code>.
        </p>
      </header>
      <div className="grid two">
        <section className="card">
          <h2>Server health</h2>
          {healthError && <p className="error">{healthError}</p>}
          {health && (
            <dl className="kv">
              <dt>Status</dt>
              <dd className={health.status === 'ok' ? 'ok' : 'warn'}>{health.status}</dd>
              <dt>Service</dt>
              <dd>{health.service ?? 'ratary'}</dd>
              {health.checks &&
                Object.entries(health.checks).map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
          )}
        </section>

        <section className="card">
          <h2>Capabilities</h2>
          {loading && <p>Loading manifest…</p>}
          {error && <p className="error">{error}</p>}
          {manifest && (
            <dl className="kv">
              <dt>Protocol</dt>
              <dd>{manifest.protocolVersion ?? '—'}</dd>
              <dt>SQL provider</dt>
              <dd>{manifest.deployment?.sqlProvider ?? '—'}</dd>
              <dt>MCP tools</dt>
              <dd>{manifest.mcp?.toolCount ?? '—'}</dd>
            </dl>
          )}
        </section>
      </div>

      {manifest && (
        <section className="card">
          <h2>Enabled features</h2>
          <ul className="flag-list">
            {Object.entries(capabilities)
              .filter(([, v]) => v === true)
              .map(([k]) => (
                <li key={k}>{k}</li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}
