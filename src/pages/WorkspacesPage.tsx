import { useEffect, useState } from 'react';
import type { AgentRecord, WorkspaceRecord } from '../api/ratary-client';
import { useStudioClient } from '../hooks/useStudioClient';
import { Card, EmptyState, PageHeader } from '../presentation/design-system/primitives';

export function WorkspacesPage() {
  const client = useStudioClient();
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    client
      .listWorkspaces()
      .then((res) => setWorkspaces(res.workspaces ?? []))
      .catch((err: Error) => setError(err.message));
  }, [client]);

  useEffect(() => {
    if (!selected) {
      setAgents([]);
      return;
    }
    client
      .listAgents(selected)
      .then((res) => setAgents(res.agents ?? []))
      .catch((err: Error) => setError(err.message));
  }, [client, selected]);

  return (
    <div className="page studio-page">
      <PageHeader
        title="Workspaces"
        description="Admin view when enterprise workspace flags are enabled on Ratary Server."
      />

      {error && <p className="error">{error}</p>}

      <div className="grid two">
        <Card>
          <h2>Workspaces</h2>
          {workspaces.length === 0 ? (
            <EmptyState title="No workspaces" description="No workspaces returned from Ratary." />
          ) : (
            <ul className="memory-list">
              {workspaces.map((w) => (
                <li key={w.id}>
                  <button
                    type="button"
                    className={selected === w.id ? 'linkish active' : 'linkish'}
                    onClick={() => setSelected(w.id)}
                  >
                    {w.name}
                  </button>
                  {w.slug && <span className="tag">{w.slug}</span>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2>Agents</h2>
          {!selected && <p className="muted">Select a workspace to list agents.</p>}
          {selected && agents.length === 0 && (
            <p className="muted">No agents in this workspace.</p>
          )}
          <ul className="memory-list">
            {agents.map((a) => (
              <li key={a.id}>
                <strong>{a.name}</strong>
                {a.clientType && <span className="tag">{a.clientType}</span>}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
