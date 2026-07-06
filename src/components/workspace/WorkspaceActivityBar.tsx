import { useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';

type ActivityId = 'explorer' | 'search' | 'ai' | 'terminal';

export function WorkspaceActivityBar() {
  const { openTab, toggleAiPanel, toggleTerminal, showSidebar, setShowSidebar } =
    useWorkspaceTabs();

  function onSelect(id: ActivityId) {
    if (id === 'explorer') {
      setShowSidebar(true);
      return;
    }
    if (id === 'search') {
      openTab('search', 'Search');
      return;
    }
    if (id === 'ai') {
      toggleAiPanel();
      return;
    }
    if (id === 'terminal') {
      toggleTerminal();
    }
  }

  const items: Array<{ id: ActivityId; label: string; icon: string; active?: boolean }> = [
    { id: 'explorer', label: 'Explorer', icon: '▤', active: showSidebar },
    { id: 'search', label: 'Search', icon: '⌕' },
    { id: 'ai', label: 'Ontory AI', icon: '◈' },
    { id: 'terminal', label: 'Terminal', icon: '▭' },
  ];

  return (
    <aside className="ws-activity-bar" aria-label="Activity bar">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`ws-activity-btn${item.active ? ' active' : ''}`}
          title={item.label}
          aria-label={item.label}
          onClick={() => onSelect(item.id)}
        >
          {item.icon}
        </button>
      ))}
    </aside>
  );
}
