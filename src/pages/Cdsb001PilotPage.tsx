import { FormEvent, useEffect, useState } from 'react';
import { formatRataryApiError } from '../infrastructure/ratary/format-ratary-api-error';
import { useCdsb001Pilot } from '../hooks/useCdsb001Pilot';
import { Button, Card, Input, PageHeader } from '../presentation/design-system/primitives';
import { getDefaultOntoryBaseUrl } from '../config/env';

type ApprovalState = 'pending' | 'approved' | 'rejected';

type BriefResult = Readonly<{
  text: string;
  requestId: string;
  finishReason: string;
  submitTime: string;
  looksStub: boolean;
}>;

type HealthState =
  | { status: 'loading' }
  | { status: 'ok'; service?: string; baseUrl: string }
  | { status: 'error'; message: string; baseUrl: string };

/** PILOT-001 CDSB-001 — weekly client delivery brief (no org-memory recall). */
export function Cdsb001PilotPage() {
  const { ready, executeBrief, checkHealth } = useCdsb001Pilot();
  const [projectId, setProjectId] = useState('');
  const [weekRange, setWeekRange] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BriefResult | null>(null);
  const [approval, setApproval] = useState<ApprovalState>('pending');
  const [health, setHealth] = useState<HealthState>({ status: 'loading' });
  const baseUrl = getDefaultOntoryBaseUrl();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const h = await checkHealth();
        if (!cancelled) {
          setHealth({ status: 'ok', service: h.service, baseUrl });
        }
      } catch (err) {
        if (!cancelled) {
          setHealth({
            status: 'error',
            baseUrl,
            message: err instanceof Error ? err.message : 'health failed',
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [baseUrl, checkHealth]);

  async function onGenerate(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;

    const pid = projectId.trim();
    const week = weekRange.trim();
    const notes = projectNotes.trim();
    if (!pid || !week || !notes) return;

    setLoading(true);
    setError(null);
    setApproval('pending');
    const submitTime = new Date().toISOString();

    try {
      const completion = await executeBrief({
        projectId: pid,
        weekRange: week,
        projectNotes: notes,
      });
      const text = completion.text;
      setResult({
        text,
        requestId: completion.requestId,
        finishReason: completion.finishReason,
        submitTime,
        looksStub: text.trimStart().startsWith('[stub]'),
      });
    } catch (err) {
      setResult(null);
      const message = err instanceof Error ? err.message : 'Request failed';
      if (message.toLowerCase().includes('failed to fetch')) {
        setError(
          `Cannot reach Ontory at ${baseUrl} — check ${baseUrl.replace(/\/$/, '')}/health (or local npm run start:rest on :9787), then retry.`,
        );
      } else {
        setError(formatRataryApiError(err));
      }
    } finally {
      setLoading(false);
    }
  }

  function onApprove() {
    if (!result) return;
    setApproval('approved');
  }

  function onReject() {
    if (!result) return;
    setApproval('rejected');
  }

  return (
    <div className="page">
      <PageHeader
        title="CDSB-001 — Client Delivery Brief"
        description="PILOT-001 workload for Ontorata Tech. Project notes → Ontory REST → operator review. No org-memory recall."
      />

      <Card>
        <p>
          <strong>Ontory host:</strong> {baseUrl}
          {health.status === 'loading' ? ' · checking health…' : null}
          {health.status === 'ok'
            ? ` · health ok${health.service ? ` (${health.service})` : ''}`
            : null}
          {health.status === 'error' ? ` · health failed: ${health.message}` : null}
        </p>
        <p>
          VPS staging may run the <strong>stub</strong> Runtime kernel — responses that start with{' '}
          <code>[stub]</code> are serving-path echoes, not a Frontier model.
        </p>
      </Card>

      <Card>
        <form className="form" onSubmit={onGenerate}>
          <Input
            label="Project ID"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
          />
          <Input
            label="Reporting week"
            value={weekRange}
            onChange={(e) => setWeekRange(e.target.value)}
            placeholder="e.g. 2026-W29"
            required
          />
          <label>
            Project notes
            <textarea
              className="input"
              rows={8}
              value={projectNotes}
              onChange={(e) => setProjectNotes(e.target.value)}
              required
            />
          </label>
          <div className="form-actions">
            <Button type="submit" disabled={!ready || loading || health.status === 'error'}>
              {loading ? 'Generating…' : 'Generate brief'}
            </Button>
          </div>
        </form>
      </Card>

      {error ? (
        <Card>
          <p>{error}</p>
        </Card>
      ) : null}

      {result ? (
        <Card>
          {result.looksStub ? (
            <p>
              <strong>Serving mode:</strong> stub kernel detected — do not treat as model quality
              Accept.
            </p>
          ) : null}
          <p>
            <strong>Request:</strong> {result.requestId} · <strong>Finish:</strong>{' '}
            {result.finishReason}
          </p>
          <pre className="code-block">{result.text}</pre>
          <div className="form-actions">
            <Button type="button" onClick={onApprove} disabled={approval !== 'pending'}>
              Approve
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onReject}
              disabled={approval !== 'pending'}
            >
              Reject
            </Button>
          </div>
          {approval === 'approved' ? (
            <p>
              <strong>Operator attestation:</strong> Approved at {new Date().toISOString()} · submit{' '}
              {result.submitTime}
            </p>
          ) : null}
          {approval === 'rejected' ? (
            <p>
              <strong>Operator attestation:</strong> Rejected — do not use this brief.
            </p>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
