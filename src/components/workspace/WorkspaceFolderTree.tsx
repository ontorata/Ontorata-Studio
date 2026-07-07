import { useCallback, useEffect, useState } from 'react';
import { folderHasDirtyDescendants, isDirtyFile } from '../../domain/workspace/dirty-file-paths';
import type { FsDirectoryEntry } from '../../domain/workspace/list-directory';
import { listDirectoryEntries } from '../../domain/workspace/list-directory';
import type { PickedWorkspaceFolder } from '../../domain/workspace/pick-folder';
import { resolveFileHandle } from '../../domain/workspace/resolve-file-handle';
import { useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';

import { getFileExtension } from '../../domain/workspace/text-file-types';

function fileIcon(name: string): string {
  const ext = getFileExtension(name);
  const base = name.split(/[/\\]/).pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'ts':
    case 'tsx':
      return '◆';
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return '◇';
    case 'json':
    case 'jsonc':
    case 'geojson':
    case 'topojson':
      return '{ }';
    case 'md':
    case 'mdx':
    case 'markdown':
      return '▸';
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return '#';
    case 'html':
    case 'htm':
      return '<>';
    case 'py':
    case 'pyw':
      return 'py';
    case 'php':
      return 'php';
    case 'java':
    case 'kt':
      return 'Jv';
    case 'go':
      return 'go';
    case 'rs':
      return 'rs';
    case 'sql':
      return 'SQL';
    case 'vue':
      return 'vu';
    case 'yaml':
    case 'yml':
    case 'toml':
      return 'Y';
    case 'xml':
    case 'svg':
      return '<>';
    case 'sh':
    case 'bash':
    case 'zsh':
      return '$';
    case 'dockerfile':
    case 'gitignore':
    case 'htaccess':
      return '⚙';
    default:
      if (base === 'dockerfile' || base === 'makefile') return '⚙';
      return '·';
  }
}

function FsTreeNode({
  entry,
  parentPath,
  onOpenFile,
  workspaceRoot,
  dirtyFiles,
}: {
  entry: FsDirectoryEntry;
  parentPath: string;
  onOpenFile: (relativePath: string, name: string, handle: FileSystemFileHandle) => void;
  workspaceRoot: FileSystemDirectoryHandle | null;
  dirtyFiles: readonly string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<FsDirectoryEntry[] | null>(null);
  const [loading, setLoading] = useState(false);

  const isDir = entry.kind === 'directory';
  const relativePath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
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

  async function onToggle() {
    if (!isDir) return;
    if (!expanded && children === null) {
      await loadChildren();
    }
    setExpanded((v) => !v);
  }

  async function onClick() {
    if (isDir) {
      await onToggle();
      return;
    }
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

  return (
    <div className="ws-fs-node">
      <button
        type="button"
        className={`ws-tree-row ws-fs-row${isDir ? '' : ' ws-fs-file'}`}
        onClick={onClick}
        aria-expanded={isDir ? expanded : undefined}
      >
        <span className="ws-tree-chevron">
          {isDir ? (loading ? '…' : expanded ? '▼' : '▶') : ' '}
        </span>
        <span className="ws-tree-icon">{isDir ? '📁' : fileIcon(entry.name)}</span>
        <span className="ws-tree-label">{entry.name}</span>
        {fileDirty && (
          <span className="ws-tree-status ws-tree-status-modified" title="Modified">
            M
          </span>
        )}
        {folderDirty && (
          <span className="ws-tree-status ws-tree-status-folder" title="Contains modified files">
            ●
          </span>
        )}
      </button>
      {isDir && expanded && children && (
        <div className="ws-fs-children">
          {children.map((child) => (
            <FsTreeNode
              key={child.name}
              entry={child}
              parentPath={relativePath}
              onOpenFile={onOpenFile}
              workspaceRoot={workspaceRoot}
              dirtyFiles={dirtyFiles}
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
}: {
  folder: PickedWorkspaceFolder;
  onOpenFile: (relativePath: string, name: string, handle: FileSystemFileHandle) => void;
  dirtyFiles: readonly string[];
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
  }, [folder.handle]);

  function onToggle() {
    setExpanded((v) => !v);
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
      <button
        type="button"
        className="ws-tree-row ws-tree-folder-row"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="ws-tree-chevron">{loading ? '…' : expanded ? '▼' : '▶'}</span>
        <span className="ws-tree-icon">📁</span>
        <span className="ws-tree-label">{folder.name}</span>
        {rootDirty && (
          <span className="ws-tree-status ws-tree-status-folder" title="Contains modified files">
            ●
          </span>
        )}
      </button>
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function WorkspaceFolderTree() {
  const { workspaceFolder, openWorkspace, closeSidebarPanel, openWorkspaceFile, dirtyFiles } =
    useWorkspaceTabs();

  return (
    <div className="ws-explorer ws-workspace-panel">
      <div className="ws-explorer-header ws-panel-header">
        <span>WORKSPACE</span>
        <button
          type="button"
          className="ws-panel-close"
          aria-label="Close workspace"
          onClick={() => closeSidebarPanel()}
        >
          ×
        </button>
      </div>

      {workspaceFolder ? (
        <div className="ws-tree-root">
          <WorkspaceRoot folder={workspaceFolder} onOpenFile={openWorkspaceFile} dirtyFiles={dirtyFiles} />
        </div>
      ) : (
        <div className="ws-workspace-empty">
          <p>No folder open.</p>
          <button type="button" className="ws-workspace-open-btn" onClick={() => void openWorkspace()}>
            Open Folder…
          </button>
        </div>
      )}
    </div>
  );
}
