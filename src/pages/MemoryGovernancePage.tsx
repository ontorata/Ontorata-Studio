import { useCallback, useEffect, useState } from 'react';
import { RataryConnectionNotice } from '../components/RataryConnectionNotice';
import { formatRataryApiError } from '../infrastructure/ratary/format-ratary-api-error';
import { useRataryTabClient } from '../hooks/useRataryTabClient';
import type {
  MemoryGovernanceManifest,
  StewardshipRunReportView,
} from '../domain/governance/governance-types';
import { Button, Card, EmptyState, PageHeader } from '../presentation/design-system/primitives';

type TabId = 'overview' | 'runs' | 'policy' | 'retention';

/** Phase 21 — PI-1027-A Memory Governance Dashboard (read-only). */
export function MemoryGovernancePage() {
  const { client, authLoading, missingConnection } = useRataryTabClient();
  const [tab, setTab] = useState<TabId>('overview');
  const [manifest, setManifest] = useState<MemoryGovernanceManifest | null>(null);
  const [runs, setRuns] = useState<StewardshipRunReportView[]>([]);
  const [selectedRun, setSelectedRun] = useState<StewardshipRunReportView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    setError(null);
    try {
      const [manifestRes, runsRes] = await Promise.all([
        client.getGovernanceManifest(),
        client.listStewardshipRuns(25),
      ]);
      setManifest(manifestRes);
      setRuns(runsRes.runs);
      setSelectedRun(null);
    } catch (err) {
      setError(formatRataryApiError(err));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSelectRun(runId: string) {
    if (!client) return;
    try {
      const detail = await client.getStewardshipRun(runId);
      setSelectedRun(detail.run);
    } catch (err) {
      setError(formatRataryApiError(err));
    }
  }

  if (authLoading) {
    return (
      <div className="page">
        <p>Loading session…</p>
      </div>
    );
  }

  if (missingConnection) {
    return <RataryConnectionNotice title="Memory Governance" />;
  }

  return (
    <div className="page">
      <PageHeader
        title="Memory Governance"
        description="Read-only Shape G registry, stewardship history, and policy map (ADR-1027)."
        actions={
          <Button type="button" variant="ghost" onClick={() => void load()}>
            Refresh
          </Button>
        }
      />

      {error && <p className="error">{error}</p>}

      <nav className="button-row" aria-label="Governance sections">
        {(
          [
            ['overview', 'Overview'],
            ['runs', 'Stewardship runs'],
            ['policy', 'Policy map'],
            ['retention', 'Retention / decay'],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            type="button"
            variant={tab === id ? 'primary' : 'ghost'}
            onClick={() => setTab(id)}
          >
            {label}
          </Button>
        ))}
      </nav>

      {loading && <p>Loading governance data…</p>}

      {!loading && tab === 'overview' && manifest && (
        <div className="grid two">
          <Card>
            <h2>Shape G model</h2>
            <dl className="kv">
              <dt>Model</dt>
              <dd>{manifest.model}</dd>
              <dt>Shape</dt>
              <dd>{manifest.shape}</dd>
              <dt>Owner</dt>
              <dd>{manifest.owner}</dd>
              <dt>Update mechanism</dt>
              <dd>{manifest.updateMechanism}</dd>
            </dl>
            <p className="muted">
              Policy changes ship via git → CI → deploy → flag (ADR-1026). This dashboard does not
              edit policy.
            </p>
          </Card>
          <Card>
            <h2>Evaluation points</h2>
            <ul>
              <li>
                <strong>write</strong> — hard tenancy + validation
              </li>
              <li>
                <strong>recall</strong> — soft ranking / Context Package inputs
              </li>
              <li>
                <strong>stewardship</strong> — maintenance pipeline (dry-run default)
              </li>
            </ul>
            <p className="muted">
              Run stewardship via MCP <code>run_stewardship</code> (dry-run by default).
            </p>
          </Card>
        </div>
      )}

      {!loading && tab === 'runs' && (
        <div className="grid two">
          <Card>
            <h2>Recent runs</h2>
            {runs.length === 0 ? (
              <EmptyState
                title="No stewardship runs yet"
                description="Execute run_stewardship (dry-run) via Ratary MCP, then refresh."
              />
            ) : (
              <ul className="list-plain">
                {runs.map((run) => (
                  <li key={run.runId}>
                    <button type="button" className="link-button" onClick={() => void onSelectRun(run.runId)}>
                      {run.runId}
                    </button>
                    {' · '}
                    {run.dryRun ? 'dry-run' : 'execute'} · {run.durationMs}ms
                    {run.hadErrors ? ' · errors' : ''}
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card>
            <h2>Run detail</h2>
            {!selectedRun && <p className="muted">Select a run to inspect task results.</p>}
            {selectedRun && (
              <>
                <dl className="kv">
                  <dt>Run ID</dt>
                  <dd>{selectedRun.runId}</dd>
                  <dt>Started</dt>
                  <dd>{selectedRun.startedAt}</dd>
                  <dt>Scanned / changed</dt>
                  <dd>
                    {selectedRun.totalScanned} / {selectedRun.totalChanged}
                  </dd>
                </dl>
                {selectedRun.tasks.length > 0 && (
                  <ul className="list-plain">
                    {selectedRun.tasks.map((task) => (
                      <li key={`${task.taskId}-${task.stage}`}>
                        {task.taskId} ({task.stage}) — {task.status} — scanned {task.scanned},
                        changed {task.changed}
                        {task.error ? ` · ${task.error}` : ''}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </Card>
        </div>
      )}

      {!loading && tab === 'policy' && manifest && (
          <Card>
            <h2>Policy modules (mirror)</h2>
            <ul>
              {manifest.modules.map((module) => (
                <li key={module.id}>
                  <strong>{module.id}</strong> · {module.point} · {module.enforcement} ·{' '}
                  <code>{module.modulePath}</code>
                  <br />
                  <span className="muted">{module.notes}</span>
                </li>
              ))}
            </ul>
          </Card>
      )}

      {!loading && tab === 'retention' && (
        <Card>
          <h2>Retention / decay visibility</h2>
          <p>
            Decay scoring and archive candidates run under ADR-066 stewardship stages. Governance
            exceptions (ADR-1029) protect favorites, high-importance, and governance-tagged memories.
          </p>
          <p className="muted">
            Inspect decay-related task outcomes in stewardship runs (e.g. decay-scoring). Policy is
            not editable from Studio.
          </p>
          {runs[0] && (
            <p>
              Latest run: <strong>{runs[0].runId}</strong> — scanned {runs[0].totalScanned}, changed{' '}
              {runs[0].totalChanged}.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
