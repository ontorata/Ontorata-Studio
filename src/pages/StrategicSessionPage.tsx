import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RataryConnectionNotice } from '../components/RataryConnectionNotice';
import type { DecisionModelSummary } from '../domain/decisions/decision-model-types';
import {
  createStrategicSessionArtifactId,
  listStrategicSessionArtifacts,
  saveStrategicSessionArtifact,
  type StrategicSessionArtifact,
} from '../domain/decisions/strategic-session-artifact';
import { formatRataryApiError } from '../infrastructure/ratary/format-ratary-api-error';
import { useRataryTabClient } from '../hooks/useRataryTabClient';
import { useOptionalStudioClient } from '../hooks/useStudioClient';
import { useWorkspaceAiPipeline } from '../hooks/useWorkspaceAiPipeline';
import { useWorkspaceRecallOrchestrator } from '../hooks/useWorkspaceRecallOrchestrator';
import { useWorkspaceId } from '../hooks/useWorkspacePath';
import { DecisionModelPicker } from '../presentation/decisions/DecisionModelPicker';
import { Button, Card, Input, PageHeader } from '../presentation/design-system/primitives';

type SessionStep = Readonly<{
  index: number;
  text: string;
  status: 'ok' | 'error';
}>;

/** Phase 24 — PI-P6-C strategic session + PI-P6-D0 decision model picker. */
export function StrategicSessionPage() {
  const workspaceId = useWorkspaceId();
  const client = useOptionalStudioClient();
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

  const [models, setModels] = useState<DecisionModelSummary[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<DecisionModelSummary | null>(null);
  const [lastArtifact, setLastArtifact] = useState<StrategicSessionArtifact | null>(() => {
    const items = listStrategicSessionArtifacts(workspaceId);
    return items[0] ?? null;
  });

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    setModelsLoading(true);
    void client
      .listDecisionModels()
      .then((response) => {
        if (!cancelled) setModels([...response.models]);
      })
      .catch(() => {
        if (!cancelled) setModels([]);
      })
      .finally(() => {
        if (!cancelled) setModelsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  async function onStart(event: FormEvent) {
    event.preventDefault();
    const g = goal.trim();
    if (!g || !recallReady) return;

    setLoading(true);
    setError(null);
    setSteps([]);
    setOutcome(null);

    const modelSelection = selectedModel
      ? {
          id: selectedModel.id,
          version: selectedModel.version,
          displayName: selectedModel.displayName,
          executionProfileName: selectedModel.executionProfileName,
        }
      : undefined;

    try {
      const { contextPackage } = await attachContextPackage(g, 2048);
      setPackageId(contextPackage.packageId);

      const localSteps: SessionStep[] = [];
      for (let i = 0; i < Math.min(maxSteps, 5); i += 1) {
        if (!aiReady) break;
        const prompt = `Strategic step ${i + 1}/${maxSteps} for goal: ${g}`;
        try {
          const result = await runAiInteraction(prompt, 1024, {
            executionProfileName: modelSelection?.executionProfileName,
            decisionModelId: modelSelection?.id,
            decisionModelVersion: modelSelection?.version,
          });
          localSteps.push({ index: i + 1, text: result.completion.text.slice(0, 280), status: 'ok' });
        } catch {
          localSteps.push({ index: i + 1, text: 'Turn failed', status: 'error' });
          const failOutcome = 'fail — tool/runtime error';
          setOutcome(failOutcome);
          setSteps(localSteps);
          persistArtifact(g, contextPackage.packageId, failOutcome, modelSelection, localSteps);
          return;
        }
      }

      const finalOutcome =
        localSteps.length >= maxSteps ? 'success — step budget reached' : 'abort — AI unavailable';
      setSteps(localSteps);
      setOutcome(finalOutcome);
      persistArtifact(g, contextPackage.packageId, finalOutcome, modelSelection, localSteps);
    } catch (err) {
      setError(formatRataryApiError(err));
    } finally {
      setLoading(false);
    }
  }

  function persistArtifact(
    sessionGoal: string,
    sessionPackageId: string,
    sessionOutcome: string,
    decisionModel: StrategicSessionArtifact['decisionModel'],
    sessionSteps: SessionStep[],
  ) {
    const artifact: StrategicSessionArtifact = {
      id: createStrategicSessionArtifactId(),
      workspaceId,
      goal: sessionGoal,
      packageId: sessionPackageId,
      outcome: sessionOutcome,
      decisionModel,
      steps: sessionSteps,
      recordedAt: new Date().toISOString(),
    };
    saveStrategicSessionArtifact(artifact);
    setLastArtifact(artifact);
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
        description="Bounded multi-step reasoning over Context Package evidence (ADR-1043). Optional declarative decision model (PI-P6-D0)."
      />

      <Card>
        <form onSubmit={(e) => void onStart(e)}>
          <DecisionModelPicker
            models={models}
            selectedId={selectedModel?.id ?? null}
            onSelect={setSelectedModel}
            loading={modelsLoading}
          />
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

      {selectedModel && (
        <p className="muted">
          Decision model: <code>{selectedModel.id}@{selectedModel.version}</code> · profile{' '}
          <code>{selectedModel.executionProfileName}</code> · {selectedModel.stability}
        </p>
      )}

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
          {selectedModel && (
            <p className="muted">
              Attributed model: {selectedModel.displayName} ({selectedModel.id}@
              {selectedModel.version})
            </p>
          )}
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

      {lastArtifact && (
        <Card>
          <h2>Last session audit (local)</h2>
          <p className="muted">Recorded {lastArtifact.recordedAt}</p>
          <p>
            Goal: {lastArtifact.goal} · Outcome: {lastArtifact.outcome}
          </p>
          {lastArtifact.decisionModel && (
            <p className="muted">
              Model: {lastArtifact.decisionModel.displayName} ({lastArtifact.decisionModel.id}@
              {lastArtifact.decisionModel.version})
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
