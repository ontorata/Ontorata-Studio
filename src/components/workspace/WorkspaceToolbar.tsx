import { useRef, useState } from 'react';
import { NAV_GROUPS } from '../../config/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';

interface MenuItem {
  label: string;
  action: () => void;
  shortcut?: string;
}

interface MenuDef {
  label: string;
  items: MenuItem[];
}

export function WorkspaceToolbar() {
  const { logout } = useAuth();
  const {
    openTab,
    toggleTerminal,
    toggleAiPanel,
    toggleSidebar,
    setFolderName,
  } = useWorkspaceTabs();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  async function onOpenFolder() {
    setOpenMenu(null);
    if ('showDirectoryPicker' in window) {
      try {
        const handle = await (
          window as Window & {
            showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
          }
        ).showDirectoryPicker();
        setFolderName(handle.name);
      } catch {
        /* user cancelled */
      }
      return;
    }
    setFolderName('Ontorata Studio');
  }

  const goItems: MenuItem[] = NAV_GROUPS.flatMap((g) =>
    g.items.map((item) => ({
      label: item.label,
      action: () => {
        openTab(item.path, item.label);
        setOpenMenu(null);
      },
    })),
  );

  const menus: MenuDef[] = [
    {
      label: 'File',
      items: [
        { label: 'Open Folder…', action: onOpenFolder, shortcut: 'Ctrl+K Ctrl+O' },
        { label: 'Open Workspace', action: () => openTab(''), shortcut: 'Ctrl+O' },
        { label: 'Open Memory Bank', action: () => openTab('memories') },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Toggle Sidebar', action: toggleSidebar, shortcut: 'Ctrl+B' },
        { label: 'Toggle AI Panel', action: toggleAiPanel, shortcut: 'Ctrl+J' },
        { label: 'Toggle Terminal', action: toggleTerminal, shortcut: 'Ctrl+`' },
      ],
    },
    {
      label: 'Go',
      items: goItems.slice(0, 12),
    },
    {
      label: 'Run',
      items: [
        { label: 'System Health', action: () => openTab('observability') },
        { label: 'Search Intelligence', action: () => openTab('search') },
      ],
    },
    {
      label: 'Terminal',
      items: [
        { label: 'New Terminal', action: toggleTerminal },
        { label: 'Show Terminal Panel', action: toggleTerminal },
      ],
    },
    {
      label: 'Help',
      items: [
        {
          label: 'Documentation',
          action: () => window.open('https://ontorata.com', '_blank', 'noopener'),
        },
        { label: 'About Ontorata Studio', action: () => openTab('') },
      ],
    },
  ];

  return (
    <header className="ws-toolbar" ref={menuRef}>
      <div className="ws-toolbar-brand">
        <span className="ws-toolbar-logo">O</span>
        <span className="ws-toolbar-title">Ontorata Studio</span>
      </div>

      <nav className="ws-menubar" aria-label="Application menu">
        {menus.map((menu) => (
          <div key={menu.label} className="ws-menu-wrap">
            <button
              type="button"
              className={`ws-menu-trigger${openMenu === menu.label ? ' open' : ''}`}
              onClick={() => setOpenMenu((m) => (m === menu.label ? null : menu.label))}
              onBlur={(e) => {
                if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) {
                  setOpenMenu(null);
                }
              }}
            >
              {menu.label}
            </button>
            {openMenu === menu.label && (
              <ul className="ws-menu-dropdown" role="menu">
                {menu.items.map((item) => (
                  <li key={item.label} role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className="ws-menu-item"
                      onClick={item.action}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && <kbd>{item.shortcut}</kbd>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>

      <div className="ws-toolbar-actions">
        <div className="ws-toolbar-search">
          <button
            type="button"
            className="ws-toolbar-search-btn"
            onClick={() => openTab('search', 'Search')}
          >
            <span>Search intelligence…</span>
            <kbd>/</kbd>
          </button>
        </div>
        <button type="button" className="ws-toolbar-signout" onClick={() => void logout()}>
          Sign out
        </button>
      </div>
    </header>
  );
}
