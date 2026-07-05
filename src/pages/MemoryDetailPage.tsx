import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { MemoryRecord } from '@ratary/sdk';
import { useStudioClient } from '../hooks/useStudioClient';

export function MemoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const client = useStudioClient();
  const navigate = useNavigate();
  const [memory, setMemory] = useState<MemoryRecord | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    client
      .getMemory(id)
      .then((m) => {
        setMemory(m);
        setTitle(m.title);
        setContent(m.content);
      })
      .catch((err: Error) => setError(err.message));
  }, [client, id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    const updated = await client.updateMemory(id, { title, content });
    setMemory(updated);
  }

  async function handleDelete() {
    if (!id || !confirm('Delete this memory?')) return;
    await client.deleteMemory(id);
    navigate('/memories');
  }

  if (error) return <p className="error">{error}</p>;
  if (!memory) return <p>Loading…</p>;

  return (
    <div className="page">
      <p>
        <Link to="/memories">← Memories</Link>
      </p>
      <header className="page-header row">
        <h1>{memory.title}</h1>
        <button type="button" className="btn danger" onClick={handleDelete}>
          Delete
        </button>
      </header>
      <form className="card form" onSubmit={handleSave}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Content
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={16} />
        </label>
        <button type="submit" className="btn primary">
          Save changes
        </button>
      </form>
    </div>
  );
}
