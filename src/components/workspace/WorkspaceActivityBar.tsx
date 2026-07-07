import { useAuth } from '../../hooks/useAuth';
import { useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';

type ActivityId = 'explorer' | 'workspace' | 'ontory' | 'terminal';

export function WorkspaceActivityBar() {
  const { isAuthenticated } = useAuth();
  const {
    toggleTerminal,
    toggleAiPanel,
    toggleExplorerView,
    toggleWorkspaceView,
    showSidebar,
    showAiPanel,
    showTerminal,
    sidebarView,
  } = useWorkspaceTabs();

  function onSelect(id: ActivityId) {
    if (id === 'explorer') {
      toggleExplorerView();
      return;
    }
    if (id === 'workspace') {
      toggleWorkspaceView();
      return;
    }
    if (id === 'ontory') {
      toggleAiPanel();
      return;
    }
    if (id === 'terminal') {
      toggleTerminal();
    }
  }

  const items: Array<{ id: ActivityId; label: string; icon: string; active: boolean }> = [
    { id: 'explorer', label: 'Explorer', icon: '▤', active: showSidebar && sidebarView === 'explorer' },
    ...(isAuthenticated
      ? [
          {
            id: 'workspace' as const,
            label: 'Workspace',
            icon: '▣',
            active: showSidebar && sidebarView === 'workspace',
          },
        ]
      : []),
    { id: 'ontory', label: 'Ontory', icon: '⌕', active: showAiPanel },
    ...(isAuthenticated
      ? [{ id: 'terminal' as const, label: 'Terminal', icon: '▭', active: showTerminal }]
      : []),
  ];

  return (
    <aside className="ws-activity-bar" aria-label="Activity bar">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`ws-activity-btn${item.active ? ' active' : ''}`}
          title={item.id === 'workspace' ? 'Workspace (Ctrl+Shift+O)' : item.label}
          aria-label={item.label}
          aria-pressed={item.active}
          onClick={() => onSelect(item.id)}
        >
          {item.icon}
        </button>
      ))}
    </aside>
  );
}
