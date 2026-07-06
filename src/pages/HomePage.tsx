import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { HealthStatus } from '../infrastructure/ratary/studio-ratary-client';
import { NAV_GROUPS } from '../config/navigation';
import { useCapabilities } from '../hooks/useCapabilities';
import { useConnection } from '../hooks/useConnection';
import { useOrgContext } from '../hooks/useOrgContext';
import { useStudioClient } from '../hooks/useStudioClient';
import { useWorkspaceBasePath } from '../hooks/useWorkspacePath';
import { NavIcon } from '../components/NavIcon';
import type { NavIconName } from '../config/navigation';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const QUICK_ACTIONS: Array<{ label: string; path: string; icon: NavIconName; desc: string }> = [
  { label: 'Memory Bank', path: 'memories', icon: 'memory', desc: 'Browse and curate records' },
  { label: 'Search', path: 'search', icon: 'search', desc: 'Find knowledge quickly' },
  { label: 'Ontory', path: 'ontory/chat', icon: 'chat', desc: 'Ask with memory context' },
  { label: 'System Health', path: 'observability', icon: 'health', desc: 'Connection & status' },
];

/** Home — welcoming overview with quick paths into the platform. */
export function HomePage() {
  const client = useStudioClient();
  const base = useWorkspaceBasePath();
  const { hasActiveConnection } = useConnection();
  const org = useOrgContext();
  const { manifest, capabilities, loading } = useCapabilities();
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    client.getHealth().then(setHealth).catch(() => setHealth(null));
  }, [client]);

  const enabledCount = Object.values(capabilities).filter((v) => v === true).length;

  return (
    <div className="page home-page">
      <header className="home-hero">
        <h1>{greeting()}</h1>
        <p>
          {org?.orgName
            ? `You're in ${org.orgName}. Your intelligence layer is ready.`
            : 'Welcome to Ontorata Studio — your enterprise intelligence workspace.'}
        </p>
      </header>

      <div className="home-stats">
        <div className="home-stat-card">
          <span className="home-stat-label">Ratary</span>
          <span className={`home-stat-value ${hasActiveConnection ? 'ok-text' : ''}`}>
            {hasActiveConnection ? health?.status ?? 'Connected' : 'Not connected'}
          </span>
        </div>
        <div className="home-stat-card">
          <span className="home-stat-label">Capabilities</span>
          <span className="home-stat-value">{loading ? '…' : enabledCount}</span>
        </div>
        <div className="home-stat-card">
          <span className="home-stat-label">Protocol</span>
          <span className="home-stat-value">{manifest?.protocolVersion ?? '—'}</span>
        </div>
      </div>

      <section className="home-section">
        <h2>Quick actions</h2>
        <div className="home-quick-grid">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.path} to={`${base}/${action.path}`} className="home-quick-card">
              <NavIcon name={action.icon} />
              <div>
                <strong>{action.label}</strong>
                <span>{action.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <h2>Explore by area</h2>
        <div className="home-groups">
          {NAV_GROUPS.map((group) => (
            <div key={group.id} className="home-group-card">
              <h3>{group.label}</h3>
              <ul>
                {group.items.slice(0, 4).map((item) => (
                  <li key={item.id}>
                    <Link to={`${base}/${item.path}`}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
