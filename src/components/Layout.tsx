import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useConnection } from '../hooks/useConnection';
import { useOrgContext } from '../hooks/useOrgContext';
import { useWorkspaceBasePath } from '../hooks/useWorkspacePath';
import { CapabilityGate } from './CapabilityGate';
import { DragDismissBar } from './DragDismissBar';
import { useDragDismiss } from '../hooks/useDragDismiss';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link active' : 'nav-link';

function maskApiKey(key: string): string {
  if (key.length <= 12) return '••••••••';
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}

function NavItems({ base, ontoryUrl, onNavigate }: { base: string; ontoryUrl?: string; onNavigate?: () => void }) {
  const extra = onNavigate ? { onClick: onNavigate } : {};

  return (
    <>
      <NavLink to={base} end className={linkClass} {...extra}>Dashboard</NavLink>
      <NavLink to={`${base}/memories`} className={linkClass} {...extra}>Memories</NavLink>
      <NavLink to={`${base}/search`} className={linkClass} {...extra}>Search</NavLink>
      <CapabilityGate flag="supportsKnowledgeGraph">
        <NavLink to={`${base}/graph`} className={linkClass} {...extra}>Graph</NavLink>
      </CapabilityGate>
      <NavLink to={`${base}/knowledge`} className={linkClass} {...extra}>Knowledge</NavLink>
      <CapabilityGate flag="supportsWorkspace">
        <NavLink to={`${base}/workspaces`} className={linkClass} {...extra}>Workspaces</NavLink>
      </CapabilityGate>
      <NavLink to={`${base}/agents`} className={linkClass} {...extra}>Agents</NavLink>
      <NavLink to={`${base}/mcp`} className={linkClass} {...extra}>MCP</NavLink>
      <NavLink to={`${base}/profiles`} className={linkClass} {...extra}>Profiles</NavLink>
      <NavLink to={`${base}/stacks`} className={linkClass} {...extra}>Stacks</NavLink>
      <NavLink to={`${base}/stack-builder`} className={linkClass} {...extra}>Builder</NavLink>
      <NavLink to={`${base}/models`} className={linkClass} {...extra}>Models</NavLink>
      <NavLink to={`${base}/coding`} className={linkClass} {...extra}>Coding</NavLink>
      <NavLink to={`${base}/organization`} className={linkClass} {...extra}>Organization</NavLink>
      <NavLink to={`${base}/enterprise`} className={linkClass} {...extra}>Enterprise</NavLink>
      <NavLink to={`${base}/observability`} className={linkClass} {...extra}>Observability</NavLink>
      <NavLink to={`${base}/security`} className={linkClass} {...extra}>Security</NavLink>
      {ontoryUrl ? (
        <a className="nav-link external" href={ontoryUrl} target="_blank" rel="noreferrer">
          Ontory ↗
        </a>
      ) : (
        <>
          <NavLink to={`${base}/ontory`} className={linkClass} {...extra}>Ontory</NavLink>
          <NavLink to={`${base}/ontory/chat`} className={linkClass} {...extra}>Chat</NavLink>
        </>
      )}
    </>
  );
}

/** Workspace shell — glass sidebar + mobile drawer with drag-to-close. */
export function Layout() {
  const { session, logout } = useAuth();
  const { activeConnection } = useConnection();
  const org = useOrgContext();
  const base = useWorkspaceBasePath();
  const navigate = useNavigate();
  const ontoryUrl = import.meta.env.VITE_ONTORY_URL;
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const drawerDrag = useDragDismiss({ onDismiss: closeMenu, threshold: 80 });

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, closeMenu]);

  const connectionLabel =
    session?.accessToken && !activeConnection
      ? 'OIDC cloud'
      : session?.legacyApiKey != null
        ? maskApiKey(session.legacyApiKey)
        : activeConnection?.label ?? activeConnection?.baseUrl ?? '—';

  return (
    <div className="app-shell glass-shell">
      <aside className="sidebar glass-sidebar desktop-only">
        <div className="brand">
          <span className="brand-mark">O</span>
          <div>
            <strong>Ontorata Studio</strong>
            <small>Ratary operator console</small>
          </div>
        </div>
        <nav className="nav">
          <NavItems base={base} ontoryUrl={ontoryUrl} />
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

      <div className="main-column">
        <header className="mobile-top-bar glass-bar mobile-only">
          <button type="button" className="menu-fab" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <span className="menu-fab-icon" />
          </button>
          <span className="mobile-title">Ontorata Studio</span>
          <button type="button" className="btn ghost mobile-back" onClick={() => navigate(-1)} aria-label="Back">
            ←
          </button>
        </header>

        <main className="main glass-main">
          <Outlet />
        </main>
      </div>

      {menuOpen && (
        <div className="drawer-scrim" onClick={closeMenu} aria-hidden />
      )}
      <aside
        className={`glass-drawer mobile-only ${menuOpen ? 'open' : ''}`}
        style={menuOpen ? drawerDrag.panelStyle : undefined}
        aria-hidden={!menuOpen}
      >
        {menuOpen && (
          <DragDismissBar
            {...drawerDrag.handleProps}
            hint="Drag down to close menu"
            className={drawerDrag.dragging ? 'is-dragging' : undefined}
          />
        )}
        <div className="brand">
          <span className="brand-mark">O</span>
          <div>
            <strong>Menu</strong>
            <small>{connectionLabel}</small>
          </div>
        </div>
        <nav className="nav drawer-nav">
          <NavItems base={base} ontoryUrl={ontoryUrl} onNavigate={closeMenu} />
        </nav>
        <footer className="sidebar-foot">
          <button type="button" className="btn logout-btn" onClick={() => void logout()}>
            Sign out
          </button>
        </footer>
      </aside>
    </div>
  );
}
