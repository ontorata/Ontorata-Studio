import { useEffect, useRef, useState } from 'react';
import { NAV_GROUPS } from '../../config/navigation';
import { APP_TITLE, ONTORATA_LOGO_URL } from '../../config/brand';
import { useAuth } from '../../hooks/useAuth';
import { useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';

interface MenuItem {
  label: string;
  action: () => void | Promise<void>;
  shortcut?: string;
}

interface MenuDef {
  label: string;
  items: MenuItem[];
}

export function WorkspaceToolbar() {
  const { isAuthenticated, logout } = useAuth();
  const { openTab, openFolder, openWorkspace, toggleTerminal, toggleAiPanel, toggleSidebar, showTerminal, showAiPanel, showSidebar } =
    useWorkspaceTabs();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;

    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenMenu(null);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openMenu]);

  function runMenuItem(action: () => void | Promise<void>) {
    setOpenMenu(null);
    void action();
  }

  function onAuthAction() {
    if (isAuthenticated) {
      void logout();
      return;
    }
    openTab('', 'Welcome');
  }

  async function onOpenFolder() {
    await openFolder();
  }

  async function onOpenWorkspace() {
    openWorkspace();
  }

  const goItems: MenuItem[] = NAV_GROUPS.flatMap((g) =>
    g.items.map((item) => ({
      label: item.label,
      action: () => openTab(item.path, item.label),
    })),
  );

  const menus: MenuDef[] = [
    {
      label: 'File',
      items: [
        ...(isAuthenticated
          ? [
              { label: 'Select Folder…', action: onOpenFolder, shortcut: 'Ctrl+K Ctrl+O' },
              { label: 'Open Workspace', action: onOpenWorkspace, shortcut: 'Ctrl+Shift+O' },
            ]
          : []),
        { label: 'Open Memory Bank', action: () => openTab('memories') },
      ],
    },
    {
      label: 'View',
      items: [
        {
          label: showSidebar ? 'Hide Sidebar' : 'Show Sidebar',
          action: toggleSidebar,
          shortcut: 'Ctrl+B',
        },
        {
          label: showAiPanel ? 'Hide AI Panel' : 'Show AI Panel',
          action: toggleAiPanel,
          shortcut: 'Ctrl+Alt+J',
        },
        ...(isAuthenticated
          ? [
              {
                label: showTerminal ? 'Hide Terminal' : 'Show Terminal',
                action: toggleTerminal,
                shortcut: 'Ctrl+`',
              },
            ]
          : []),
      ],
    },
    {
      label: 'Go',
      items: goItems,
    },
    {
      label: 'Run',
      items: [
        { label: 'System Health', action: () => openTab('observability') },
        ...(isAuthenticated
          ? [{ label: 'Search Intelligence', action: () => openTab('search') }]
          : []),
      ],
    },
    ...(isAuthenticated
      ? [
          {
            label: 'Terminal',
            items: [
              ...(showTerminal
                ? []
                : [{ label: 'New Terminal', action: toggleTerminal }]),
              {
                label: showTerminal ? 'Hide Terminal Panel' : 'Show Terminal Panel',
                action: toggleTerminal,
                shortcut: 'Ctrl+`',
              },
            ],
          },
        ]
      : []),
    {
      label: 'Help',
      items: [
        {
          label: 'Documentation',
          action: () => window.open('https://ontorata.com', '_blank', 'noopener'),
        },
        { label: `About ${APP_TITLE}`, action: () => openTab('') },
      ],
    },
  ];

  return (
    <header className="ws-toolbar" ref={menuRef}>
      <div className="ws-toolbar-brand">
        <img src={ONTORATA_LOGO_URL} alt="Ontorata" className="ws-toolbar-logo" />
      </div>

      <nav className="ws-menubar" aria-label="Application menu">
        {menus.map((menu) => (
          <div key={menu.label} className="ws-menu-wrap">
            <button
              type="button"
              className={`ws-menu-trigger${openMenu === menu.label ? ' open' : ''}`}
              aria-expanded={openMenu === menu.label}
              aria-haspopup="menu"
              onClick={() => setOpenMenu((m) => (m === menu.label ? null : menu.label))}
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
                      onClick={() => runMenuItem(item.action)}
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
            disabled={!isAuthenticated}
            aria-disabled={!isAuthenticated}
            title={isAuthenticated ? 'Search intelligence' : 'Sign in to search'}
            onClick={() => {
              if (!isAuthenticated) return;
              openTab('search', 'Search');
            }}
          >
            <span>Search intelligence…</span>
            <kbd>/</kbd>
          </button>
        </div>
        <button type="button" className="ws-toolbar-signout" onClick={onAuthAction}>
          {isAuthenticated ? 'Sign out' : 'Login'}
        </button>
      </div>
    </header>
  );
}
