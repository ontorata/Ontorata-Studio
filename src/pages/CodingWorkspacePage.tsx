import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MemoryRecord } from '@ratary/sdk';
import { RataryConnectionNotice } from '../components/RataryConnectionNotice';
import { useRataryTabClient } from '../hooks/useRataryTabClient';
import { useWorkspaceBasePath } from '../hooks/useWorkspacePath';
import { Button, Card, Input, PageHeader } from '../presentation/design-system/primitives';

/** Phase 16 — Coding workspace with memory sidebar and Ontory bridge. */
export function CodingWorkspacePage() {
  const { client, authLoading, missingConnection } = useRataryTabClient();
  const base = useWorkspaceBasePath();
  const [code, setCode] = useState('// Ask Ratary memories while you code\n');
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<MemoryRecord[]>([]);
  const [loading, setLoading] = useState(false);

  async function searchMemories(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q || !client) return;
    setLoading(true);
    try {
      const res = await client.searchMemories({ q, limit: 8 });
      setHits(res.results ?? []);
    } finally {
      setLoading(false);
    }
  }

  function insertSnippet(text: string) {
    setCode((prev) => `${prev}\n// From memory:\n${text}\n`);
  }

  if (authLoading) {
    return (
      <div className="page studio-page">
        <p>Loading session…</p>
      </div>
    );
  }

  if (missingConnection) {
    return <RataryConnectionNotice title="Development" />;
  }

  return (
    <div className="page coding-workspace">
      <PageHeader
        title="Coding Workspace"
        description="Lightweight editor with Ratary memory context — full IDE integration via Ontory product."
        actions={
          <Link to={`${base}/ontory/chat`} className="btn ghost">
            Open Ontory Chat →
          </Link>
        }
      />
      <div className="coding-grid">
        <Card className="coding-editor">
          <label>
            Editor
            <textarea
              className="code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={24}
              spellCheck={false}
            />
          </label>
        </Card>
        <Card className="coding-sidebar">
          <h2>Memory context</h2>
          <form className="form row-inline" onSubmit={searchMemories}>
            <Input
              label="Search"
              hideLabel
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search memories…"
            />
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? '…' : 'Search'}
            </Button>
          </form>
          <ul className="memory-list compact">
            {hits.map((m) => (
              <li key={m.id}>
                <button type="button" className="link-btn" onClick={() => insertSnippet(m.content ?? m.summary ?? m.title ?? '')}>
                  <strong>{m.title}</strong>
                </button>
                <Link to={`${base}/memories/${m.id}`}>Open</Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
