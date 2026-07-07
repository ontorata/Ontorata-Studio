import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createFileInDirectory,
  createFolderInDirectory,
  generateUniqueFileName,
  generateUniqueFolderName,
} from '../../domain/workspace/create-workspace-entry';
import { writeFileHandleText } from '../../domain/workspace/read-file';
import { folderHasDirtyDescendants, isDirtyFile } from '../../domain/workspace/dirty-file-paths';
import type { FsDirectoryEntry } from '../../domain/workspace/list-directory';
import { listDirectoryEntries } from '../../domain/workspace/list-directory';
import {
  deleteWorkspaceFolder,
  renameWorkspaceFolder,
  resolveDirectoryHandle,
} from '../../domain/workspace/mutate-workspace-entry';
import type { PickedWorkspaceFolder } from '../../domain/workspace/pick-folder';
import { ensureReadWritePermission } from '../../domain/workspace/file-system-permission';
import { resolveFileHandle } from '../../domain/workspace/resolve-file-handle';
import { useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';
import { WorkspaceFileRow } from './WorkspaceFileRow';
import { WorkspaceFolderRow } from './WorkspaceFolderRow';
import {
  WorkspaceIconCollapseAll,
  WorkspaceIconNewFile,
  WorkspaceIconNewFolder,
  WorkspaceIconRefresh,
} from './WorkspacePanelIcons';

function collectFolderAncestors(relativePath: string): string[] {
  const ancestors: string[] = [];
  let current = relativePath.replace(/\\/g, '/').trim();
  while (current.includes('/')) {
    current = current.slice(0, current.lastIndexOf('/'));
    ancestors.push(current);
  }
  return ancestors;
}

function buildExpandFolderPaths(
  activeFolderPath: string,
  pendingNewFilePath: string | null,
  pendingNewFolderPath: string | null,
): ReadonlySet<string> {
  const paths = new Set<string>();
  if (activeFolderPath) {
    paths.add(activeFolderPath);
    for (const ancestor of collectFolderAncestors(activeFolderPath)) {
      paths.add(ancestor);
    }
  }

  for (const pendingPath of [pendingNewFilePath, pendingNewFolderPath]) {
    if (!pendingPath) continue;
    const parentPath = pendingPath.includes('/')
      ? pendingPath.slice(0, pendingPath.lastIndexOf('/'))
      : '';
    if (!parentPath) continue;
    paths.add(parentPath);
    for (const ancestor of collectFolderAncestors(parentPath)) {
      paths.add(ancestor);
    }
  }

  return paths;
}

function remapActiveFolderPath(
  activeFolderPath: string,
  oldRelativePath: string,
  newRelativePath: string,
): string {
  if (activeFolderPath === oldRelativePath) return newRelativePath;
  if (activeFolderPath.startsWith(`${oldRelativePath}/`)) {
    return `${newRelativePath}${activeFolderPath.slice(oldRelativePath.length)}`;
  }
  return activeFolderPath;
}

function FsTreeNode({
  entry,
  parentPath,
  onOpenFile,
  workspaceRoot,
  dirtyFiles,
  collapseKey,
  refreshKey,
  onRenameFile,
  onDeleteFile,
  pendingNewFilePath,
  onNewFileReady,
  onNewFileCancel,
  activeFolderPath,
  onSelectFolder,
  expandFolderPaths,
  collapsedFolderPaths,
  onMarkFolderCollapsed,
  onMarkFolderExpanded,
  pendingNewFolderPath,
  onRenameFolder,
  onNewFolderReady,
  onNewFolderCancel,
}: {
  entry: FsDirectoryEntry;
  parentPath: string;
  onOpenFile: (relativePath: string, name: string, handle: FileSystemFileHandle) => void;
  workspaceRoot: FileSystemDirectoryHandle | null;
  dirtyFiles: readonly string[];
  collapseKey: number;
  refreshKey: number;
  onRenameFile: (relativePath: string, newFileName: string) => Promise<void>;
  onDeleteFile: (relativePath: string) => Promise<void>;
  pendingNewFilePath: string | null;
  onNewFileReady: (relativePath: string) => Promise<void>;
  onNewFileCancel: (relativePath: string) => Promise<void>;
  activeFolderPath: string;
  onSelectFolder: (relativePath: string) => void;
  expandFolderPaths: ReadonlySet<string>;
  collapsedFolderPaths: ReadonlySet<string>;
  onMarkFolderCollapsed: (relativePath: string) => void;
  onMarkFolderExpanded: (relativePath: string) => void;
  pendingNewFolderPath: string | null;
  onRenameFolder: (relativePath: string, newFolderName: string) => Promise<void>;
  onNewFolderReady: (relativePath: string) => Promise<void>;
  onNewFolderCancel: (relativePath: string) => Promise<void>;
}) {
  const isDir = entry.kind === 'directory';
  const relativePath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
  const wantsAutoExpand =
    expandFolderPaths.has(relativePath) && !collapsedFolderPaths.has(relativePath);
  const [expanded, setExpanded] = useState(wantsAutoExpand);
  const [children, setChildren] = useState<FsDirectoryEntry[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fileDirty = !isDir && isDirtyFile(relativePath, dirtyFiles);
  const folderDirty = isDir && folderHasDirtyDescendants(relativePath, dirtyFiles);

  const loadChildren = useCallback(async () => {
    if (!isDir || entry.handle.kind !== 'directory') return;
    setLoading(true);
    try {
      const next = await listDirectoryEntries(entry.handle);
      setChildren(next);
    } finally {
      setLoading(false);
    }
  }, [entry.handle, isDir]);

  useEffect(() => {
    if (collapseKey === 0) return;
    setExpanded(false);
    onMarkFolderCollapsed(relativePath);
  }, [collapseKey, relativePath, onMarkFolderCollapsed]);

  useEffect(() => {
    if (!wantsAutoExpand) return;
    void loadChildren().then(() => setExpanded(true));
  }, [wantsAutoExpand, loadChildren]);

  useEffect(() => {
    if (refreshKey === 0 || !isDir || children === null) return;
    void loadChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to refreshKey
  }, [refreshKey]);

  async function onToggle() {
    if (expanded) {
      onMarkFolderCollapsed(relativePath);
      setExpanded(false);
      return;
    }
    onMarkFolderExpanded(relativePath);
    if (children === null) {
      await loadChildren();
    }
    setExpanded(true);
  }

  async function onSelectFolderClick() {
    onSelectFolder(relativePath);
    if (!expanded) {
      onMarkFolderExpanded(relativePath);
      if (children === null) {
        await loadChildren();
      }
      setExpanded(true);
    }
  }

  async function onOpenFileClick() {
    if (entry.handle.kind !== 'file') return;

    try {
      const handle =
        workspaceRoot !== null
          ? await resolveFileHandle(workspaceRoot, relativePath)
          : entry.handle;
      onOpenFile(relativePath, entry.name, handle);
    } catch {
      // Permission denied or folder no longer accessible — skip opening.
    }
  }

  if (!isDir) {
    const isPendingNewFile = pendingNewFilePath === relativePath;
    return (
      <WorkspaceFileRow
        relativePath={relativePath}
        fileName={entry.name}
        isDirty={fileDirty}
        onOpen={() => void onOpenFileClick()}
        onRename={onRenameFile}
        onDelete={onDeleteFile}
        autoRename={isPendingNewFile}
        renameIntent={isPendingNewFile ? 'new-file' : 'normal'}
        onNewFileReady={onNewFileReady}
        onNewFileCancel={() => onNewFileCancel(relativePath)}
      />
    );
  }

  const isPendingNewFolder = pendingNewFolderPath === relativePath;

  return (
    <div className="ws-fs-node">
      <WorkspaceFolderRow
        relativePath={relativePath}
        folderName={entry.name}
        expanded={expanded}
        loading={loading}
        isActive={activeFolderPath === relativePath}
        isDirty={folderDirty}
        autoRename={isPendingNewFolder}
        renameIntent={isPendingNewFolder ? 'new-folder' : 'normal'}
        onSelect={() => void onSelectFolderClick()}
        onToggle={() => void onToggle()}
        onRename={onRenameFolder}
        onNewFolderReady={onNewFolderReady}
        onNewFolderCancel={() => onNewFolderCancel(relativePath)}
      />
      {expanded && children && (
        <div className="ws-fs-children">
          {children.map((child) => (
            <FsTreeNode
              key={child.name}
              entry={child}
              parentPath={relativePath}
              onOpenFile={onOpenFile}
              workspaceRoot={workspaceRoot}
              dirtyFiles={dirtyFiles}
              collapseKey={collapseKey}
              refreshKey={refreshKey}
              onRenameFile={onRenameFile}
              onDeleteFile={onDeleteFile}
              pendingNewFilePath={pendingNewFilePath}
              onNewFileReady={onNewFileReady}
              onNewFileCancel={onNewFileCancel}
              activeFolderPath={activeFolderPath}
              onSelectFolder={onSelectFolder}
              expandFolderPaths={expandFolderPaths}
              collapsedFolderPaths={collapsedFolderPaths}
              onMarkFolderCollapsed={onMarkFolderCollapsed}
              onMarkFolderExpanded={onMarkFolderExpanded}
              pendingNewFolderPath={pendingNewFolderPath}
              onRenameFolder={onRenameFolder}
              onNewFolderReady={onNewFolderReady}
              onNewFolderCancel={onNewFolderCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WorkspaceRoot({
  folder,
  onOpenFile,
  dirtyFiles,
  refreshKey,
  collapseKey,
  onRenameFile,
  onDeleteFile,
  pendingNewFilePath,
  onNewFileReady,
  onNewFileCancel,
  activeFolderPath,
  onSelectFolder,
  expandFolderPaths,
  collapsedFolderPaths,
  onMarkFolderCollapsed,
  onMarkFolderExpanded,
  pendingNewFolderPath,
  onRenameFolder,
  onNewFolderReady,
  onNewFolderCancel,
}: {
  folder: PickedWorkspaceFolder;
  onOpenFile: (relativePath: string, name: string, handle: FileSystemFileHandle) => void;
  dirtyFiles: readonly string[];
  refreshKey: number;
  collapseKey: number;
  onRenameFile: (relativePath: string, newFileName: string) => Promise<void>;
  onDeleteFile: (relativePath: string) => Promise<void>;
  pendingNewFilePath: string | null;
  onNewFileReady: (relativePath: string) => Promise<void>;
  onNewFileCancel: (relativePath: string) => Promise<void>;
  activeFolderPath: string;
  onSelectFolder: (relativePath: string) => void;
  expandFolderPaths: ReadonlySet<string>;
  collapsedFolderPaths: ReadonlySet<string>;
  onMarkFolderCollapsed: (relativePath: string) => void;
  onMarkFolderExpanded: (relativePath: string) => void;
  pendingNewFolderPath: string | null;
  onRenameFolder: (relativePath: string, newFolderName: string) => Promise<void>;
  onNewFolderReady: (relativePath: string) => Promise<void>;
  onNewFolderCancel: (relativePath: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(true);
  const [children, setChildren] = useState<FsDirectoryEntry[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!folder.handle) return;
    let cancelled = false;
    setLoading(true);
    void listDirectoryEntries(folder.handle).then((next) => {
      if (!cancelled) setChildren(next);
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [folder.handle, refreshKey]);

  const rootWantsAutoExpand =
    (expandFolderPaths.size > 0 || activeFolderPath !== '') &&
    !collapsedFolderPaths.has('');

  useEffect(() => {
    if (collapseKey === 0) return;
    setExpanded(false);
    onMarkFolderCollapsed('');
  }, [collapseKey, onMarkFolderCollapsed]);

  useEffect(() => {
    if (!rootWantsAutoExpand) return;
    setExpanded(true);
  }, [rootWantsAutoExpand]);

  function onToggle() {
    if (expanded) {
      onMarkFolderCollapsed('');
      setExpanded(false);
      return;
    }
    onMarkFolderExpanded('');
    if (children === null && folder.handle) {
      setLoading(true);
      void listDirectoryEntries(folder.handle).then((next) => {
        setChildren(next);
        setLoading(false);
      });
    }
    setExpanded(true);
  }

  function onSelectRoot() {
    onSelectFolder('');
    if (!expanded) {
      onMarkFolderExpanded('');
      setExpanded(true);
    }
  }

  if (!folder.handle) {
    return (
      <div className="ws-workspace-fallback">
        <button type="button" className="ws-tree-row ws-tree-folder-row">
          <span className="ws-tree-chevron">▼</span>
          <span className="ws-tree-icon">📁</span>
          <span className="ws-tree-label">{folder.name}</span>
        </button>
        <p className="ws-workspace-hint">
          Full folder tree requires a Chromium browser with folder picker support.
        </p>
      </div>
    );
  }

  const rootDirty = folderHasDirtyDescendants('', dirtyFiles);

  return (
    <div className="ws-fs-root">
      <div className={`ws-fs-folder-node${activeFolderPath === '' ? ' ws-fs-folder-node-active' : ''}`}>
        <div
          className={`ws-tree-row ws-tree-folder-row ws-fs-folder${activeFolderPath === '' ? ' ws-fs-folder-active' : ''}`}
        >
          <button
            type="button"
            className="ws-fs-chevron-btn"
            aria-label={expanded ? 'Collapse folder' : 'Expand folder'}
            aria-expanded={expanded}
            onClick={onToggle}
          >
            <span className="ws-tree-chevron">{loading ? '…' : expanded ? '▼' : '▶'}</span>
          </button>
          <button type="button" className="ws-fs-folder-select" onClick={onSelectRoot}>
            <span className="ws-tree-icon">📁</span>
            <span className="ws-tree-label">{folder.name}</span>
          </button>
          {rootDirty && (
            <span className="ws-tree-status ws-tree-status-folder" title="Contains modified files">
              ●
            </span>
          )}
        </div>
      </div>
      {expanded && children && (
        <div className="ws-fs-children">
          {children.map((entry) => (
            <FsTreeNode
              key={entry.name}
              entry={entry}
              parentPath=""
              onOpenFile={onOpenFile}
              workspaceRoot={folder.handle}
              dirtyFiles={dirtyFiles}
              collapseKey={collapseKey}
              refreshKey={refreshKey}
              onRenameFile={onRenameFile}
              onDeleteFile={onDeleteFile}
              pendingNewFilePath={pendingNewFilePath}
              onNewFileReady={onNewFileReady}
              onNewFileCancel={onNewFileCancel}
              activeFolderPath={activeFolderPath}
              onSelectFolder={onSelectFolder}
              expandFolderPaths={expandFolderPaths}
              collapsedFolderPaths={collapsedFolderPaths}
              onMarkFolderCollapsed={onMarkFolderCollapsed}
              onMarkFolderExpanded={onMarkFolderExpanded}
              pendingNewFolderPath={pendingNewFolderPath}
              onRenameFolder={onRenameFolder}
              onNewFolderReady={onNewFolderReady}
              onNewFolderCancel={onNewFolderCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function WorkspaceFolderTree() {
  const {
    workspaceFolder,
    selectWorkspaceFolder,
    deactivateWorkspacePanel,
    closeWorkspace,
    openWorkspaceFile,
    dirtyFiles,
    workspaceTreeRefreshKey,
    workspaceTreeCollapseKey,
    refreshWorkspaceTree,
    collapseWorkspaceTree,
    renameWorkspaceFileEntry,
    deleteWorkspaceFileEntry,
    workspaceActiveFolderPath,
    setWorkspaceActiveFolderPath,
    workspaceFolderRevealKey,
  } = useWorkspaceTabs();

  const [pendingNewFilePath, setPendingNewFilePath] = useState<string | null>(null);
  const [pendingNewFolderPath, setPendingNewFolderPath] = useState<string | null>(null);
  const activeFolderPath = workspaceActiveFolderPath;
  const setActiveFolderPath = setWorkspaceActiveFolderPath;
  const [collapsedFolderPaths, setCollapsedFolderPaths] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const hasWorkspace = Boolean(workspaceFolder?.handle);

  const expandFolderPaths = useMemo(
    () => buildExpandFolderPaths(activeFolderPath, pendingNewFilePath, pendingNewFolderPath),
    [activeFolderPath, pendingNewFilePath, pendingNewFolderPath],
  );

  const markFolderCollapsed = useCallback((relativePath: string) => {
    setCollapsedFolderPaths((prev) => new Set(prev).add(relativePath));
  }, []);

  const markFolderExpanded = useCallback((relativePath: string) => {
    setCollapsedFolderPaths((prev) => {
      const next = new Set(prev);
      next.delete(relativePath);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!pendingNewFilePath && !pendingNewFolderPath) return;
    setCollapsedFolderPaths((prev) => {
      const next = new Set(prev);
      for (const path of expandFolderPaths) {
        next.delete(path);
      }
      next.delete('');
      return next;
    });
  }, [pendingNewFilePath, pendingNewFolderPath, expandFolderPaths]);

  useEffect(() => {
    if (!workspaceFolderRevealKey) return;
    setCollapsedFolderPaths((prev) => {
      const next = new Set(prev);
      next.delete('');
      const parts = activeFolderPath.split('/').filter(Boolean);
      let cumulative = '';
      for (const part of parts) {
        cumulative = cumulative ? `${cumulative}/${part}` : part;
        next.delete(cumulative);
      }
      return next;
    });
  }, [workspaceFolderRevealKey, activeFolderPath]);

  useEffect(() => {
    if (!workspaceFolder?.handle) {
      setPendingNewFilePath(null);
      setPendingNewFolderPath(null);
      setActiveFolderPath('');
      setCollapsedFolderPaths(new Set());
    }
  }, [workspaceFolder?.handle, setActiveFolderPath]);

  const resolveActiveDirectory = useCallback(async (): Promise<FileSystemDirectoryHandle | null> => {
    const root = workspaceFolder?.handle;
    if (!root) return null;
    try {
      return await resolveDirectoryHandle(root, activeFolderPath);
    } catch {
      return null;
    }
  }, [workspaceFolder?.handle, activeFolderPath]);

  async function handleOpenNewFile(relativePath: string) {
    const root = workspaceFolder?.handle;
    if (!root) return;
    setPendingNewFilePath(null);
    try {
      const handle = await resolveFileHandle(root, relativePath);
      await ensureReadWritePermission(handle);
      const name = relativePath.split('/').pop() ?? relativePath;
      openWorkspaceFile(relativePath, name, handle);
    } catch {
      // Permission denied or file no longer accessible.
    }
  }

  async function handleCancelNewFile(relativePath: string) {
    setPendingNewFilePath(null);
    await deleteWorkspaceFileEntry(relativePath);
  }

  async function handleNewFile() {
    const targetDir = await resolveActiveDirectory();
    if (!targetDir) return;
    try {
      const name = await generateUniqueFileName(targetDir);
      const handle = await createFileInDirectory(targetDir, name);
      await writeFileHandleText(handle, '');
      const relativePath = activeFolderPath ? `${activeFolderPath}/${name}` : name;
      setPendingNewFilePath(relativePath);
      refreshWorkspaceTree();
    } catch {
      // Create failed — permission denied or invalid name.
    }
  }

  async function handleRenameFolder(relativePath: string, newFolderName: string) {
    const root = workspaceFolder?.handle;
    if (!root) {
      throw new Error('Workspace is not available.');
    }

    const newRelativePath = await renameWorkspaceFolder(root, relativePath, newFolderName);
    setActiveFolderPath(remapActiveFolderPath(activeFolderPath, relativePath, newRelativePath));

    if (pendingNewFolderPath !== relativePath) {
      refreshWorkspaceTree();
    }
  }

  async function handleNewFolderReady(relativePath: string) {
    setPendingNewFolderPath(null);
    setActiveFolderPath(relativePath);
    refreshWorkspaceTree();
  }

  async function handleCancelNewFolder(relativePath: string) {
    const root = workspaceFolder?.handle;
    if (!root) return;
    setPendingNewFolderPath(null);
    try {
      await deleteWorkspaceFolder(root, relativePath);
      if (activeFolderPath === relativePath || activeFolderPath.startsWith(`${relativePath}/`)) {
        const parentPath = relativePath.includes('/')
          ? relativePath.slice(0, relativePath.lastIndexOf('/'))
          : '';
        setActiveFolderPath(parentPath);
      }
      refreshWorkspaceTree();
    } catch {
      // Delete failed — permission denied.
    }
  }

  async function handleNewFolder() {
    const targetDir = await resolveActiveDirectory();
    if (!targetDir) return;
    try {
      const name = await generateUniqueFolderName(targetDir);
      await createFolderInDirectory(targetDir, name);
      const relativePath = activeFolderPath ? `${activeFolderPath}/${name}` : name;
      setPendingNewFolderPath(relativePath);
      refreshWorkspaceTree();
    } catch {
      // Create failed — permission denied or invalid name.
    }
  }

  return (
    <div className="ws-explorer ws-workspace-panel">
      <div className="ws-explorer-header ws-panel-header ws-workspace-panel-header">
        <span>WORKSPACE</span>
        <div className="ws-workspace-header-actions">
          <button
            type="button"
            className="ws-workspace-action"
            aria-label="New File"
            title="New File"
            disabled={!hasWorkspace}
            onClick={() => void handleNewFile()}
          >
            <WorkspaceIconNewFile />
          </button>
          <button
            type="button"
            className="ws-workspace-action"
            aria-label="New Folder"
            title="New Folder"
            disabled={!hasWorkspace}
            onClick={() => void handleNewFolder()}
          >
            <WorkspaceIconNewFolder />
          </button>
          <button
            type="button"
            className="ws-workspace-action"
            aria-label="Refresh Explorer"
            title="Refresh Explorer"
            disabled={!hasWorkspace}
            onClick={refreshWorkspaceTree}
          >
            <WorkspaceIconRefresh />
          </button>
          <button
            type="button"
            className="ws-workspace-action"
            aria-label="Collapse Folders in Explorer"
            title="Collapse Folders in Explorer"
            disabled={!hasWorkspace}
            onClick={collapseWorkspaceTree}
          >
            <WorkspaceIconCollapseAll />
          </button>
          <button
            type="button"
            className="ws-panel-close"
            aria-label="Deactivate workspace"
            title="Deactivate workspace"
            onClick={deactivateWorkspacePanel}
          >
            ×
          </button>
        </div>
      </div>

      <div className="ws-workspace-menu">
        <button
          type="button"
          className="ws-workspace-menu-item"
          onClick={() => void selectWorkspaceFolder()}
        >
          Select Folder…
        </button>
        <button
          type="button"
          className="ws-workspace-menu-item"
          disabled={!hasWorkspace}
          onClick={closeWorkspace}
        >
          Close Workspace
        </button>
      </div>

      {workspaceFolder ? (
        <div className="ws-tree-root">
          <WorkspaceRoot
            folder={workspaceFolder}
            onOpenFile={openWorkspaceFile}
            dirtyFiles={dirtyFiles}
            refreshKey={workspaceTreeRefreshKey}
            collapseKey={workspaceTreeCollapseKey}
            onRenameFile={renameWorkspaceFileEntry}
            onDeleteFile={deleteWorkspaceFileEntry}
            pendingNewFilePath={pendingNewFilePath}
            onNewFileReady={handleOpenNewFile}
            onNewFileCancel={handleCancelNewFile}
            activeFolderPath={activeFolderPath}
            onSelectFolder={setActiveFolderPath}
            expandFolderPaths={expandFolderPaths}
            collapsedFolderPaths={collapsedFolderPaths}
            onMarkFolderCollapsed={markFolderCollapsed}
            onMarkFolderExpanded={markFolderExpanded}
            pendingNewFolderPath={pendingNewFolderPath}
            onRenameFolder={handleRenameFolder}
            onNewFolderReady={handleNewFolderReady}
            onNewFolderCancel={handleCancelNewFolder}
          />
        </div>
      ) : (
        <div className="ws-workspace-empty">
          <p>No folder open.</p>
          <button type="button" className="ws-workspace-open-btn" onClick={() => void selectWorkspaceFolder()}>
            Select Folder…
          </button>
        </div>
      )}
    </div>
  );
}
