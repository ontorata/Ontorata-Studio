import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CapabilityGate } from './CapabilityGate';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link active' : 'nav-link';

function maskApiKey(key: string): string {
  if (key.length <= 12) return '••••••••';
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}

export function Layout() {
  const { session, logout } = useAuth();
  const ontoryUrl = import.meta.env.VITE_ONTORY_URL;

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
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/memories" className={linkClass}>
            Memories
          </NavLink>
          <NavLink to="/search" className={linkClass}>
            Search
          </NavLink>
          <CapabilityGate flag="supportsKnowledgeGraph">
            <NavLink to="/graph" className={linkClass}>
              Graph
            </NavLink>
          </CapabilityGate>
          <CapabilityGate flag="supportsWorkspace">
            <NavLink to="/workspaces" className={linkClass}>
              Workspaces
            </NavLink>
          </CapabilityGate>
          {ontoryUrl ? (
            <a className="nav-link external" href={ontoryUrl} target="_blank" rel="noreferrer">
              Ontory ↗
            </a>
          ) : (
            <NavLink to="/ontory" className={linkClass}>
              Ontory
            </NavLink>
          )}
        </nav>
        <footer className="sidebar-foot">
          <div className="session-block">
            <span className="session-label">Connected</span>
            <code className="session-key">
              {session?.legacyApiKey ? maskApiKey(session.legacyApiKey) : '—'}
            </code>
            <button type="button" className="btn logout-btn" onClick={logout}>
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
