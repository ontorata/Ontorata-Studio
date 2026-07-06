import { FormEvent, useState } from 'react';
import type { AIStackRef } from '../domain/stack/stack';
import { deleteStack, listStacks, saveStack } from '../infrastructure/storage/stack-store';
import { Button, Card, Input, PageHeader } from '../presentation/design-system/primitives';

/** Phase 09 — AI Stacks (local registry MVP). */
export function StacksPage() {
  const [stacks, setStacks] = useState<AIStackRef[]>(() => listStacks());
  const [name, setName] = useState('');
  const [version, setVersion] = useState('1.0.0');

  function refresh() {
    setStacks(listStacks());
  }

  function onAdd(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    saveStack({ id: crypto.randomUUID(), name: trimmed, version: version.trim() || '1.0.0' });
    setName('');
    refresh();
  }

  return (
    <div className="page">
      <PageHeader title="AI Stacks" description="Composable tool and model bundles for agents." />
      <Card>
        <form className="form inline-form" onSubmit={onAdd}>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Version" value={version} onChange={(e) => setVersion(e.target.value)} />
          <Button type="submit" variant="primary">
            Add stack
          </Button>
        </form>
        <ul className="simple-list">
          {stacks.map((s) => (
            <li key={s.id}>
              <strong>{s.name}</strong> <code>{s.version}</code>
              <Button type="button" variant="ghost" onClick={() => { deleteStack(s.id); refresh(); }}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
