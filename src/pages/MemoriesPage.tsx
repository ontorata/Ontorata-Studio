import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MemoryRecord } from '@ratary/sdk';
import { useStudioClient } from '../hooks/useStudioClient';
import { useWorkspaceBasePath } from '../hooks/useWorkspacePath';

export function MemoriesPage() {
  const client = useStudioClient();
  const base = useWorkspaceBasePath();
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const reload = useCallback(() => {
    setLoading(true);
    client
      .listMemories({ limit: 50 })
      .then((res) => {
        setMemories(res.memories ?? []);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [client]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await client.createMemory({ title, content });
    setTitle('');
    setContent('');
    setShowForm(false);
    reload();
  }

  return (
    <div className="page">
      <header className="page-header row">
        <div>
          <h1>Memories</h1>
          <p>Browse and curate memory records.</p>
        </div>
        <button type="button" className="btn primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'New memory'}
        </button>
      </header>

      {showForm && (
        <form className="card form" onSubmit={handleCreate}>
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label>
            Content
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} required />
          </label>
          <button type="submit" className="btn primary">
            Save
          </button>
        </form>
      )}

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}

      <ul className="memory-list">
        {memories.map((m) => (
          <li key={m.id}>
            <Link to={`${base}/memories/${m.id}`}>
              <strong>{m.title}</strong>
              {m.project && <span className="tag">{m.project}</span>}
            </Link>
            {m.summary && <p>{m.summary}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
