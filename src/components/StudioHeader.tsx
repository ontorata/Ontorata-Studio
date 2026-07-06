import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useConnection } from '../hooks/useConnection';
import { useOrgContext } from '../hooks/useOrgContext';
import { useWorkspaceBasePath, useWorkspaceId } from '../hooks/useWorkspacePath';

function formatClock(now: Date) {
  return now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

interface StudioHeaderProps {
  onMenuToggle?: () => void;
}

/** Top bar — workspace context, search, session. */
export function StudioHeader({ onMenuToggle }: StudioHeaderProps) {
  const { logout } = useAuth();
  const { hasActiveConnection } = useConnection();
  const org = useOrgContext();
  const workspaceId = useWorkspaceId();
  const base = useWorkspaceBasePath();
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      navigate(`${base}/search`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [base, navigate]);

  return (
    <header className="studio-header">
      <div className="studio-header-left">
        <button
          type="button"
          className="studio-menu-btn"
          aria-label="Open menu"
          onClick={onMenuToggle}
        >
          ☰
        </button>
        <span className="studio-header-workspace" title="Workspace">
          {org?.orgName ?? 'Workspace'} · <code>{workspaceId}</code>
        </span>
      </div>

      <Link to={`${base}/search`} className="studio-header-search">
        <span className="studio-header-search-icon">⌕</span>
        <span>Search intelligence…</span>
        <kbd className="studio-kbd">/</kbd>
      </Link>

      <div className="studio-header-right">
        <span
          className={`studio-status-pill ${hasActiveConnection ? 'online' : 'offline'}`}
          title="Ratary connection"
        >
          {hasActiveConnection ? 'Connected' : 'Offline'}
        </span>
        <span className="studio-header-time">{formatClock(now)}</span>
        <button type="button" className="studio-header-signout" onClick={() => void logout()}>
          Sign out
        </button>
      </div>
    </header>
  );
}
