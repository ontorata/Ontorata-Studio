import { RataryConnectionNotice } from '../components/RataryConnectionNotice';
import { useCapabilities } from '../hooks/useCapabilities';
import { useRataryTabClient } from '../hooks/useRataryTabClient';
import { Card, PageHeader } from '../presentation/design-system/primitives';

/** Phase 13 — MCP tool inventory and remote transport status. */
export function McpManagerPage() {
  const { authLoading, missingConnection } = useRataryTabClient();
  const { manifest, loading, error } = useCapabilities();
  const toolNames = manifest?.mcp?.toolNames ?? [];
  const remote = manifest?.transport?.mcp?.remote;

  if (authLoading) {
    return (
      <div className="page">
        <p>Loading session…</p>
      </div>
    );
  }

  if (missingConnection) {
    return <RataryConnectionNotice title="Tool Protocol" />;
  }

  return (
    <div className="page">
      <PageHeader
        title="MCP Manager"
        description="Tools and remote MCP surface on the connected Ratary instance (read-only inventory)."
      />
      <div className="grid two">
        <Card>
          {loading && <p>Loading manifest…</p>}
          {error && (
            <Card className="ratary-connection-notice">
              <p className="error">{error}</p>
            </Card>
          )}
          {manifest && (
            <dl className="kv">
              <dt>Protocol version</dt>
              <dd>{manifest.protocolVersion ?? '—'}</dd>
              <dt>Server version</dt>
              <dd>{manifest.version ?? '—'}</dd>
              <dt>Tool count</dt>
              <dd>{manifest.mcp?.toolCount ?? toolNames.length ?? '—'}</dd>
              <dt>Remote MCP</dt>
              <dd>{remote?.enabled ? 'Enabled' : 'Disabled'}</dd>
              {remote?.publicUrl && (
                <>
                  <dt>Public URL</dt>
                  <dd><code>{remote.publicUrl}</code></dd>
                </>
              )}
              {remote?.oauthEnabled != null && (
                <>
                  <dt>OAuth</dt>
                  <dd>{remote.oauthEnabled ? 'Yes' : 'No'}</dd>
                </>
              )}
            </dl>
          )}
        </Card>
        <Card>
          <h2>Tool registry</h2>
          {toolNames.length === 0 && !loading && (
            <p className="muted">Tool names not included in condensed manifest — count only.</p>
          )}
          <ul className="tool-grid">
            {toolNames.map((name) => (
              <li key={name} className="tag">
                {name}
              </li>
            ))}
          </ul>
          <p className="muted">
            Enable/disable policies are configured on Ratary server — Studio displays inventory only.
          </p>
        </Card>
      </div>
    </div>
  );
}
