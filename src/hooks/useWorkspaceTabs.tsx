import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import type { PickedWorkspaceFolder } from '../domain/workspace/pick-folder';
import { pickWorkspaceFolder } from '../domain/workspace/pick-folder';

export type SidebarView = 'explorer' | 'workspace';
export type ActivityId = 'explorer' | 'workspace' | 'ontory' | 'terminal';

import { resolveNavTitle } from '../config/navigation';
import { fromWorkspaceFilePath, toWorkspaceFilePath, isWorkspaceFilePath } from '../domain/workspace/workspace-file-path';
import { normalizeRelativePath } from '../domain/workspace/dirty-file-paths';
import { deleteWorkspaceFile, renameWorkspaceFile } from '../domain/workspace/mutate-workspace-entry';
import { useWorkspaceBasePath } from './useWorkspacePath';

export interface WorkspaceTab {
  id: string;
  path: string;
  label: string;
  kind?: 'route' | 'file';
  fileHandle?: FileSystemFileHandle;
}

interface WorkspaceTabsContextValue {
  tabs: WorkspaceTab[];
  activePath: string | null;
  openTab: (path: string, label?: string) => void;
  openWorkspaceFile: (relativePath: string, name: string, handle: FileSystemFileHandle) => void;
  closeTab: (id: string) => void;
  activateTab: (path: string) => void;
  syncRoute: (pathSuffix: string) => void;
  workspaceFolder: PickedWorkspaceFolder | null;
  sidebarView: SidebarView;
  openFolder: () => Promise<void>;
  openWorkspace: () => void;
  selectWorkspaceFolder: () => Promise<void>;
  showExplorerView: () => void;
  showWorkspaceView: () => void;
  showTerminal: boolean;
  setShowTerminal: (show: boolean) => void;
  showAiPanel: boolean;
  setShowAiPanel: (show: boolean) => void;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  explorerActive: boolean;
  workspaceActive: boolean;
  closeSidebarPanel: () => void;
  deactivateWorkspacePanel: () => void;
  closeWorkspace: () => void;
  workspaceTreeRefreshKey: number;
  workspaceTreeCollapseKey: number;
  refreshWorkspaceTree: () => void;
  collapseWorkspaceTree: () => void;
  toggleTerminal: () => void;
  toggleAiPanel: () => void;
  toggleSidebar: () => void;
  toggleExplorerView: () => void;
  toggleWorkspaceView: () => void;
  toggleActivity: (id: ActivityId) => void;
  dirtyFiles: readonly string[];
  setFileDirty: (relativePath: string, dirty: boolean) => void;
  renameWorkspaceFileEntry: (relativePath: string, newFileName: string) => Promise<void>;
  deleteWorkspaceFileEntry: (relativePath: string) => Promise<void>;
  workspaceActiveFolderPath: string;
  setWorkspaceActiveFolderPath: (path: string) => void;
  focusWorkspaceFolderPath: (path: string) => void;
  workspaceFolderRevealKey: number;
}

const WorkspaceTabsContext = createContext<WorkspaceTabsContextValue | null>(null);

