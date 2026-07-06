import { useEffect, useState } from 'react';
import { useStudioClient } from '../hooks/useStudioClient';
import type { AgentRecord } from '../infrastructure/ratary/studio-ratary-client';
import { useWorkspaceId } from '../hooks/useWorkspacePath';
import { Card, PageHeader } from '../presentation/design-system/primitives';

/** Phase 14 — Agent registry per workspace. */
export function AgentManagerPage() {
  const client = useStudioClient();
  const workspaceId = useWorkspaceId();
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .listAgents(workspaceId)
      .then((res) => setAgents(res.agents ?? []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [client, workspaceId]);

  return (
    <div className="page">
      <PageHeader title="Agents" description={`Registered agents in workspace ${workspaceId}.`} />
      <Card>
        {loading && <p>Loading agents…</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && agents.length === 0 && <p>No agents registered yet.</p>}
        <ul className="simple-list">
          {agents.map((a) => (
            <li key={a.id}>
              <strong>{a.name}</strong>
              {a.clientType && <span className="muted"> — {a.clientType}</span>}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
