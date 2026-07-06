import { useCapabilities } from '../hooks/useCapabilities';
import { Card, PageHeader } from '../presentation/design-system/primitives';

/** Phase 15 — Model and embedding provider policy from Ratary manifest. */
export function ModelProvidersPage() {
  const { manifest, capabilities, loading, error } = useCapabilities();
  const deployment = manifest?.deployment;

  return (
    <div className="page">
      <PageHeader
        title="Model Providers"
        description="LLM and embedding routing is configured on Ratary server — Studio displays deployment policy."
      />
      <Card>
        {loading && <p>Loading…</p>}
        {error && <p className="error">{error}</p>}
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
