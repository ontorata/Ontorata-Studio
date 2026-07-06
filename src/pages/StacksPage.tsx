import { FormEvent, useState } from 'react';
import type { AIStackRef } from '../domain/stack/stack';
import { deleteStack, listStacks, saveStack } from '../infrastructure/storage/stack-store';
import { Button, Card, Input, PageHeader } from '../presentation/design-system/primitives';

/** Phase 09 — AI Stacks with tools and model bundles. */
export function StacksPage() {
  const [stacks, setStacks] = useState<AIStackRef[]>(() => listStacks());
  const [name, setName] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [description, setDescription] = useState('');
  const [tools, setTools] = useState('search_memory, get_context');
  const [models, setModels] = useState('ratary-default');

  function refresh() {
    setStacks(listStacks());
  }

  function onAdd(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    saveStack({
      id: crypto.randomUUID(),
      name: trimmed,
      version: version.trim() || '1.0.0',
      description: description.trim() || undefined,
      tools: tools
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      models: models
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean),
    });
    setName('');
    setDescription('');
    refresh();
  }

  return (
    <div className="page">
      <PageHeader
        title="AI Stacks"
        description="Composable tool and model bundles — combine with profiles in Stack Builder."
      />
      <Card>
        <form className="form" onSubmit={onAdd}>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Version" value={version} onChange={(e) => setVersion(e.target.value)} />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            label="Tools (comma-separated)"
            value={tools}
            onChange={(e) => setTools(e.target.value)}
          />
          <Input
            label="Models (comma-separated)"
            value={models}
            onChange={(e) => setModels(e.target.value)}
          />
          <Button type="submit" variant="primary">
            Add stack
          </Button>
        </form>
        <ul className="simple-list">
          {stacks.map((s) => (
            <li key={s.id}>
              <strong>{s.name}</strong> <code>{s.version}</code>
              {s.description && <p className="muted">{s.description}</p>}
              {s.tools && (
                <div className="tag-row">
                  {s.tools.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  deleteStack(s.id);
                  refresh();
                }}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
