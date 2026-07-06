import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { GraphTraverseResult } from '../infrastructure/ratary/studio-ratary-client';
import { useStudioClient } from '../hooks/useStudioClient';
import { useWorkspaceBasePath } from '../hooks/useWorkspacePath';
import { Button, Card, Input, PageHeader } from '../presentation/design-system/primitives';

function GraphViz({ result }: { result: GraphTraverseResult }) {
  const nodes = result.nodes ?? [];
  const edges = result.edges ?? [];
  if (!nodes.length) return null;

  const width = 480;
  const height = 280;
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
    <svg className="graph-viz" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Graph preview">
      {edges.map((e, i) => {
        const from = positions.get(e.from);
        const to = positions.get(e.to);
        if (!from || !to) return null;
        return (
          <line key={`${e.from}-${e.to}-${i}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="graph-edge" />
        );
      })}
      {nodes.map((n) => {
        const pos = positions.get(n.id);
        if (!pos) return null;
        return (
          <g key={n.id}>
            <circle cx={pos.x} cy={pos.y} r={10} className="graph-node" />
            <text x={pos.x} y={pos.y - 14} textAnchor="middle" className="graph-label">
              {(n.title ?? n.id).slice(0, 12)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Phase 11 — Graph explorer with mini visualization. */
export function GraphPage() {
  const client = useStudioClient();
  const base = useWorkspaceBasePath();
  const [memoryId, setMemoryId] = useState('');
  const [depth, setDepth] = useState(2);
  const [result, setResult] = useState<GraphTraverseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleTraverse(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const seed = memoryId.trim();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seed);
      const data = await client.traverseGraph(
        isUuid ? { memoryId: seed, depth } : { depth, seed: { slug: seed } },
      );
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Traverse failed');
    }
  }

  return (
    <div className="page">
      <PageHeader title="Graph explorer" description="Relation traversal via Ratary graph API." />
      <Card>
        <form className="form row-inline" onSubmit={handleTraverse}>
          <Input
            label="Seed"
            hideLabel
            placeholder="Memory UUID or slug"
            value={memoryId}
            onChange={(e) => setMemoryId(e.target.value)}
            required
          />
          <label className="inline">
            Depth
            <input type="number" min={1} max={3} value={depth} onChange={(e) => setDepth(Number(e.target.value))} />
          </label>
          <Button type="submit" variant="primary">
            Traverse
          </Button>
        </form>
      </Card>

      {error && <p className="error">{error}</p>}

      {result && (
        <Card>
          {result.nodes && result.nodes.length > 0 && <GraphViz result={result} />}
          <h2>Nodes ({result.nodes?.length ?? 0})</h2>
          <ul className="memory-list">
            {(result.nodes ?? []).map((n) => (
              <li key={n.id}>
                <Link to={`${base}/memories/${n.id}`}>{n.title ?? n.id}</Link>
                {n.depth !== undefined && <span className="tag">depth {n.depth}</span>}
              </li>
            ))}
          </ul>
          {result.edges && result.edges.length > 0 && (
            <>
              <h2>Edges</h2>
              <ul className="edge-list">
                {result.edges.map((e, i) => (
                  <li key={`${e.from}-${e.to}-${i}`}>
                    {e.from} → {e.to} {e.type && <span className="tag">{e.type}</span>}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
