import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { MemoryRecord } from '@ratary/sdk';
import { useWorkspaceBasePath } from '../hooks/useWorkspacePath';
import { useStudioClient } from '../hooks/useStudioClient';
import { Button, Card, Input, PageHeader } from '../presentation/design-system/primitives';

export function MemoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const base = useWorkspaceBasePath();
  const client = useStudioClient();
  const navigate = useNavigate();
  const [memory, setMemory] = useState<MemoryRecord | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    try {
      const updated = await client.updateMemory(id, { title, content });
      setMemory(updated);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || !confirm('Delete this memory?')) return;
    await client.deleteMemory(id);
    navigate(`${base}/memories`);
  }

  if (error) {
    return (
      <div className="page studio-page">
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="page studio-page">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="page studio-page">
      <p className="studio-back-link">
        <Link to={`${base}/memories`}>← Memory Bank</Link>
      </p>

      <PageHeader
        title={memory.title}
        actions={
          <Button type="button" variant="ghost" className="studio-btn-danger" onClick={handleDelete}>
            Delete
          </Button>
        }
      />

      <Card>
        <form className="form studio-form" onSubmit={handleSave}>
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <label className="ds-field">
            <span className="ds-field-label">Content</span>
            <textarea
              className="ds-input studio-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
            />
          </label>
          <div className="button-row">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
