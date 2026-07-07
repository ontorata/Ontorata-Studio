import { useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';

type ActivityId = 'explorer' | 'workspace' | 'ontory' | 'terminal';

export function WorkspaceActivityBar() {
  const {
    toggleTerminal,
    toggleAiPanel,
    toggleSidebar,
    openWorkspace,
    showSidebar,
    showAiPanel,
    showTerminal,
  } = useWorkspaceTabs();

  function onSelect(id: ActivityId) {
    if (id === 'explorer') {
      toggleSidebar();
      return;
    }
    if (id === 'workspace') {
      void openWorkspace();
      return;
    }
    if (id === 'ontory') {
      toggleAiPanel();
      return;
    }
    toggleTerminal();
  }

  const items: Array<{ id: ActivityId; label: string; icon: string; active: boolean }> = [
    { id: 'explorer', label: 'Explorer', icon: '▤', active: showSidebar },
    { id: 'workspace', label: 'Open Workspace', icon: '▣', active: false },
    { id: 'ontory', label: 'Ontory', icon: '⌕', active: showAiPanel },
    { id: 'terminal', label: 'Terminal', icon: '▭', active: showTerminal },
  ];

  return (
    <aside className="ws-activity-bar" aria-label="Activity bar">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`ws-activity-btn${item.active ? ' active' : ''}`}
          title={item.id === 'workspace' ? 'Open Workspace (Ctrl+Shift+O)' : item.label}
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
