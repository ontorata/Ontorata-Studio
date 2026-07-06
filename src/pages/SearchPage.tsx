import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { MemoryRecord } from '@ratary/sdk';
import { useCapabilities } from '../hooks/useCapabilities';
import { useStudioClient } from '../hooks/useStudioClient';
import { useWorkspaceBasePath } from '../hooks/useWorkspacePath';
import { Button, Card, EmptyState, Input, PageHeader } from '../presentation/design-system/primitives';

export function SearchPage() {
  const client = useStudioClient();
  const base = useWorkspaceBasePath();
  const { capabilities } = useCapabilities();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<MemoryRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSearched(true);
    setLoading(true);
    try {
      const res = await client.searchMemories({ q, limit: 30 });
      setResults(res.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page studio-page">
      <PageHeader
        title="Search"
        description={
          capabilities.supportsPrecisionSearch
            ? 'Precision search modes available on server — query via SDK search endpoint.'
            : 'Default SQL search via Ratary SDK.'
        }
      />

      <Card>
        <form className="studio-query" onSubmit={handleSearch}>
          <Input
            label="Query"
            hideLabel
            type="search"
            placeholder="Search memories…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            required
            disabled={loading}
          />
          <div className="studio-query-actions">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Searching…' : 'Search'}
            </Button>
          </div>
        </form>
      </Card>

      {error && <p className="error">{error}</p>}

      {searched && !error && results.length === 0 && (
        <EmptyState title="No results" description="Try a different query or broaden your search terms." />
      )}

      {results.length > 0 && (
        <Card>
          <ul className="memory-list">
            {results.map((m) => (
              <li key={m.id}>
                <Link to={`${base}/memories/${m.id}`}>
                  <strong>{m.title}</strong>
                </Link>
                {m.summary && <p>{m.summary}</p>}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
