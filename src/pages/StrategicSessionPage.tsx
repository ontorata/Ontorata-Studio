import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { RataryConnectionNotice } from '../components/RataryConnectionNotice';
import { formatRataryApiError } from '../infrastructure/ratary/format-ratary-api-error';
import { useRataryTabClient } from '../hooks/useRataryTabClient';
import { useWorkspaceAiPipeline } from '../hooks/useWorkspaceAiPipeline';
import { useWorkspaceRecallOrchestrator } from '../hooks/useWorkspaceRecallOrchestrator';
import { useWorkspaceId } from '../hooks/useWorkspacePath';
import { Button, Card, Input, PageHeader } from '../presentation/design-system/primitives';

type SessionStep = Readonly<{
  index: number;
  text: string;
  status: 'ok' | 'error';
}>;

/** Phase 24 — PI-P6-C strategic session (bounded multi-turn, link-only telemetry). */
export function StrategicSessionPage() {
  const workspaceId = useWorkspaceId();
  const { authLoading, missingConnection } = useRataryTabClient();
  const { ready: recallReady, attachContextPackage } = useWorkspaceRecallOrchestrator();
  const { ready: aiReady, runAiInteraction } = useWorkspaceAiPipeline();

  const [goal, setGoal] = useState('');
  const [maxSteps, setMaxSteps] = useState(3);
  const [packageId, setPackageId] = useState<string | null>(null);
  const [steps, setSteps] = useState<SessionStep[]>([]);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onStart(event: FormEvent) {
    event.preventDefault();
    const g = goal.trim();
    if (!g || !recallReady) return;

    setLoading(true);
    setError(null);
    setSteps([]);
    setOutcome(null);

    try {
      const { contextPackage } = await attachContextPackage(g, 2048);
      setPackageId(contextPackage.packageId);

      const localSteps: SessionStep[] = [];
      for (let i = 0; i < Math.min(maxSteps, 5); i += 1) {
        if (!aiReady) break;
        const prompt = `Strategic step ${i + 1}/${maxSteps} for goal: ${g}`;
        try {
          const result = await runAiInteraction(prompt, 1024);
          localSteps.push({ index: i + 1, text: result.completion.text.slice(0, 280), status: 'ok' });
        } catch {
          localSteps.push({ index: i + 1, text: 'Turn failed', status: 'error' });
          setOutcome('fail — tool/runtime error');
          setSteps(localSteps);
          return;
        }
      }

      setSteps(localSteps);
      setOutcome(localSteps.length >= maxSteps ? 'success — step budget reached' : 'abort — AI unavailable');
    } catch (err) {
      setError(formatRataryApiError(err));
    } finally {
      setLoading(false);
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
    return <RataryConnectionNotice title="Strategic session" />;
  }

  return (
    <div className="page">
      <PageHeader
        title="Strategic session"
        description="Bounded multi-step reasoning over Context Package evidence (ADR-1043). Telemetry: link-only."
      />

      <Card>
        <form onSubmit={(e) => void onStart(e)}>
          <Input
            id="strategic-goal"
            label="Session goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
          />
          <label>
            Max steps (≤5)
            <input
              type="number"
              min={1}
              max={5}
              value={maxSteps}
              onChange={(e) => setMaxSteps(Number.parseInt(e.target.value, 10) || 1)}
            />
          </label>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Running…' : 'Start session'}
          </Button>
        </form>
      </Card>

      {error && <p className="error">{error}</p>}

      {packageId && (
        <p className="muted">
          Context package: <code>{packageId}</code> · workspace {workspaceId} ·{' '}
          <Link to="../observability">System Health</Link> (1036 link-only)
        </p>
      )}

      {outcome && (
        <Card>
          <h2>Outcome (ADR-1039)</h2>
          <p>{outcome}</p>
        </Card>
      )}

      {steps.length > 0 && (
        <Card>
          <h2>Step timeline</h2>
          <ul className="list-plain">
            {steps.map((step) => (
              <li key={step.index}>
                Step {step.index} · {step.status} — {step.text}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
