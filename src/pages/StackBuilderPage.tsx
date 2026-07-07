import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AgentConfigRef } from '../domain/agent/agent-config';
import {
  deleteAgentConfig,
  listAgentConfigs,
  saveAgentConfig,
} from '../infrastructure/storage/agent-config-store';
import { listProfiles } from '../infrastructure/storage/profile-store';
import { listStacks } from '../infrastructure/storage/stack-store';
import { useWorkspaceBasePath } from '../hooks/useWorkspacePath';
import { Button, Card, Input, PageHeader } from '../presentation/design-system/primitives';

/** Phase 10 — Compose profile + stack into deployable agent configs. */
export function StackBuilderPage() {
  const base = useWorkspaceBasePath();
  const profiles = listProfiles();
  const stacks = listStacks();
  const [configs, setConfigs] = useState<AgentConfigRef[]>(() => listAgentConfigs());
  const [name, setName] = useState('');
  const [profileId, setProfileId] = useState(profiles[0]?.id ?? '');
  const [stackId, setStackId] = useState(stacks[0]?.id ?? '');
  const [exported, setExported] = useState<string | null>(null);

  function refresh() {
    setConfigs(listAgentConfigs());
  }

  function onCompose(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !profileId || !stackId) return;
    const config: AgentConfigRef = {
      id: crypto.randomUUID(),
      name: trimmed,
      profileId,
      stackId,
      createdAt: new Date().toISOString(),
    };
    saveAgentConfig(config);
    setName('');
    refresh();
    setExported(JSON.stringify({ ...config, profile: profiles.find((p) => p.id === profileId), stack: stacks.find((s) => s.id === stackId) }, null, 2));
  }

  return (
    <div className="page">
      <PageHeader
        title="Stack Builder"
        description="Combine profiles and stacks into agent configurations for export or deployment."
      />
      <div className="grid two">
        <Card>
          <h2>Compose agent</h2>
          <form className="form" onSubmit={onCompose}>
            <Input label="Agent name" value={name} onChange={(e) => setName(e.target.value)} required />
            <label>
              Profile
              <select value={profileId} onChange={(e) => setProfileId(e.target.value)} required>
                <option value="">Select profile</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.scope})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Stack
              <select value={stackId} onChange={(e) => setStackId(e.target.value)} required>
                <option value="">Select stack</option>
                {stacks.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} v{s.version}
                  </option>
                ))}
              </select>
            </label>
            <div className="button-row">
              <Button type="submit" variant="primary" disabled={!profiles.length || !stacks.length}>
                Create config
              </Button>
              <Link to={`${base}/profiles`} className="btn ghost">
                Profiles
              </Link>
              <Link to={`${base}/stacks`} className="btn ghost">
                Stacks
              </Link>
            </div>
          </form>
          {(!profiles.length || !stacks.length) && (
            <p className="muted">Create at least one profile and one stack first.</p>
          )}
        </Card>
        <Card>
          <h2>Saved configs ({configs.length})</h2>
          <ul className="simple-list">
            {configs.map((c) => (
              <li key={c.id}>
                <strong>{c.name}</strong>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    deleteAgentConfig(c.id);
                    refresh();
                  }}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          {exported && (
            <pre className="code-block">{exported}</pre>
          )}
        </Card>
      </div>
    </div>
  );
}
