import { Link } from 'react-router-dom';
import { LAUNCHER_APPS } from '../config/launcher-apps';
import { useCapabilities } from '../hooks/useCapabilities';
import { useAuth } from '../hooks/useAuth';
import { useWorkspaceBasePath } from '../hooks/useWorkspacePath';

/** Android home screen — icon grid launcher. */
export function LauncherGrid() {
  const base = useWorkspaceBasePath();
  const { capabilities } = useCapabilities();
  const { logout } = useAuth();
  const ontoryUrl = import.meta.env.VITE_ONTORY_URL;

  const visible = LAUNCHER_APPS.filter((app) => {
    if (!app.capabilityFlag) return true;
    return capabilities[app.capabilityFlag] === true;
  });

  return (
    <div className="launcher-screen">
      <div className="launcher-search glass-panel">
        <span className="launcher-search-icon">⌕</span>
        <span className="launcher-search-placeholder">Search memories, apps…</span>
        <Link to={`${base}/search`} className="launcher-search-link" aria-label="Open search" />
      </div>

      <div className="launcher-grid" role="list">
        {visible.map((app) => (
          <Link
            key={app.id}
            to={`${base}/${app.path}`}
            className="launcher-tile"
            role="listitem"
          >
            <span className="launcher-icon" style={{ ['--tile-tint' as string]: app.tint }}>
              {app.icon}
            </span>
            <span className="launcher-label">{app.label}</span>
          </Link>
        ))}
        {ontoryUrl && (
          <a href={ontoryUrl} className="launcher-tile" target="_blank" rel="noreferrer" role="listitem">
            <span className="launcher-icon" style={{ ['--tile-tint' as string]: '#16c47f' }}>
              ↗
            </span>
            <span className="launcher-label">Ontory Web</span>
          </a>
        )}
      </div>

      <footer className="launcher-dock glass-panel">
        <button type="button" className="launcher-dock-btn" onClick={() => void logout()}>
          <span className="launcher-icon small" style={{ ['--tile-tint' as string]: '#6b7280' }}>
            ⏻
          </span>
          <span className="launcher-label">Sign out</span>
        </button>
        <Link to={`${base}/observability`} className="launcher-dock-btn">
          <span className="launcher-icon small" style={{ ['--tile-tint' as string]: '#16c47f' }}>
            ◉
          </span>
          <span className="launcher-label">System</span>
        </Link>
      </footer>
    </div>
  );
}
