import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useConnection } from '../hooks/useConnection';
import { useOrgContext } from '../hooks/useOrgContext';
import { useWorkspaceBasePath } from '../hooks/useWorkspacePath';
import { CapabilityGate } from './CapabilityGate';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link active' : 'nav-link';

function maskApiKey(key: string): string {
  if (key.length <= 12) return '••••••••';
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}

/** Phase 06 — workspace shell with phase navigation. */
export function Layout() {
  const { session, logout } = useAuth();
  const { activeConnection } = useConnection();
  const org = useOrgContext();
  const base = useWorkspaceBasePath();
  const ontoryUrl = import.meta.env.VITE_ONTORY_URL;

  const connectionLabel =
    session?.legacyApiKey != null
      ? maskApiKey(session.legacyApiKey)
      : activeConnection?.label ?? activeConnection?.baseUrl ?? '—';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">O</span>
          <div>
            <strong>Ontorata Studio</strong>
            <small>Ratary operator console</small>
          </div>
        </div>
        <nav className="nav">
          <NavLink to={base} end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to={`${base}/memories`} className={linkClass}>
            Memories
          </NavLink>
          <NavLink to={`${base}/search`} className={linkClass}>
            Search
          </NavLink>
          <CapabilityGate flag="supportsKnowledgeGraph">
            <NavLink to={`${base}/graph`} className={linkClass}>
              Graph
            </NavLink>
          </CapabilityGate>
          <NavLink to={`${base}/knowledge`} className={linkClass}>
            Knowledge
          </NavLink>
          <CapabilityGate flag="supportsWorkspace">
            <NavLink to={`${base}/workspaces`} className={linkClass}>
              Workspaces
            </NavLink>
          </CapabilityGate>
          <NavLink to={`${base}/agents`} className={linkClass}>
            Agents
          </NavLink>
          <NavLink to={`${base}/mcp`} className={linkClass}>
            MCP
          </NavLink>
          <NavLink to={`${base}/profiles`} className={linkClass}>
            Profiles
          </NavLink>
          <NavLink to={`${base}/stacks`} className={linkClass}>
            Stacks
          </NavLink>
          <NavLink to={`${base}/stack-builder`} className={linkClass}>
            Builder
          </NavLink>
          <NavLink to={`${base}/models`} className={linkClass}>
            Models
          </NavLink>
          <NavLink to={`${base}/coding`} className={linkClass}>
            Coding
          </NavLink>
          <NavLink to={`${base}/observability`} className={linkClass}>
            Observability
          </NavLink>
          {ontoryUrl ? (
            <a className="nav-link external" href={ontoryUrl} target="_blank" rel="noreferrer">
              Ontory ↗
            </a>
          ) : (
            <>
              <NavLink to={`${base}/ontory`} className={linkClass}>
                Ontory
              </NavLink>
              <NavLink to={`${base}/ontory/chat`} className={linkClass}>
                Chat
              </NavLink>
            </>
          )}
        </nav>
        <footer className="sidebar-foot">
          <div className="session-block">
            <span className="session-label">Connected</span>
            <code className="session-key">{connectionLabel}</code>
            {org?.orgName && <span className="session-org">{org.orgName}</span>}
            <button type="button" className="btn logout-btn" onClick={() => void logout()}>
              Sign out
            </button>
          </div>
          <p className="engine-label">
            Memory engine: <strong>Ratary</strong>
          </p>
        </footer>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
