import { useCapabilities } from '../hooks/useCapabilities';
import { Card, PageHeader } from '../presentation/design-system/primitives';

/** Phase 12 — Knowledge layer status from Ratary capabilities. */
export function KnowledgePage() {
  const { manifest, capabilities, loading, error } = useCapabilities();

  return (
    <div className="page">
      <PageHeader
        title="Knowledge"
        description="Retrieval and knowledge graph features exposed by your connected Ratary instance."
      />
      <Card>
        {loading && <p>Loading…</p>}
        {error && <p className="error">{error}</p>}
        {manifest && (
          <dl className="kv">
            <dt>Hybrid retrieval</dt>
            <dd>{capabilities.supportsHybridRetrieval ? 'Yes' : 'No'}</dd>
            <dt>Precision search</dt>
            <dd>{capabilities.supportsPrecisionSearch ? 'Yes' : 'No'}</dd>
            <dt>Knowledge graph</dt>
            <dd>{capabilities.supportsKnowledgeGraph ? 'Yes' : 'No'}</dd>
            <dt>SQL provider</dt>
            <dd>{manifest.deployment?.sqlProvider ?? '—'}</dd>
          </dl>
        )}
      </Card>
    </div>
  );
}
