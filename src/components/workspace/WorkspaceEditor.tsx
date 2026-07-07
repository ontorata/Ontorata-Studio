import { Outlet } from 'react-router-dom';
import { APP_TITLE, ONTORATA_LOGO_URL } from '../../config/brand';
import { WORKSPACE_SHORTCUTS } from '../../config/shortcuts';
import { isWorkspaceFilePath } from '../../domain/workspace/workspace-file-path';
import { useAuth } from '../../hooks/useAuth';
import { useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';
import { WorkspaceFileEditor } from './WorkspaceFileEditor';
import { WorkspaceLoginForm } from './WorkspaceLoginForm';

interface WorkspaceEditorProps {
  pathSuffix: string;
}

export function WorkspaceEditor({ pathSuffix }: WorkspaceEditorProps) {
  const { isAuthenticated, loading } = useAuth();
  const { tabs, activePath, activateTab, closeTab } = useWorkspaceTabs();
  const activeFilePath = isWorkspaceFilePath(activePath) ? activePath : null;
  const fileTabs = tabs.filter((tab) => tab.kind === 'file');
  const isEmpty = !pathSuffix && !activeFilePath;
  const showLogin = !loading && !isAuthenticated;

  return (
    <div className="ws-editor">
      {tabs.length > 0 && (
        <div className="ws-tabbar" role="tablist">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              role="tab"
              aria-selected={activePath === tab.path}
              className={`ws-tab${activePath === tab.path ? ' active' : ''}`}
            >
              <button
                type="button"
                className="ws-tab-label"
                onClick={() => activateTab(tab.path)}
              >
                {tab.label}
              </button>
              <button
                type="button"
                className="ws-tab-close"
                aria-label={`Close ${tab.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="ws-editor-surface">
        {!activeFilePath && <Outlet />}
        {fileTabs.map((tab) => (
          <div
            key={tab.path}
            className="ws-file-editor-pane"
            hidden={activeFilePath !== tab.path}
          >
            <WorkspaceFileEditor filePath={tab.path} />
          </div>
        ))}
        {showLogin && isEmpty && (
          <div className="ws-empty-overlay">
            <WorkspaceLoginForm variant="welcome" />
          </div>
        )}
        {showLogin && !isEmpty && (
          <div className="ws-empty-overlay">
            <WorkspaceLoginForm variant="prompt" />
          </div>
        )}
        {loading && isEmpty && (
          <div className="ws-empty-overlay">
            <p className="ws-auth-loading">Loading session…</p>
          </div>
        )}
        {!showLogin && !loading && isAuthenticated && isEmpty && (
          <div className="ws-empty-overlay">
            <WorkspaceEmptyState />
          </div>
        )}
      </div>
    </div>
  );
}

function WorkspaceEmptyState() {
  const { openTab, openWorkspace } = useWorkspaceTabs();

  return (
    <div className="ws-empty">
      <img src={ONTORATA_LOGO_URL} alt="Ontorata" className="ws-empty-logo" />
      <h2>{APP_TITLE}</h2>
      <p>Select a module from the explorer or use the menu to open your workspace.</p>

      <div className="ws-empty-actions">
        <button type="button" onClick={() => void openWorkspace()}>
          Open Workspace
        </button>
        <button type="button" onClick={() => openTab('memories', 'Memory Bank')}>
          Open Memory Bank
        </button>
        <button type="button" onClick={() => openTab('search', 'Search')}>
          Search
        </button>
        <button type="button" onClick={() => openTab('ontory/chat', 'Ontory')}>
          Ask Ontory
        </button>
      </div>

      <ul className="ws-shortcuts">
        {WORKSPACE_SHORTCUTS.map((s) => (
          <li key={s.keys}>
            <kbd>{s.keys}</kbd>
            <span>{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
