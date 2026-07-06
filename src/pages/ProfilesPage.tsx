import { FormEvent, useState } from 'react';
import type { AIProfileRef } from '../domain/profile/profile';
import { deleteProfile, listProfiles, saveProfile } from '../infrastructure/storage/profile-store';
import { Button, Card, Input, PageHeader } from '../presentation/design-system/primitives';

/** Phase 08 — AI Profiles (local registry MVP). */
export function ProfilesPage() {
  const [profiles, setProfiles] = useState<AIProfileRef[]>(() => listProfiles());
  const [name, setName] = useState('');
  const [scope, setScope] = useState<AIProfileRef['scope']>('personal');

  function refresh() {
    setProfiles(listProfiles());
  }

  function onAdd(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    saveProfile({ id: crypto.randomUUID(), name: trimmed, scope });
    setName('');
    refresh();
  }

  return (
    <div className="page">
      <PageHeader title="AI Profiles" description="Persona and capability presets for agents." />
      <Card>
        <form className="form inline-form" onSubmit={onAdd}>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <label>
            Scope
            <select value={scope} onChange={(e) => setScope(e.target.value as AIProfileRef['scope'])}>
              <option value="personal">Personal</option>
              <option value="organization">Organization</option>
              <option value="official">Official</option>
              <option value="community">Community</option>
            </select>
          </label>
          <Button type="submit" variant="primary">
            Add profile
          </Button>
        </form>
        <ul className="simple-list">
          {profiles.map((p) => (
            <li key={p.id}>
              <strong>{p.name}</strong> <span className="muted">({p.scope})</span>
              <Button type="button" variant="ghost" onClick={() => { deleteProfile(p.id); refresh(); }}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
