import { Outlet } from 'react-router-dom';
import { useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';

interface WorkspaceEditorProps {
  pathSuffix: string;
}

export function WorkspaceEditor({ pathSuffix }: WorkspaceEditorProps) {
  const { tabs, activePath, activateTab, closeTab } = useWorkspaceTabs();
  const isEmpty = !pathSuffix;

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
        <Outlet />
        {isEmpty && (
          <div className="ws-empty-overlay">
            <WorkspaceEmptyState />
          </div>
        )}
      </div>
    </div>
  );
}

function WorkspaceEmptyState() {
  const { openTab } = useWorkspaceTabs();

  const shortcuts = [
    { keys: 'Ctrl + O', label: 'Open Workspace' },
    { keys: 'Ctrl + B', label: 'Toggle Sidebar' },
    { keys: 'Ctrl + J', label: 'Toggle AI Panel' },
    { keys: 'Ctrl + `', label: 'Toggle Terminal' },
    { keys: '/', label: 'Search Intelligence' },
  ];

  return (
    <div className="ws-empty">
      <div className="ws-empty-logo">O</div>
      <h2>Ontorata Studio</h2>
      <p>Select a module from the explorer or use the menu to open your workspace.</p>

      <div className="ws-empty-actions">
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
        {shortcuts.map((s) => (
          <li key={s.keys}>
            <kbd>{s.keys}</kbd>
            <span>{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
