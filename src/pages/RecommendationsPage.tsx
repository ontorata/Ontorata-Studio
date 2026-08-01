import { FormEvent, useCallback, useEffect, useState } from 'react';
import { RataryConnectionNotice } from '../components/RataryConnectionNotice';
import {
  listRecommendationIntents,
  saveRecommendationIntent,
  type RecommendationIntentRecord,
} from '../domain/decisions/recommendation-intent';
import { formatRataryApiError } from '../infrastructure/ratary/format-ratary-api-error';
import { useRataryTabClient } from '../hooks/useRataryTabClient';
import { useWorkspaceId } from '../hooks/useWorkspacePath';
import type { RecommendationCardView } from '../domain/decisions/decision-types';
import { Button, Card, EmptyState, Input, PageHeader } from '../presentation/design-system/primitives';

/** Phase 23 — PI-P6-B advisory recommendations (ADR-1042). */
export function RecommendationsPage() {
  const workspaceId = useWorkspaceId();
  const { client, authLoading, missingConnection } = useRataryTabClient();
  const [query, setQuery] = useState('');
  const [traceId, setTraceId] = useState<string | null>(null);
  const [cards, setCards] = useState<RecommendationCardView[]>([]);
  const [history, setHistory] = useState<RecommendationIntentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHistory(listRecommendationIntents(workspaceId));
  }, [workspaceId, cards]);

  const onFetch = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!client || !query.trim()) return;
      setLoading(true);
      setError(null);
      try {
        const result = await client.fetchRecommendations({ query: query.trim(), limit: 5 });
        setTraceId(result.traceId);
        setCards(result.cards);
      } catch (err) {
        setError(formatRataryApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [client, query],
  );

  function onVerdict(card: RecommendationCardView, verdict: 'accepted' | 'rejected') {
    const record: RecommendationIntentRecord = {
      id: `${card.cardId}:${Date.now()}`,
      workspaceId,
      cardId: card.cardId,
      traceId: traceId ?? 'unknown',
      verdict,
      recordedAt: new Date().toISOString(),
      title: card.title,
    };
    saveRecommendationIntent(record);
    setHistory(listRecommendationIntents(workspaceId));
  }

  if (authLoading) {
    return (
      <div className="page">
        <p>Loading session…</p>
      </div>
    );
  }

  if (missingConnection) {
    return <RataryConnectionNotice title="Recommendations" />;
  }

  return (
    <div className="page">
      <PageHeader
        title="Recommendations"
        description="Advisory cards from recall trace — Accept/Reject records intent only (no auto-apply)."
      />

      <Card>
        <form onSubmit={(e) => void onFetch(e)}>
          <Input
            id="recommendation-query"
            label="Question"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What should we recommend about…?"
            required
          />
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Fetching…' : 'Get recommendations'}
          </Button>
        </form>
      </Card>

      {error && <p className="error">{error}</p>}

      {cards.length === 0 && !loading && (
        <EmptyState title="No cards yet" description="Enter a question to fetch advisory recommendations." />
      )}

      <div className="grid two">
        {cards.map((card) => (
          <Card key={card.cardId}>
            <h3>{card.title}</h3>
            <p className="muted">{card.reason}</p>
            <p>
              <strong>Advisory</strong> — evidence: {card.evidenceRefs.join(', ')}
            </p>
            <div className="button-row">
              <Button type="button" variant="primary" onClick={() => onVerdict(card, 'accepted')}>
                Accept intent
              </Button>
              <Button type="button" variant="ghost" onClick={() => onVerdict(card, 'rejected')}>
                Reject
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {history.length > 0 && (
        <Card>
          <h2>Audit history (local)</h2>
          <ul className="list-plain">
            {history.slice(0, 10).map((item) => (
              <li key={item.id}>
                {item.title} · {item.verdict} · {item.recordedAt}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
