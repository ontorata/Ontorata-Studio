import { RataryConnectionNotice } from '../components/RataryConnectionNotice';
import { useCapabilities } from '../hooks/useCapabilities';
import { useRataryTabClient } from '../hooks/useRataryTabClient';
import { Card, PageHeader } from '../presentation/design-system/primitives';

/** Phase 15 — Model and embedding provider policy from Ratary manifest. */
export function ModelProvidersPage() {
  const { authLoading, missingConnection } = useRataryTabClient();
  const { manifest, capabilities, loading, error } = useCapabilities();
  const deployment = manifest?.deployment;

  if (authLoading) {
    return (
      <div className="page">
        <p>Loading session…</p>
      </div>
    );
  }

  if (missingConnection) {
    return <RataryConnectionNotice title="Model Policy" />;
  }

  return (
    <div className="page">
      <PageHeader
        title="Model Providers"
        description="LLM and embedding routing is configured on Ratary server — Studio displays deployment policy."
      />
      <Card>
        {loading && <p>Loading…</p>}
        {error && (
          <Card className="ratary-connection-notice">
            <p className="error">{error}</p>
          </Card>
        )}
        {manifest && (
          <dl className="kv">
            <dt>Embedding</dt>
            <dd>{capabilities.supportsEmbedding ? 'Enabled' : 'Disabled (noop)'}</dd>
            <dt>Embedding provider</dt>
            <dd>{deployment?.embeddingProvider ?? '—'}</dd>
            <dt>Vector provider</dt>
            <dd>{deployment?.vectorProvider ?? '—'}</dd>
            <dt>Hybrid retrieval</dt>
            <dd>{capabilities.supportsHybridRetrieval ? 'Yes' : 'No'}</dd>
            <dt>Semantic search</dt>
            <dd>{capabilities.supportsSemanticSearch ? 'Yes' : 'No'}</dd>
            <dt>Studio role</dt>
            <dd>Operator console — no embedded inference</dd>
          </dl>
        )}
        <p className="muted">
          Configure providers via Ratary environment variables and redeploy. Studio routes operator
          actions through <code>@ratary/sdk</code> only.
        </p>
      </Card>
    </div>
  );
}
