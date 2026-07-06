import { Link } from 'react-router-dom';
import { listStacks } from '../infrastructure/storage/stack-store';
import { listProfiles } from '../infrastructure/storage/profile-store';
import { useWorkspaceBasePath } from '../hooks/useWorkspacePath';
import { Card, PageHeader } from '../presentation/design-system/primitives';

/** Phase 10 — Stack builder overview (links profiles + stacks). */
export function StackBuilderPage() {
  const base = useWorkspaceBasePath();
  const profiles = listProfiles();
  const stacks = listStacks();

  return (
    <div className="page">
      <PageHeader
        title="Stack Builder"
        description="Combine profiles and stacks into deployable agent configurations."
      />
      <div className="grid two">
        <Card>
          <h2>Profiles ({profiles.length})</h2>
          <p>Define persona and policy presets.</p>
          <Link to={`${base}/profiles`} className="btn ghost">
            Manage profiles →
          </Link>
        </Card>
        <Card>
          <h2>Stacks ({stacks.length})</h2>
          <p>Bundle tools, models, and memory policies.</p>
          <Link to={`${base}/stacks`} className="btn ghost">
            Manage stacks →
          </Link>
        </Card>
      </div>
    </div>
  );
}
