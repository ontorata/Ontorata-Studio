import { FormEvent, useState } from 'react';
import type { AIProfileRef } from '../domain/profile/profile';
import { deleteProfile, listProfiles, saveProfile } from '../infrastructure/storage/profile-store';
import { Button, Card, Input, PageHeader } from '../presentation/design-system/primitives';

const CAPABILITY_PRESETS = ['memory.read', 'memory.write', 'search', 'graph', 'mcp.tools'];

/** Phase 08 — AI Profiles with persona, scope, and capability presets. */
export function ProfilesPage() {
  const [profiles, setProfiles] = useState<AIProfileRef[]>(() => listProfiles());
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<AIProfileRef['scope']>('personal');
  const [capabilities, setCapabilities] = useState<string[]>(['memory.read', 'memory.write']);

  function refresh() {
    setProfiles(listProfiles());
  }

  function toggleCapability(cap: string) {
    setCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap],
    );
  }

  function onAdd(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    saveProfile({
      id: crypto.randomUUID(),
      name: trimmed,
      scope,
      description: description.trim() || undefined,
      capabilities: capabilities.length ? capabilities : undefined,
    });
    setName('');
    setDescription('');
    refresh();
  }

  return (
    <div className="page">
      <PageHeader
        title="AI Profiles"
        description="Persona and capability presets for agent configurations (stored locally in browser)."
      />
      <Card>
        <form className="form" onSubmit={onAdd}>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label>
            Scope
            <select value={scope} onChange={(e) => setScope(e.target.value as AIProfileRef['scope'])}>
              <option value="personal">Personal</option>
              <option value="organization">Organization</option>
              <option value="official">Official</option>
              <option value="community">Community</option>
            </select>
          </label>
          <fieldset className="mode-fieldset">
            <legend>Capabilities</legend>
            {CAPABILITY_PRESETS.map((cap) => (
              <label key={cap}>
                <input
                  type="checkbox"
                  checked={capabilities.includes(cap)}
                  onChange={() => toggleCapability(cap)}
                />
                {cap}
              </label>
            ))}
          </fieldset>
          <div className="form-actions">
            <Button type="submit" variant="primary">
              Add profile
            </Button>
          </div>
        </form>
        {profiles.length > 0 && (
          <ul className="simple-list profile-list">
          {profiles.map((p) => (
            <li key={p.id}>
              <div>
                <strong>{p.name}</strong> <span className="muted">({p.scope})</span>
                {p.description && <p className="muted">{p.description}</p>}
                {p.capabilities && (
                  <div className="tag-row">
                    {p.capabilities.map((c) => (
                      <span key={c} className="tag">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="profile-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    deleteProfile(p.id);
                    refresh();
                  }}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
