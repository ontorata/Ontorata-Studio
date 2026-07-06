import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { MemoryRecord } from '@ratary/sdk';
import { useCapabilities } from '../hooks/useCapabilities';
import { useStudioClient } from '../hooks/useStudioClient';
import { useWorkspaceBasePath } from '../hooks/useWorkspacePath';

export function SearchPage() {
  const client = useStudioClient();
  const base = useWorkspaceBasePath();
  const { capabilities } = useCapabilities();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<MemoryRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSearched(true);
    try {
      const res = await client.searchMemories({ q, limit: 30 });
      setResults(res.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Search</h1>
        <p>
          {capabilities.supportsPrecisionSearch
            ? 'Precision search modes available on server — query via SDK search endpoint.'
            : 'Default SQL search via Ratary SDK.'}
        </p>
      </header>

      <form className="card form row-inline" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Search memories…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          required
        />
        <button type="submit" className="btn primary">
          Search
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {searched && !error && results.length === 0 && <p>No results.</p>}

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
    </div>
  );
}
