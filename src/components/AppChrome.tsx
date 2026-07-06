import { useLocation, useNavigate } from 'react-router-dom';
import { LAUNCHER_APPS } from '../config/launcher-apps';
import { DragDismissBar } from './DragDismissBar';
import { useDragDismiss } from '../hooks/useDragDismiss';
import { useWorkspaceBasePath } from '../hooks/useWorkspacePath';
import type { ReactNode } from 'react';

interface AppChromeProps {
  children: ReactNode;
  title?: string;
}

function resolveTitle(pathSuffix: string): string {
  const app = LAUNCHER_APPS.find((a) => a.path === pathSuffix || pathSuffix.startsWith(`${a.path}/`));
  if (app) return app.label;
  if (pathSuffix.startsWith('memories/')) return 'Memory';
  return 'App';
}

/** App window chrome — back to launcher + drag-to-close. */
export function AppChrome({ children, title }: AppChromeProps) {
  const base = useWorkspaceBasePath();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const goHome = () => navigate(base);

  const suffix = pathname.replace(`${base}/`, '').replace(base, '') || '';
  const displayTitle = title ?? resolveTitle(suffix);

  const drag = useDragDismiss({ onDismiss: goHome, threshold: 72 });

  return (
    <div className="app-window" style={drag.panelStyle}>
      <div className="app-chrome glass-bar">
        <DragDismissBar
          {...drag.handleProps}
          hint="Drag down — home"
          className={drag.dragging ? 'is-dragging' : undefined}
        />
        <div className="app-chrome-row">
          <button type="button" className="app-back-btn" onClick={goHome} aria-label="Home">
            ◁
          </button>
          <h1 className="app-chrome-title">{displayTitle}</h1>
        </div>
      </div>
      <div className="app-content">{children}</div>
    </div>
  );
}
