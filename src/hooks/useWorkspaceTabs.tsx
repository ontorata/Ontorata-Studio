import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { pickWorkspaceFolder } from '../domain/workspace/pick-folder';
import { resolveNavTitle } from '../config/navigation';
import { useWorkspaceBasePath } from './useWorkspacePath';

export interface WorkspaceTab {
  id: string;
  path: string;
  label: string;
}

interface WorkspaceTabsContextValue {
  tabs: WorkspaceTab[];
  activePath: string | null;
  openTab: (path: string, label?: string) => void;
  closeTab: (id: string) => void;
  activateTab: (path: string) => void;
  syncRoute: (pathSuffix: string) => void;
  folderName: string | null;
  setFolderName: (name: string | null) => void;
  openFolder: () => Promise<void>;
  openWorkspace: () => Promise<void>;
  showTerminal: boolean;
  setShowTerminal: (show: boolean) => void;
  showAiPanel: boolean;
  setShowAiPanel: (show: boolean) => void;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  toggleTerminal: () => void;
  toggleAiPanel: () => void;
  toggleSidebar: () => void;
}

const WorkspaceTabsContext = createContext<WorkspaceTabsContextValue | null>(null);

export function WorkspaceTabsProvider({ children }: { children: ReactNode }) {
  const base = useWorkspaceBasePath();
  const navigate = useNavigate();
  const [tabs, setTabs] = useState<WorkspaceTab[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showAiPanel, setShowAiPanel] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);

  const openTab = useCallback(
    (path: string, label?: string) => {
      const normalized = path.replace(/^\//, '');
      const title = label ?? (normalized ? resolveNavTitle(normalized) : 'Welcome');
      const id = normalized || 'welcome';
      setTabs((prev) => {
        if (prev.some((t) => t.path === normalized)) return prev;
        return [...prev, { id, path: normalized, label: title }];
      });
      setActivePath(normalized);
      navigate(normalized ? `${base}/${normalized}` : base);
    },
    [base, navigate],
  );

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        const idx = prev.findIndex((t) => t.id === id);
        if (idx < 0) return prev;
        const next = prev.filter((t) => t.id !== id);
        if (activePath === prev[idx].path) {
          const fallback = next[idx - 1] ?? next[0];
          if (fallback) {
            setActivePath(fallback.path);
            navigate(fallback.path ? `${base}/${fallback.path}` : base);
          } else {
            setActivePath(null);
            navigate(base);
          }
        }
        return next;
      });
    },
    [activePath, base, navigate],
  );

  const activateTab = useCallback(
    (path: string) => {
      setActivePath(path);
      navigate(path ? `${base}/${path}` : base);
    },
    [base, navigate],
  );

  const syncRoute = useCallback((pathSuffix: string) => {
    if (!pathSuffix) {
      setActivePath(null);
      return;
    }
    setTabs((prev) => {
      if (prev.some((t) => t.path === pathSuffix)) return prev;
      return [
        ...prev,
        {
          id: pathSuffix,
          path: pathSuffix,
          label: resolveNavTitle(pathSuffix),
        },
      ];
    });
    setActivePath(pathSuffix);
  }, []);

  const toggleTerminal = useCallback(() => setShowTerminal((v) => !v), []);
  const toggleAiPanel = useCallback(() => setShowAiPanel((v) => !v), []);
  const toggleSidebar = useCallback(() => setShowSidebar((v) => !v), []);

  const openFolder = useCallback(async () => {
    const name = await pickWorkspaceFolder();
    if (!name) return;
    setFolderName(name);
    setShowSidebar(true);
  }, []);

  const openWorkspace = useCallback(async () => {
    const name = await pickWorkspaceFolder();
    if (!name) return;
    setFolderName(name);
    setShowSidebar(true);
    const normalized = '';
    const title = 'Welcome';
    setTabs((prev) => {
      if (prev.some((t) => t.path === normalized)) return prev;
      return [...prev, { id: 'welcome', path: normalized, label: title }];
    });
    setActivePath(normalized);
    navigate(base);
  }, [base, navigate]);

  const value = useMemo(
    () => ({
      tabs,
      activePath,
      openTab,
      closeTab,
      activateTab,
      syncRoute,
      folderName,
      setFolderName,
      openFolder,
      openWorkspace,
      showTerminal,
      setShowTerminal,
      showAiPanel,
      setShowAiPanel,
      showSidebar,
      setShowSidebar,
      toggleTerminal,
      toggleAiPanel,
      toggleSidebar,
    }),
    [
      tabs,
      activePath,
      openTab,
      closeTab,
      activateTab,
      syncRoute,
      folderName,
      openFolder,
      openWorkspace,
      showTerminal,
      showAiPanel,
      showSidebar,
      toggleTerminal,
      toggleAiPanel,
      toggleSidebar,
    ],
  );

  return (
    <WorkspaceTabsContext.Provider value={value}>{children}</WorkspaceTabsContext.Provider>
  );
}

export function useWorkspaceTabs() {
  const ctx = useContext(WorkspaceTabsContext);
  if (!ctx) throw new Error('useWorkspaceTabs must be used within WorkspaceTabsProvider');
  return ctx;
}
