import { useCallback, useEffect, useState } from 'react';
import type { FsDirectoryEntry } from '../../domain/workspace/list-directory';
import { listDirectoryEntries } from '../../domain/workspace/list-directory';
import type { PickedWorkspaceFolder } from '../../domain/workspace/pick-folder';
import { useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';

function fileIcon(name: string): string {
  const ext = name.includes('.') ? name.split('.').pop()?.toLowerCase() : '';
  switch (ext) {
    case 'ts':
    case 'tsx':
      return '◆';
    case 'js':
    case 'jsx':
      return '◇';
    case 'json':
      return '{ }';
    case 'md':
      return '▸';
    case 'css':
      return '#';
    default:
      return '·';
  }
}

function FsTreeNode({
  entry,
  depth,
}: {
  entry: FsDirectoryEntry;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<FsDirectoryEntry[] | null>(null);
  const [loading, setLoading] = useState(false);

  const isDir = entry.kind === 'directory';
  const pad = 0.4 + depth * 0.85;

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

  return (
    <div className="ws-fs-node">
      <button
        type="button"
        className={`ws-tree-row ws-fs-row${isDir ? '' : ' ws-fs-file'}`}
        style={{ paddingLeft: `${pad}rem` }}
        onClick={() => void onToggle()}
        aria-expanded={isDir ? expanded : undefined}
      >
        <span className="ws-tree-chevron">
          {isDir ? (loading ? '…' : expanded ? '▼' : '▶') : ' '}
        </span>
        <span className="ws-tree-icon">{isDir ? '📁' : fileIcon(entry.name)}</span>
        <span className="ws-tree-label">{entry.name}</span>
      </button>
      {isDir && expanded && children && (
        <div className="ws-fs-children">
          {children.map((child) => (
            <FsTreeNode key={child.name} entry={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function WorkspaceRoot({ folder }: { folder: PickedWorkspaceFolder }) {
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
      </button>
      {expanded && children && (
        <div className="ws-fs-children">
          {children.map((entry) => (
            <FsTreeNode key={entry.name} entry={entry} depth={0} />
          ))}
        </div>
      )}
    </div>
  );
}

export function WorkspaceFolderTree() {
  const { workspaceFolder, openWorkspace, setShowSidebar } = useWorkspaceTabs();

  return (
    <div className="ws-explorer ws-workspace-panel">
      <div className="ws-explorer-header ws-panel-header">
        <span>WORKSPACE</span>
        <button
          type="button"
          className="ws-panel-close"
          aria-label="Close workspace"
          onClick={() => setShowSidebar(false)}
        >
          ×
        </button>
      </div>

      {workspaceFolder ? (
        <>
          <div className="ws-workspace-title">UNTITLED (WORKSPACE)</div>
          <div className="ws-tree-root">
            <WorkspaceRoot folder={workspaceFolder} />
          </div>
        </>
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
