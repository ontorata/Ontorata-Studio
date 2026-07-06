import { useCapabilities } from '../hooks/useCapabilities';
import { Card, PageHeader } from '../presentation/design-system/primitives';

/** Phase 12 — Knowledge layer and fabric connector status. */
export function KnowledgePage() {
  const { manifest, capabilities, loading, error } = useCapabilities();

  const fabric = manifest?.knowledgeFabric;
  const precision = manifest?.precisionSearch;

  return (
    <div className="page">
      <PageHeader
        title="Knowledge"
        description="Retrieval, precision search, and knowledge fabric connectors from your Ratary instance."
      />
      <div className="grid two">
        <Card>
          <h2>Retrieval</h2>
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
              <dt>Vector provider</dt>
              <dd>{manifest.deployment?.vectorProvider ?? '—'}</dd>
              {precision?.defaultMode && (
                <>
                  <dt>Default search mode</dt>
                  <dd>{precision.defaultMode}</dd>
                </>
              )}
            </dl>
          )}
        </Card>
        <Card>
          <h2>Knowledge fabric</h2>
          {!fabric?.enabled && <p className="muted">Knowledge fabric is disabled on this Ratary instance.</p>}
          {fabric?.enabled && (
            <>
              <p>Connectors configured on server:</p>
              <ul className="simple-list">
                {(fabric.connectors ?? []).map((c) => (
                  <li key={c.id}>
                    <strong>{c.id}</strong>{' '}
                    <span className={c.configured ? 'ok-text' : 'muted'}>
                      {c.configured ? 'configured' : 'not configured'}
                    </span>
                  </li>
                ))}
                {!fabric.connectors?.length && <li className="muted">No connectors exposed in manifest.</li>}
              </ul>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
