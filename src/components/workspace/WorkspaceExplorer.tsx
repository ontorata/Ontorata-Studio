import { useState } from 'react';
import { NAV_GROUPS } from '../../config/navigation';
import { useCapabilities } from '../../hooks/useCapabilities';
import { useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';
import { NavIcon } from '../NavIcon';

export function WorkspaceExplorer() {
  const { openTab, closeSidebarPanel } = useWorkspaceTabs();
  const { capabilities } = useCapabilities();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function toggleGroup(id: string) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="ws-explorer">
      <div className="ws-explorer-header ws-panel-header">
        <span>EXPLORER</span>
        <button
          type="button"
          className="ws-panel-close"
          aria-label="Close explorer"
          onClick={() => closeSidebarPanel()}
        >
          ×
        </button>
      </div>

      <div className="ws-tree-root">
        <button
          type="button"
          className="ws-tree-row"
          onClick={() => openTab('', 'Welcome')}
        >
          <span className="ws-tree-chevron muted">•</span>
          <NavIcon name="home" />
          <span className="ws-tree-label">Welcome</span>
        </button>

        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) => {
            if (!item.capabilityFlag) return true;
            return capabilities[item.capabilityFlag] === true;
          });
          if (!items.length) return null;
          const isCollapsed = collapsed[group.id];

          return (
            <div key={group.id} className="ws-tree-group">
              <button
                type="button"
                className="ws-tree-row ws-tree-group-row"
                onClick={() => toggleGroup(group.id)}
              >
                <span className="ws-tree-chevron">{isCollapsed ? '▶' : '▼'}</span>
                <span className="ws-tree-icon">📂</span>
                <span className="ws-tree-label">{group.label}</span>
              </button>
              {!isCollapsed &&
                items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="ws-tree-row ws-tree-item"
                    onClick={() => openTab(item.path, item.label)}
                  >
                    <span className="ws-tree-chevron muted"> </span>
                    <NavIcon name={item.icon} />
                    <span className="ws-tree-label">{item.label}</span>
                  </button>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
