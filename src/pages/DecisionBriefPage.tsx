import { FormEvent, useEffect, useState } from 'react';
import { RataryConnectionNotice } from '../components/RataryConnectionNotice';
import {
  createDecisionBriefId,
  listDecisionBriefArtifacts,
  saveDecisionBriefArtifact,
  type DecisionBriefArtifact,
  type DecisionBriefVerdict,
} from '../domain/decisions/decision-brief-artifact';
import {
  listContextSourceIds,
  listContextSourceLabels,
  presentContextPackageText,
} from '../domain/recall/present-context-package';
import { formatRataryApiError } from '../infrastructure/ratary/format-ratary-api-error';
import { useRataryTabClient } from '../hooks/useRataryTabClient';
import { useWorkspaceAiPipeline } from '../hooks/useWorkspaceAiPipeline';
import { useWorkspaceRecallOrchestrator } from '../hooks/useWorkspaceRecallOrchestrator';
import { useWorkspaceId } from '../hooks/useWorkspacePath';
import { Button, Card, Input, PageHeader } from '../presentation/design-system/primitives';

/** Phase 22 — PI-P6-A Decision Brief (human Accept / Reject). */
export function DecisionBriefPage() {
  const workspaceId = useWorkspaceId();
  const { client, authLoading, missingConnection } = useRataryTabClient();
  const { ready: recallReady, attachContextPackage } = useWorkspaceRecallOrchestrator();
  const { ready: aiReady, runAiInteraction } = useWorkspaceAiPipeline();

  const [question, setQuestion] = useState('');
  const [includeReasoning, setIncludeReasoning] = useState(false);
  const [rationale, setRationale] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [artifact, setArtifact] = useState<DecisionBriefArtifact | null>(null);
  const [history, setHistory] = useState<DecisionBriefArtifact[]>([]);

  useEffect(() => {
    setHistory(listDecisionBriefArtifacts(workspaceId));
  }, [workspaceId, artifact]);

  async function onBuildEvidence(event: FormEvent) {
    event.preventDefault();
    const q = question.trim();
    if (!q || !recallReady) return;

    setLoading(true);
    setError(null);
    setArtifact(null);

    try {
      const { contextPackage } = await attachContextPackage(q, 2048);
      let reasoningText: string | undefined;

      if (includeReasoning && aiReady) {
        const aiResult = await runAiInteraction(q, 2048);
        reasoningText = aiResult.completion.text;
      }

      const draft: DecisionBriefArtifact = {
        id: createDecisionBriefId(),
        workspaceId,
        question: q,
        packageId: contextPackage.packageId,
        memoryCount: contextPackage.memoryCount,
        sourceIds: listContextSourceIds(contextPackage),
        sourceLabels: listContextSourceLabels(contextPackage),
        contextPreview: presentContextPackageText(contextPackage),
        reasoningText,
        verdict: 'pending',
        createdAt: new Date().toISOString(),
      };
      setArtifact(draft);
      saveDecisionBriefArtifact(draft);
    } catch (err) {
      setError(formatRataryApiError(err));
    } finally {
      setLoading(false);
    }
  }

  async function finalize(verdict: DecisionBriefVerdict) {
    if (!artifact || verdict === 'pending') return;
    const decided: DecisionBriefArtifact = {
      ...artifact,
      verdict,
      rationale: rationale.trim() || undefined,
      decidedAt: new Date().toISOString(),
    };
    setArtifact(decided);
    saveDecisionBriefArtifact(decided);

    if (client && (verdict === 'accepted' || verdict === 'rejected')) {
      try {
        await client.recordDecisionProvenance({
          briefId: decided.id,
          packageId: decided.packageId,
          verdict: verdict === 'accepted' ? 'accepted' : 'rejected',
          rationale: decided.rationale,
          sourceMemoryIds: decided.sourceIds,
        });
      } catch {
        // Flag-gated / optional — local artifact remains SoR fallback
      }
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
    return <RataryConnectionNotice title="Decision Brief" />;
  }

  return (
    <div className="page">
      <PageHeader
        title="Decision Brief"
        description="Org evidence via Context Package → optional Ontory turn → human Accept or Reject (ADR-1044)."
      />

      <Card>
        <form onSubmit={(event) => void onBuildEvidence(event)}>
          <Input
            id="decision-question"
            label="Decision question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What should we decide about…?"
            required
          />
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={includeReasoning}
              onChange={(event) => setIncludeReasoning(event.target.checked)}
            />
            Include optional Ontory reasoning turn
          </label>
          <Button type="submit" disabled={loading || !recallReady}>
            {loading ? 'Building evidence…' : 'Build evidence'}
          </Button>
        </form>
        {error && <p className="error">{error}</p>}
      </Card>

      {artifact && (
        <div className="grid two">
          <Card>
            <h2>Evidence</h2>
            <p>
              Package <code>{artifact.packageId ?? 'n/a'}</code> · {artifact.memoryCount} memories
            </p>
            {artifact.sourceLabels.length > 0 && (
              <>
                <h3>Sources</h3>
                <ul>
                  {artifact.sourceLabels.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
              </>
            )}
            <pre className="code-block">{artifact.contextPreview}</pre>
          </Card>
          <Card>
            <h2>Decision record</h2>
            {artifact.reasoningText && (
              <>
                <h3>Optional reasoning</h3>
                <pre className="code-block">{artifact.reasoningText}</pre>
              </>
            )}
            <Input
              id="decision-rationale"
              label="Rationale (optional)"
              value={rationale}
              onChange={(event) => setRationale(event.target.value)}
              placeholder="Why accept or reject?"
            />
            <div className="button-row">
              <Button
                type="button"
                variant="primary"
                disabled={artifact.verdict !== 'pending'}
                onClick={() => void finalize('accepted')}
              >
                Accept
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={artifact.verdict !== 'pending'}
                onClick={() => void finalize('rejected')}
              >
                Reject
              </Button>
            </div>
            {artifact.verdict !== 'pending' && (
              <p className="ok-text">
                Recorded: <strong>{artifact.verdict}</strong>
                {artifact.decidedAt ? ` at ${artifact.decidedAt}` : ''}
              </p>
            )}
            <p className="muted">
              Stored locally in this browser (PI-P6-A). Provenance write to Ratary (ADR-069) is
              deferred.
            </p>
          </Card>
        </div>
      )}

      {history.length > 0 && (
        <Card>
          <h2>Recent briefs (this workspace)</h2>
          <ul className="list-plain">
            {history.slice(0, 8).map((item) => (
              <li key={item.id}>
                {item.question} — <em>{item.verdict}</em> ({item.createdAt.slice(0, 10)})
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
