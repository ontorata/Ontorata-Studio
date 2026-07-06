import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { GraphTraverseResult } from '../api/ratary-client';
import { useStudioClient } from '../hooks/useStudioClient';
import { useWorkspaceBasePath } from '../hooks/useWorkspacePath';

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
      <header className="page-header">
        <h1>Graph explorer</h1>
        <p>Read-only relation traversal via Ratary graph API.</p>
      </header>

      <form className="card form row-inline" onSubmit={handleTraverse}>
        <input
          placeholder="Memory UUID or slug seed"
          value={memoryId}
          onChange={(e) => setMemoryId(e.target.value)}
          required
        />
        <label className="inline">
          Depth
          <input
            type="number"
            min={1}
            max={3}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
          />
        </label>
        <button type="submit" className="btn primary">
          Traverse
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <section className="card">
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
        </section>
      )}
    </div>
  );
}
