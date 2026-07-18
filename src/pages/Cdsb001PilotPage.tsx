import { FormEvent, useState } from 'react';
import { formatRataryApiError } from '../infrastructure/ratary/format-ratary-api-error';
import { useCdsb001Pilot } from '../hooks/useCdsb001Pilot';
import { Button, Card, Input, PageHeader } from '../presentation/design-system/primitives';

type ApprovalState = 'pending' | 'approved' | 'rejected';

type BriefResult = Readonly<{
  text: string;
  requestId: string;
  provider: string;
  submitTime: string;
}>;

/** PILOT-001 CDSB-001 — weekly client delivery brief (no org-memory recall). */
export function Cdsb001PilotPage() {
  const { ready, executeBrief } = useCdsb001Pilot();
  const [projectId, setProjectId] = useState('');
  const [weekRange, setWeekRange] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BriefResult | null>(null);
  const [approval, setApproval] = useState<ApprovalState>('pending');

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
      setResult({
        text: completion.text,
        requestId: completion.requestId ?? 'n/a',
        provider: completion.provider,
        submitTime,
      });
    } catch (err) {
      setResult(null);
      const message = err instanceof Error ? err.message : 'Request failed';
      if (message.toLowerCase().includes('failed to fetch')) {
        setError(
          'Cannot reach Ontory — start REST with `npm run start:rest` in the Ontory repo (port 9787), then retry.',
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
            <Button type="submit" disabled={!ready || loading}>
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
          <p>
            <strong>Request:</strong> {result.requestId} · <strong>Provider:</strong>{' '}
            {result.provider}
          </p>
          <pre className="code-block">{result.text}</pre>
          <div className="form-actions">
            <Button type="button" onClick={onApprove} disabled={approval !== 'pending'}>
              Approve
            </Button>
            <Button type="button" variant="secondary" onClick={onReject} disabled={approval !== 'pending'}>
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
