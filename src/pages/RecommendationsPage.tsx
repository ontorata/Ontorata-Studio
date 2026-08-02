import { FormEvent, useCallback, useEffect, useState } from 'react';
import { RataryConnectionNotice } from '../components/RataryConnectionNotice';
import {
  listRecommendationIntents,
  saveRecommendationIntent,
  type RecommendationIntentRecord,
} from '../domain/decisions/recommendation-intent';
import type { DecisionModelSummary } from '../domain/decisions/decision-model-types';
import type { RecommendationCardView, RecommendationRerankView } from '../domain/decisions/decision-types';
import { formatRataryApiError } from '../infrastructure/ratary/format-ratary-api-error';
import { useRataryTabClient } from '../hooks/useRataryTabClient';
import { useWorkspaceId } from '../hooks/useWorkspacePath';
import { DecisionModelPicker, decisionModelRefKey } from '../presentation/decisions/DecisionModelPicker';
import { DecisionModelAttribution } from '../presentation/decisions/DecisionModelAttribution';
import { Button, Card, EmptyState, Input, PageHeader } from '../presentation/design-system/primitives';

/** Phase 23 — PI-P6-B advisory recommendations · PI-P6-D1.1 computed re-rank. */
export function RecommendationsPage() {
  const workspaceId = useWorkspaceId();
  const { client, authLoading, missingConnection } = useRataryTabClient();
  const [query, setQuery] = useState('');
  const [traceId, setTraceId] = useState<string | null>(null);
  const [cards, setCards] = useState<RecommendationCardView[]>([]);
  const [rerank, setRerank] = useState<RecommendationRerankView | null>(null);
  const [history, setHistory] = useState<RecommendationIntentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [models, setModels] = useState<DecisionModelSummary[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<DecisionModelSummary | null>(null);

  useEffect(() => {
    setHistory(listRecommendationIntents(workspaceId));
  }, [workspaceId, cards]);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    setModelsLoading(true);
    void client
      .listDecisionModels()
      .then((response) => {
        if (!cancelled) setModels(response.models);
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

  const onFetch = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!client || !query.trim()) return;
      setLoading(true);
      setError(null);
      try {
        const result = await client.fetchRecommendations({
          query: query.trim(),
          limit: 5,
          decisionModelId: selectedModel?.id,
          decisionModelVersion: selectedModel?.version,
        });
        setTraceId(result.traceId);
        setCards(result.cards);
        setRerank(result.rerank ?? null);
      } catch (err) {
        setError(formatRataryApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [client, query, selectedModel],
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
        description="Advisory cards from recall trace — optional computed model re-rank (PI-P6-D1.1). Accept/Reject records intent only."
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
          <DecisionModelPicker
            models={models}
            selectedRef={selectedModel ? decisionModelRefKey(selectedModel) : null}
            onSelect={setSelectedModel}
            loading={modelsLoading}
          />
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Fetching…' : 'Get recommendations'}
          </Button>
        </form>
      </Card>

      {selectedModel && (
        <Card>
          <DecisionModelAttribution
            model={selectedModel}
            sandboxOutcome={rerank?.sandboxOutcome}
            pluginDigestPrefix={rerank?.pluginDigestPrefix}
          />
        </Card>
      )}

      {rerank && (
        <Card>
          <p className="muted">
            Re-rank: {rerank.applied ? 'applied' : 'not applied'}
            {rerank.decisionModelId && (
              <>
                {' '}
                · model {rerank.decisionModelId}@{rerank.decisionModelVersion ?? '?'}
              </>
            )}
            {rerank.sandboxOutcome && <> · sandbox {rerank.sandboxOutcome}</>}
            {rerank.pluginDigestPrefix && <> · digest {rerank.pluginDigestPrefix}</>}
            {rerank.reason && <> · {rerank.reason}</>}
          </p>
        </Card>
      )}

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
              <strong>Advisory</strong>
              {card.computedScore !== undefined && (
                <>
                  {' '}
                  · computed score {card.computedScore.toFixed(3)}
                </>
              )}{' '}
              — evidence: {card.evidenceRefs.join(', ')}
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
