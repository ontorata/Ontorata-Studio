import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MemoryRecord } from '@ratary/sdk';
import { useStudioClient } from '../hooks/useStudioClient';
import { useWorkspaceBasePath } from '../hooks/useWorkspacePath';
import { Button, Card, EmptyState, Input, PageHeader } from '../presentation/design-system/primitives';

const PAGE_SIZE = 50;

/** Phase 11 — Memory explorer with filters and pagination. */
export function MemoriesPage() {
  const client = useStudioClient();
  const base = useWorkspaceBasePath();
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    client
      .listMemories({ limit: PAGE_SIZE, offset, project: projectFilter || undefined })
      .then((res) => {
        setMemories(res.memories ?? []);
        setHasMore((res.memories?.length ?? 0) >= PAGE_SIZE);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [client, offset, projectFilter]);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return memories;
    return memories.filter(
      (m) =>
        m.title?.toLowerCase().includes(q) ||
        m.content?.toLowerCase().includes(q) ||
        m.project?.toLowerCase().includes(q),
    );
  }, [memories, searchFilter]);

  const projects = useMemo(
    () => [...new Set(memories.map((m) => m.project).filter(Boolean))] as string[],
    [memories],
  );

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await client.createMemory({ title, content, project: projectFilter || undefined });
    setTitle('');
    setContent('');
    setShowForm(false);
    setOffset(0);
    reload();
  }

  return (
    <div className="page">
      <PageHeader
        title="Memories"
        description="Browse, filter, and curate memory records in your Ratary brain."
        actions={
          <Button type="button" variant="primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : 'New memory'}
          </Button>
        }
      />

      <Card className="filter-bar">
        <Input
          label="Filter"
          hideLabel
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter loaded memories…"
        />
        <label>
          Project
          <select value={projectFilter} onChange={(e) => { setProjectFilter(e.target.value); setOffset(0); }}>
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </Card>

      {showForm && (
        <Card>
          <form className="form" onSubmit={handleCreate}>
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <label>
              Content
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} required />
            </label>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </form>
        </Card>
      )}

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="No memories" description="Create your first memory or adjust filters." />
      )}

      <ul className="memory-list">
        {filtered.map((m) => (
          <li key={m.id}>
            <Link to={`${base}/memories/${m.id}`}>
              <strong>{m.title}</strong>
              {m.project && <span className="tag">{m.project}</span>}
            </Link>
            {m.summary && <p>{m.summary}</p>}
          </li>
        ))}
      </ul>

      <div className="button-row">
        <Button type="button" variant="ghost" disabled={offset === 0} onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}>
          Previous
        </Button>
        <span className="muted">Offset {offset}</span>
        <Button type="button" variant="ghost" disabled={!hasMore} onClick={() => setOffset((o) => o + PAGE_SIZE)}>
          Next
        </Button>
      </div>
    </div>
  );
}
