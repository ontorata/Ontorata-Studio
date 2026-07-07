import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { GraphTraverseResult } from '../infrastructure/ratary/studio-ratary-client';
import { RataryConnectionNotice } from '../components/RataryConnectionNotice';
import { formatRataryApiError } from '../infrastructure/ratary/format-ratary-api-error';
import { useRataryTabClient } from '../hooks/useRataryTabClient';
import { useWorkspaceBasePath } from '../hooks/useWorkspacePath';
import { Button, Card, EmptyState, Input, PageHeader } from '../presentation/design-system/primitives';

function GraphViz({ result }: { result: GraphTraverseResult }) {
  const nodes = result.nodes ?? [];
  const edges = result.edges ?? [];
  if (!nodes.length) return null;

  const width = 560;
  const height = 320;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.35;

  const positions = new Map<string, { x: number; y: number }>();
  nodes.forEach((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    positions.set(n.id, {
      x: cx + Math.cos(angle) * radius * (0.5 + (n.depth ?? 0) * 0.15),
      y: cy + Math.sin(angle) * radius * (0.5 + (n.depth ?? 0) * 0.15),
    });
  });

  return (
    <div className="graph-viz-wrap">
      <svg className="graph-viz" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Graph preview">
        {edges.map((e, i) => {
          const from = positions.get(e.from);
          const to = positions.get(e.to);
          if (!from || !to) return null;
          return (
            <line
              key={`${e.from}-${e.to}-${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className="graph-edge"
            />
          );
        })}
        {nodes.map((n) => {
          const pos = positions.get(n.id);
          if (!pos) return null;
          return (
            <g key={n.id}>
              <circle cx={pos.x} cy={pos.y} r={10} className="graph-node" />
              <text x={pos.x} y={pos.y - 14} textAnchor="middle" className="graph-label">
                {(n.title ?? n.id).slice(0, 14)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Phase 11 — Graph explorer with mini visualization. */
export function GraphPage() {
  const { client, authLoading, missingConnection } = useRataryTabClient();
  const base = useWorkspaceBasePath();
  const [memoryId, setMemoryId] = useState('');
  const [depth, setDepth] = useState(2);
  const [result, setResult] = useState<GraphTraverseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleTraverse(e: React.FormEvent) {
    e.preventDefault();
    if (!client) return;
    setError(null);
    setLoading(true);
    try {
      const seed = memoryId.trim();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seed);
      const data = await client.traverseGraph(
        isUuid ? { memoryId: seed, depth } : { depth, seed: { slug: seed } },
      );
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(formatRataryApiError(err));
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="page studio-page">
        <p>Loading session…</p>
      </div>
    );
  }

  if (missingConnection) {
    return <RataryConnectionNotice title="Knowledge Graph" />;
  }

  const nodeCount = result?.nodes?.length ?? 0;
  const edgeCount = result?.edges?.length ?? 0;

  return (
    <div className="page graph-page">
      <PageHeader
        title="Graph explorer"
        description="Traverse memory relations from a seed — UUID or slug — up to depth 3."
      />

      <Card className="graph-query-card">
        <form className="graph-query" onSubmit={handleTraverse}>
          <Input
            label="Seed memory"
            placeholder="Memory UUID or slug"
            value={memoryId}
            onChange={(e) => setMemoryId(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            label="Depth"
            type="number"
            min={1}
            max={3}
            className="graph-depth-field"
            value={String(depth)}
            onChange={(e) => setDepth(Number(e.target.value))}
            disabled={loading}
          />
          <div className="graph-query-actions">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Traversing…' : 'Traverse'}
            </Button>
          </div>
        </form>
      </Card>

      {error && (
        <Card className="ratary-connection-notice">
          <p className="error graph-error">{error}</p>
        </Card>
      )}

      {!result && !error && !loading && (
        <EmptyState
          title="No graph loaded"
          description="Enter a memory UUID or slug, then run traverse to see related nodes."
        />
      )}

      {result && (
        <div className="graph-results">
          <div className="graph-results-summary">
            <span className="graph-stat">
              <strong>{nodeCount}</strong> nodes
            </span>
            <span className="graph-stat">
              <strong>{edgeCount}</strong> edges
            </span>
          </div>

          <div className="graph-results-grid">
            {nodeCount > 0 && (
              <Card className="graph-viz-card">
                <h2 className="graph-section-title">Preview</h2>
                <GraphViz result={result} />
              </Card>
            )}

            <Card className="graph-nodes-card">
              <h2 className="graph-section-title">Nodes</h2>
              {nodeCount === 0 ? (
                <p className="muted">No nodes returned for this seed.</p>
              ) : (
                <ul className="graph-node-list">
                  {(result.nodes ?? []).map((n) => (
                    <li key={n.id}>
                      <Link to={`${base}/memories/${n.id}`}>{n.title ?? n.id}</Link>
                      {n.depth !== undefined && <span className="tag">depth {n.depth}</span>}
                    </li>
                  ))}
                </ul>
              )}

              {edgeCount > 0 && (
                <>
                  <h2 className="graph-section-title">Edges</h2>
                  <ul className="graph-edge-list">
                    {result.edges!.map((e, i) => (
                      <li key={`${e.from}-${e.to}-${i}`}>
                        <code className="graph-edge-code">
                          {e.from.slice(0, 8)}…
                        </code>
                        <span className="graph-edge-arrow">→</span>
                        <code className="graph-edge-code">
                          {e.to.slice(0, 8)}…
                        </code>
                        {e.type && <span className="tag">{e.type}</span>}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
