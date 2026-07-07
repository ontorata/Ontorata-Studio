import { useEffect, useRef, useState } from 'react';
import { WorkspaceIconRename } from './WorkspacePanelIcons';

export type WorkspaceFolderRenameIntent = 'normal' | 'new-folder';

interface WorkspaceFolderRowProps {
  relativePath: string;
  folderName: string;
  expanded: boolean;
  loading: boolean;
  isActive: boolean;
  isDirty: boolean;
  autoRename?: boolean;
  renameIntent?: WorkspaceFolderRenameIntent;
  onSelect: () => void;
  onToggle: () => void;
  onRename: (relativePath: string, newFolderName: string) => Promise<void>;
  onNewFolderReady?: (relativePath: string) => void | Promise<void>;
  onNewFolderCancel?: () => void | Promise<void>;
}

function buildRenamedPath(relativePath: string, newFolderName: string): string {
  const segments = relativePath.replace(/\\/g, '/').split('/');
  segments[segments.length - 1] = newFolderName;
  return segments.join('/');
}

export function WorkspaceFolderRow({
  relativePath,
  folderName,
  expanded,
  loading,
  isActive,
  isDirty,
  autoRename = false,
  renameIntent = 'normal',
  onSelect,
  onToggle,
  onRename,
  onNewFolderReady,
  onNewFolderCancel,
}: WorkspaceFolderRowProps) {
  const [renaming, setRenaming] = useState(autoRename);
  const [draftName, setDraftName] = useState(folderName);
  const inputRef = useRef<HTMLInputElement>(null);
  const committingRef = useRef(false);
  const skipBlurCommitRef = useRef(false);

  useEffect(() => {
    setRenaming(autoRename);
  }, [autoRename]);

  useEffect(() => {
    if (!renaming) {
      setDraftName(folderName);
    }
  }, [folderName, renaming]);

  useEffect(() => {
    if (!renaming) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [renaming]);

  async function finishNewFolder(finalPath: string) {
    if (renameIntent !== 'new-folder') return;
    await onNewFolderReady?.(finalPath);
  }

  async function commitRename() {
    if (committingRef.current) return;
    committingRef.current = true;

    const next = draftName.trim();
    try {
      if (!next) {
        if (renameIntent === 'new-folder') {
          await onNewFolderCancel?.();
        }
        setRenaming(false);
        setDraftName(folderName);
        return;
      }

      if (next === folderName) {
        setRenaming(false);
        await finishNewFolder(relativePath);
        return;
      }

      await onRename(relativePath, next);
      const finalPath = buildRenamedPath(relativePath, next);
      setRenaming(false);
      await finishNewFolder(finalPath);
    } catch {
      setDraftName(folderName);
      setRenaming(false);
    } finally {
      committingRef.current = false;
    }
  }

  async function cancelRename() {
    if (renameIntent === 'new-folder') {
      await onNewFolderCancel?.();
      return;
    }
    setDraftName(folderName);
    setRenaming(false);
  }

  return (
    <div className={`ws-fs-folder-node${isActive ? ' ws-fs-folder-node-active' : ''}`}>
      <div className={`ws-tree-row ws-fs-row ws-fs-folder${isActive ? ' ws-fs-folder-active' : ''}`}>
        <button
          type="button"
          className="ws-fs-chevron-btn"
          aria-label={expanded ? 'Collapse folder' : 'Expand folder'}
          aria-expanded={expanded}
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
        >
          <span className="ws-tree-chevron">{loading ? '…' : expanded ? '▼' : '▶'}</span>
        </button>
        <button
          type="button"
          className="ws-fs-folder-select"
          onClick={renaming ? undefined : onSelect}
          disabled={renaming}
        >
          <span className="ws-tree-icon">📁</span>
          {renaming ? (
            <input
              ref={inputRef}
              className="ws-fs-rename-input"
              value={draftName}
              aria-label="Rename folder"
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => setDraftName(event.target.value)}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === 'Enter') {
                  event.preventDefault();
                  skipBlurCommitRef.current = true;
                  void commitRename().finally(() => {
                    skipBlurCommitRef.current = false;
                  });
                }
                if (event.key === 'Escape') {
                  event.preventDefault();
                  skipBlurCommitRef.current = true;
                  void cancelRename().finally(() => {
                    skipBlurCommitRef.current = false;
                  });
                }
              }}
              onBlur={() => {
                if (skipBlurCommitRef.current) return;
                void commitRename();
              }}
            />
          ) : (
            <span className="ws-tree-label">{folderName}</span>
          )}
        </button>
        {isDirty && (
          <span className="ws-tree-status ws-tree-status-folder" title="Contains modified files">
            ●
          </span>
        )}
        {!renaming && renameIntent !== 'new-folder' && (
          <div className="ws-fs-row-actions">
            <button
              type="button"
              className="ws-fs-row-action"
              aria-label={`Rename ${folderName}`}
              title="Rename"
              onClick={(event) => {
                event.stopPropagation();
                setRenaming(true);
              }}
            >
              <WorkspaceIconRename />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