export function WorkspaceTabsProvider({ children }: { children: ReactNode }) {
  const base = useWorkspaceBasePath();
  const navigate = useNavigate();
  const [tabs, setTabs] = useState<WorkspaceTab[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [workspaceFolder, setWorkspaceFolder] = useState<PickedWorkspaceFolder | null>(null);
  const [sidebarView, setSidebarView] = useState<SidebarView>('explorer');
  const [showTerminal, setShowTerminal] = useState(true);
  const [showAiPanel, setShowAiPanel] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [explorerActive, setExplorerActive] = useState(true);
  const [workspaceActive, setWorkspaceActive] = useState(false);
  const [dirtyFiles, setDirtyFiles] = useState<readonly string[]>([]);
  const [workspaceTreeRefreshKey, setWorkspaceTreeRefreshKey] = useState(0);
  const [workspaceTreeCollapseKey, setWorkspaceTreeCollapseKey] = useState(0);
  const [workspaceActiveFolderPath, setWorkspaceActiveFolderPath] = useState('');
  const [workspaceFolderRevealKey, setWorkspaceFolderRevealKey] = useState(0);

  const setFileDirty = useCallback((relativePath: string, dirty: boolean) => {
    const normalized = normalizeRelativePath(relativePath);
    setDirtyFiles((prev) => {
      const has = prev.includes(normalized);
      if (dirty === has) return prev;
      if (dirty) return [...prev, normalized];
      return prev.filter((path) => path !== normalized);
    });
  }, []);

  const getActivityState = useCallback(() => {
    const explorer =
      showSidebar && sidebarView === 'explorer' && explorerActive;
    const workspace =
      showSidebar && sidebarView === 'workspace' && workspaceActive;
    return {
      explorer,
      workspace,
      ontory: showAiPanel,
      terminal: showTerminal,
    };
  }, [showSidebar, sidebarView, explorerActive, workspaceActive, showAiPanel, showTerminal]);

  const shouldKeepSidebarOpen = useCallback(
    (state: ReturnType<typeof getActivityState>, excluding: ActivityId) => {
      if (excluding !== 'workspace' && state.workspace) return true;
      if (tabs.length > 1) return true;
      if (state.ontory || state.terminal) return true;
      return false;
    },
    [tabs.length],
  );

  const navigateToTab = useCallback(
    (path: string) => {
      if (isWorkspaceFilePath(path)) return;
      navigate(path ? `${base}/${path}` : base);
    },
    [base, navigate],
  );

  const openTab = useCallback(
    (path: string, label?: string) => {
      const normalized = path.replace(/^\//, '');
      const title = label ?? (normalized ? resolveNavTitle(normalized) : 'Welcome');
      const id = normalized || 'welcome';
      setTabs((prev) => {
        if (prev.some((t) => t.path === normalized)) return prev;
        return [...prev, { id, path: normalized, label: title, kind: 'route' }];
      });
      setActivePath(normalized);
      navigateToTab(normalized);
    },
    [navigateToTab],
  );

  const openWorkspaceFile = useCallback(
    (relativePath: string, name: string, handle: FileSystemFileHandle) => {
      const path = toWorkspaceFilePath(relativePath);
      const id = `ws-file-${relativePath.replace(/[/\\]+/g, '--')}`;
      setTabs((prev) => {
        const existing = prev.find((t) => t.path === path);
        if (existing) {
          return prev.map((t) =>
            t.path === path ? { ...t, label: name, fileHandle: handle, kind: 'file' as const } : t,
          );
        }
        return [...prev, { id, path, label: name, kind: 'file', fileHandle: handle }];
      });
      setActivePath(path);
    },
    [],
  );

  const closeTab = useCallback(
    (id: string) => {
      const closing = tabs.find((t) => t.id === id);
      if (closing?.kind === 'file' && isWorkspaceFilePath(closing.path)) {
        setFileDirty(fromWorkspaceFilePath(closing.path), false);
      }

      setTabs((prev) => {
        const idx = prev.findIndex((t) => t.id === id);
        if (idx < 0) return prev;
        const next = prev.filter((t) => t.id !== id);
        if (activePath === prev[idx].path) {
          const fallback = next[idx - 1] ?? next[0];
          if (fallback) {
            setActivePath(fallback.path);
            navigateToTab(fallback.path);
          } else {
            setActivePath(null);
            navigateToTab('');
          }
        }
        return next;
      });
    },
    [tabs, activePath, navigateToTab, setFileDirty],
  );

  const activateTab = useCallback(
    (path: string) => {
      setActivePath(path);
      navigateToTab(path);
    },
    [navigateToTab],
  );

  const syncRoute = useCallback(
    (pathSuffix: string) => {
      if (!pathSuffix) {
        setTabs((prev) => {
          if (!showSidebar || prev.some((t) => t.path === '')) return prev;
          return [...prev, { id: 'welcome', path: '', label: 'Welcome', kind: 'route' }];
        });
        setActivePath((prev) => {
          if (isWorkspaceFilePath(prev)) return prev;
          return showSidebar ? '' : null;
        });
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
            kind: 'route',
          },
        ];
      });
      setActivePath((prev) => {
        if (isWorkspaceFilePath(prev)) return prev;
        return pathSuffix;
      });
    },
    [showSidebar],
  );

  const ensureWelcomeTab = useCallback(() => {
    setTabs((prev) => {
      if (prev.length > 0) return prev;
      return [{ id: 'welcome', path: '', label: 'Welcome', kind: 'route' }];
    });
    setActivePath((prev) => (isWorkspaceFilePath(prev) ? prev : ''));
    navigateToTab('');
  }, [navigateToTab]);

  const closeSidebarPanel = useCallback(() => {
    const activeTab =
      tabs.find((t) => t.path === (activePath ?? '')) ?? (tabs.length > 0 ? tabs[tabs.length - 1] : null);

    if (tabs.length > 1 && activeTab) {
      closeTab(activeTab.id);
      return;
    }

    if (tabs.length === 1 && activeTab) {
      setTabs([]);
      setActivePath(null);
      navigate(base);
      setExplorerActive(false);
      setWorkspaceActive(false);
      setShowSidebar(false);
      return;
    }

    setExplorerActive(false);
    setWorkspaceActive(false);
    setShowSidebar(false);
  }, [tabs, activePath, closeTab, base, navigate]);

  const showExplorerView = useCallback(() => {
    setSidebarView('explorer');
    setExplorerActive(true);
    setWorkspaceActive(false);
    setShowSidebar(true);
  }, []);

  const showWorkspaceView = useCallback(() => {
    setSidebarView('workspace');
    setWorkspaceActive(true);
    setExplorerActive(false);
    setShowSidebar(true);
  }, []);

  const selectWorkspaceFolder = useCallback(async () => {
    const picked = await pickWorkspaceFolder();
    if (!picked) return;
    setWorkspaceFolder(picked);
    showWorkspaceView();
  }, [showWorkspaceView]);

  const openFolder = useCallback(async () => {
    await selectWorkspaceFolder();
  }, [selectWorkspaceFolder]);

  const openWorkspace = useCallback(() => {
    showWorkspaceView();
  }, [showWorkspaceView]);

  const deactivateWorkspacePanel = useCallback(() => {
    setWorkspaceActive(false);
    setShowSidebar(true);
    if (explorerActive) {
      setSidebarView('explorer');
    }
  }, [explorerActive]);

  const closeWorkspace = useCallback(() => {
    if (activePath && isWorkspaceFilePath(activePath)) {
      const remaining = tabs.filter((t) => t.kind !== 'file');
      const fallback = remaining[remaining.length - 1];
      if (fallback) {
        setActivePath(fallback.path);
        navigateToTab(fallback.path);
      } else {
        setActivePath(null);
        navigate(base);
      }
    }

    setTabs((prev) => prev.filter((t) => t.kind !== 'file'));
    setDirtyFiles([]);
    setWorkspaceFolder(null);
    setWorkspaceActive(false);
    setWorkspaceActiveFolderPath('');
    setWorkspaceFolderRevealKey(0);
    setWorkspaceTreeRefreshKey(0);
    setWorkspaceTreeCollapseKey(0);
  }, [activePath, tabs, navigateToTab, base, navigate]);

  const refreshWorkspaceTree = useCallback(() => {
    setWorkspaceTreeRefreshKey((key) => key + 1);
  }, []);

  const collapseWorkspaceTree = useCallback(() => {
    setWorkspaceTreeCollapseKey((key) => key + 1);
  }, []);

  const focusWorkspaceFolderPath = useCallback((path: string) => {
    const normalized = path.replace(/\\/g, '/');
    setWorkspaceActiveFolderPath(normalized);
    setWorkspaceFolderRevealKey((key) => key + 1);
    setSidebarView('workspace');
    setWorkspaceActive(true);
    setExplorerActive(false);
    setShowSidebar(true);
  }, []);

  const renameWorkspaceFileEntry = useCallback(
    async (relativePath: string, newFileName: string) => {
      const root = workspaceFolder?.handle;
      if (!root) return;

      const oldTabPath = toWorkspaceFilePath(relativePath);
      const { relativePath: newRelativePath, handle: newHandle } = await renameWorkspaceFile(
        root,
        relativePath,
        newFileName,
      );
      const newTabPath = toWorkspaceFilePath(newRelativePath);
      const newLabel = newRelativePath.split('/').pop() ?? newFileName;

      setDirtyFiles((prev) => {
        const normalizedOld = normalizeRelativePath(relativePath);
        if (!prev.includes(normalizedOld)) return prev;
        const normalizedNew = normalizeRelativePath(newRelativePath);
        return [...prev.filter((path) => path !== normalizedOld), normalizedNew];
      });

      setTabs((prev) =>
        prev.map((tab) =>
          tab.path === oldTabPath
            ? {
                ...tab,
                id: `ws-file-${newRelativePath.replace(/[/\\]+/g, '--')}`,
                path: newTabPath,
                label: newLabel,
                fileHandle: newHandle,
                kind: 'file' as const,
              }
            : tab,
        ),
      );

      if (activePath === oldTabPath) {
        setActivePath(newTabPath);
      }

      refreshWorkspaceTree();
    },
    [workspaceFolder?.handle, activePath, refreshWorkspaceTree],
  );

  const deleteWorkspaceFileEntry = useCallback(
    async (relativePath: string) => {
      const root = workspaceFolder?.handle;
      if (!root) return;

      const tabPath = toWorkspaceFilePath(relativePath);
      const tab = tabs.find((t) => t.path === tabPath);
      if (tab) {
        closeTab(tab.id);
      } else {
        setFileDirty(relativePath, false);
      }

      await deleteWorkspaceFile(root, relativePath);
      refreshWorkspaceTree();
    },
    [workspaceFolder?.handle, tabs, closeTab, setFileDirty, refreshWorkspaceTree],
  );

  const deactivateActivity = useCallback(
    (id: ActivityId) => {
      const state = getActivityState();

      if (id === 'explorer') {
        setExplorerActive(false);
        if (state.workspace) {
          setSidebarView('workspace');
          setWorkspaceActive(true);
          setShowSidebar(true);
          return;
        }
        if (shouldKeepSidebarOpen(state, 'explorer')) {
          if (workspaceFolder) {
            setSidebarView('workspace');
            setWorkspaceActive(true);
          }
          return;
        }
        setShowSidebar(false);
        return;
      }

      if (id === 'workspace') {
        setWorkspaceActive(false);
        if (state.explorer) {
          setSidebarView('explorer');
          setExplorerActive(true);
          setShowSidebar(true);
          return;
        }
        if (shouldKeepSidebarOpen(state, 'workspace')) {
          setSidebarView('explorer');
          setExplorerActive(true);
          return;
        }
        setShowSidebar(false);
        return;
      }

      if (id === 'ontory') {
        setShowAiPanel(false);
        return;
      }

      setShowTerminal(false);
    },
    [getActivityState, shouldKeepSidebarOpen, workspaceFolder],
  );

  const activateActivity = useCallback(
    (id: ActivityId) => {
      if (id === 'explorer') {
        setSidebarView('explorer');
        setExplorerActive(true);
        setWorkspaceActive(false);
        setShowSidebar(true);
        ensureWelcomeTab();
        return;
      }

      if (id === 'workspace') {
        showWorkspaceView();
        return;
      }

      if (id === 'ontory') {
        setShowAiPanel(true);
        return;
      }

      setShowTerminal(true);
    },
    [showWorkspaceView, ensureWelcomeTab],
  );

  const toggleActivity = useCallback(
    (id: ActivityId) => {
      const state = getActivityState();
      const isActive =
        id === 'explorer'
          ? state.explorer
          : id === 'workspace'
            ? state.workspace
            : id === 'ontory'
              ? state.ontory
              : state.terminal;

      if (isActive) {
        deactivateActivity(id);
        return;
      }
      activateActivity(id);
    },
    [getActivityState, deactivateActivity, activateActivity],
  );

  const toggleTerminal = useCallback(() => toggleActivity('terminal'), [toggleActivity]);
  const toggleAiPanel = useCallback(() => toggleActivity('ontory'), [toggleActivity]);
  const toggleSidebar = useCallback(() => setShowSidebar((v) => !v), []);
  const toggleExplorerView = useCallback(() => toggleActivity('explorer'), [toggleActivity]);
  const toggleWorkspaceView = useCallback(() => toggleActivity('workspace'), [toggleActivity]);

  const value = useMemo(
    () => ({
      tabs,
      activePath,
      openTab,
      openWorkspaceFile,
      closeTab,
      activateTab,
      syncRoute,
      workspaceFolder,
      sidebarView,
      openFolder,
      openWorkspace,
      selectWorkspaceFolder,
      showExplorerView,
      showWorkspaceView,
      showTerminal,
      setShowTerminal,
      showAiPanel,
      setShowAiPanel,
      showSidebar,
      setShowSidebar,
      explorerActive,
      workspaceActive,
      closeSidebarPanel,
      deactivateWorkspacePanel,
      closeWorkspace,
      workspaceTreeRefreshKey,
      workspaceTreeCollapseKey,
      refreshWorkspaceTree,
      collapseWorkspaceTree,
      toggleTerminal,
      toggleAiPanel,
      toggleSidebar,
      toggleExplorerView,
      toggleWorkspaceView,
      toggleActivity,
      dirtyFiles,
      setFileDirty,
      renameWorkspaceFileEntry,
      deleteWorkspaceFileEntry,
      workspaceActiveFolderPath,
      setWorkspaceActiveFolderPath,
      focusWorkspaceFolderPath,
      workspaceFolderRevealKey,
    }),
    [
      tabs,
      activePath,
      openTab,
      openWorkspaceFile,
      closeTab,
      activateTab,
      syncRoute,
      workspaceFolder,
      sidebarView,
      openFolder,
      openWorkspace,
      selectWorkspaceFolder,
      showExplorerView,
      showWorkspaceView,
      showTerminal,
      showAiPanel,
      showSidebar,
      explorerActive,
      workspaceActive,
      closeSidebarPanel,
      deactivateWorkspacePanel,
      closeWorkspace,
      workspaceTreeRefreshKey,
      workspaceTreeCollapseKey,
      refreshWorkspaceTree,
      collapseWorkspaceTree,
      toggleTerminal,
      toggleAiPanel,
      toggleSidebar,
      toggleExplorerView,
      toggleWorkspaceView,
      toggleActivity,
      dirtyFiles,
      setFileDirty,
      renameWorkspaceFileEntry,
      deleteWorkspaceFileEntry,
      workspaceActiveFolderPath,
      setWorkspaceActiveFolderPath,
      focusWorkspaceFolderPath,
      workspaceFolderRevealKey,
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
