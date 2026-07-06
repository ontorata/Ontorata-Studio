import { useCallback, useEffect, useState } from 'react';
import { useStudioClient } from '../hooks/useStudioClient';
import type { AgentRecord } from '../infrastructure/ratary/studio-ratary-client';
import { useWorkspaceId } from '../hooks/useWorkspacePath';
import { Button, Card, PageHeader } from '../presentation/design-system/primitives';

/** Phase 14 — Agent registry per workspace with refresh. */
export function AgentManagerPage() {
  const client = useStudioClient();
  const workspaceId = useWorkspaceId();
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    client
      .listAgents(workspaceId)
      .then((res) => {
        setAgents(res.agents ?? []);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [client, workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="page">
      <PageHeader
        title="Agents"
        description={`Registered agents in workspace ${workspaceId}.`}
        actions={
          <Button type="button" variant="ghost" onClick={load} disabled={loading}>
            Refresh
          </Button>
        }
      />
      <Card>
        {loading && <p>Loading agents…</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && agents.length === 0 && (
          <p className="muted">No agents registered yet. Agents are created via Ratary API or MCP clients.</p>
        )}
        <ul className="simple-list">
          {agents.map((a) => (
            <li key={a.id}>
              <strong>{a.name}</strong>
              <span className="muted"> — {a.id}</span>
              {a.clientType && <span className="tag">{a.clientType}</span>}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
