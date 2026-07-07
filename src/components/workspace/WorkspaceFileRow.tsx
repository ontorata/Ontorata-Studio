import { useEffect, useRef, useState } from 'react';
import { WorkspaceFileIcon } from './WorkspaceFileIcon';
import { WorkspaceIconRename, WorkspaceIconTrash } from './WorkspacePanelIcons';

export type WorkspaceFileRenameIntent = 'normal' | 'new-file';

interface WorkspaceFileRowProps {
  relativePath: string;
  fileName: string;
  isDirty: boolean;
  onOpen: () => void;
  onRename: (relativePath: string, newFileName: string) => Promise<void>;
  onDelete: (relativePath: string) => Promise<void>;
  autoRename?: boolean;
  renameIntent?: WorkspaceFileRenameIntent;
  onNewFileReady?: (relativePath: string) => void | Promise<void>;
  onNewFileCancel?: () => void | Promise<void>;
}

function buildRenamedPath(relativePath: string, newFileName: string): string {
  const segments = relativePath.replace(/\\/g, '/').split('/');
  segments[segments.length - 1] = newFileName;
  return segments.join('/');
}

export function WorkspaceFileRow({
  relativePath,
  fileName,
  isDirty,
  onOpen,
  onRename,
  onDelete,
  autoRename = false,
  renameIntent = 'normal',
  onNewFileReady,
  onNewFileCancel,
}: WorkspaceFileRowProps) {
  const [renaming, setRenaming] = useState(autoRename);
  const [draftName, setDraftName] = useState(fileName);
  const inputRef = useRef<HTMLInputElement>(null);
  const committingRef = useRef(false);
  const skipBlurCommitRef = useRef(false);

  useEffect(() => {
    setRenaming(autoRename);
  }, [autoRename]);

  useEffect(() => {
    if (!renaming) {
      setDraftName(fileName);
    }
  }, [fileName, renaming]);

  useEffect(() => {
    if (!renaming) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [renaming]);

  async function finishNewFile(finalPath: string) {
    if (renameIntent !== 'new-file') return;
    await onNewFileReady?.(finalPath);
  }

  async function commitRename() {
    if (committingRef.current) return;
    committingRef.current = true;

    const next = draftName.trim();
    try {
      if (!next) {
        if (renameIntent === 'new-file') {
          await onNewFileCancel?.();
        }
        setRenaming(false);
        setDraftName(fileName);
        return;
      }

      if (next === fileName) {
        setRenaming(false);
        await finishNewFile(relativePath);
        return;
      }

      await onRename(relativePath, next);
      setRenaming(false);
      await finishNewFile(buildRenamedPath(relativePath, next));
    } catch {
      setDraftName(fileName);
      setRenaming(false);
    } finally {
      committingRef.current = false;
    }
  }

  async function cancelRename() {
    if (renameIntent === 'new-file') {
      await onNewFileCancel?.();
      return;
    }
    setDraftName(fileName);
    setRenaming(false);
  }

  return (
    <div className="ws-fs-file-node">
      <div className="ws-tree-row ws-fs-row ws-fs-file">
        <button
          type="button"
          className="ws-fs-row-open"
          onClick={renaming ? undefined : onOpen}
          disabled={renaming}
        >
          <span className="ws-tree-chevron"> </span>
          <WorkspaceFileIcon fileName={fileName} className="ws-tree-icon" />
          {renaming ? (
            <input
              ref={inputRef}
              className="ws-fs-rename-input"
              value={draftName}
              aria-label="Rename file"
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
            <span className="ws-tree-label">{fileName}</span>
          )}
        </button>
        {isDirty && (
          <span className="ws-tree-status ws-tree-status-modified" title="Modified">
            M
          </span>
        )}
        {!renaming && renameIntent !== 'new-file' && (
          <div className="ws-fs-row-actions">
            <button
              type="button"
              className="ws-fs-row-action"
              aria-label={`Rename ${fileName}`}
              title="Rename"
              onClick={(event) => {
                event.stopPropagation();
                setRenaming(true);
              }}
            >
              <WorkspaceIconRename />
            </button>
            <button
              type="button"
              className="ws-fs-row-action ws-fs-row-action-danger"
              aria-label={`Delete ${fileName}`}
              title="Delete"
              onClick={(event) => {
                event.stopPropagation();
                void onDelete(relativePath);
              }}
            >
              <WorkspaceIconTrash />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
