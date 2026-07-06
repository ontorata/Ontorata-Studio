import { useCapabilities } from '../hooks/useCapabilities';
import { Card, PageHeader } from '../presentation/design-system/primitives';

/** Phase 13 — MCP tool inventory from Ratary manifest. */
export function McpManagerPage() {
  const { manifest, loading, error } = useCapabilities();

  return (
    <div className="page">
      <PageHeader
        title="MCP Manager"
        description="Tools available on the connected Ratary MCP surface."
      />
      <Card>
        {loading && <p>Loading manifest…</p>}
        {error && <p className="error">{error}</p>}
        {manifest && (
          <dl className="kv">
            <dt>Protocol version</dt>
            <dd>{manifest.protocolVersion ?? '—'}</dd>
            <dt>Tool count</dt>
            <dd>{manifest.mcp?.toolCount ?? '—'}</dd>
          </dl>
        )}
        <p className="muted">
          Full MCP enable/disable UI ships with Ratary server policy — Studio shows read-only inventory.
        </p>
      </Card>
    </div>
  );
}
