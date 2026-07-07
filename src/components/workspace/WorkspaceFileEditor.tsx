import { useCallback, useEffect, useState } from 'react';
import { resolveFileHandle } from '../../domain/workspace/resolve-file-handle';
import { ensureReadWritePermission } from '../../domain/workspace/file-system-permission';
import { isLikelyTextFile, readFileHandleText, writeFileHandleText } from '../../domain/workspace/read-file';
import { fromWorkspaceFilePath } from '../../domain/workspace/workspace-file-path';
import { useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';
import { WorkspaceCodeMirror } from './WorkspaceCodeMirror';
import { WorkspaceFileBreadcrumb } from './WorkspaceFileBreadcrumb';

interface WorkspaceFileEditorProps {
  filePath: string;
}

export function WorkspaceFileEditor({ filePath }: WorkspaceFileEditorProps) {
  const { tabs, workspaceFolder, setFileDirty } = useWorkspaceTabs();
  const tab = tabs.find((t) => t.path === filePath);
  const [content, setContent] = useState<string | null>(null);
  const [savedContent, setSavedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorExpanded, setEditorExpanded] = useState(true);

  const relativePath = fromWorkspaceFilePath(filePath);
  const fileName = tab?.label ?? relativePath.split('/').pop() ?? 'File';
  const workspaceName = workspaceFolder?.name ?? 'Workspace';
  const isDirty = content !== null && savedContent !== null && content !== savedContent;

  useEffect(() => {
    setFileDirty(relativePath, isDirty);
  }, [relativePath, isDirty, setFileDirty]);

  useEffect(() => {
    const handle = tab?.fileHandle;
    if (!handle) {
      setLoading(false);
      setError('File handle is no longer available.');
      return;
    }

    if (!isLikelyTextFile(fileName)) {
      setLoading(false);
      setContent(null);
      setSavedContent(null);
      setError('Preview is not available for this file type.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setSaveMessage(null);

    void readFileHandleText(handle)
      .then((text) => {
        if (cancelled) return;
        setContent(text);
        setSavedContent(text);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to read file.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab?.fileHandle, fileName]);

  const handleSave = useCallback(async () => {
    if (content === null || saving) return;
    if (savedContent !== null && content === savedContent) {
      setSaveMessage('No changes to save.');
      return;
    }

    setSaving(true);
    setSaveMessage(null);
    setError(null);

    try {
      let handle = tab?.fileHandle;
      if (!handle) {
        if (!workspaceFolder?.handle) {
          throw new Error('File handle is no longer available.');
        }
        handle = await resolveFileHandle(workspaceFolder.handle, relativePath);
        await ensureReadWritePermission(handle);
      }
      if (!handle) {
        throw new Error('File handle is no longer available.');
      }

      await writeFileHandleText(handle, content);
      setSavedContent(content);
      setSaveMessage('Saved.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save file.');
    } finally {
      setSaving(false);
    }
  }, [workspaceFolder?.handle, relativePath, tab?.fileHandle, content, savedContent, saving]);

  const toggleEditorExpanded = useCallback(() => {
    setEditorExpanded((expanded) => !expanded);
  }, []);

  return (
    <div className={`ws-file-editor${editorExpanded ? '' : ' ws-file-editor-collapsed'}`}>
      <div className="ws-file-editor-header">
        <WorkspaceFileBreadcrumb workspaceName={workspaceName} relativePath={relativePath} />
        {isDirty && <span className="ws-file-editor-dirty" title="Modified">•</span>}
        {saveMessage && <span className="ws-file-editor-save-msg">{saveMessage}</span>}
        {saving && <span className="ws-file-editor-save-msg">Saving…</span>}
        <button
          type="button"
          className="ws-file-editor-toggle"
          aria-label={editorExpanded ? 'Collapse editor' : 'Expand editor'}
          aria-expanded={editorExpanded}
          title={editorExpanded ? 'Collapse editor' : 'Expand editor'}
          onClick={toggleEditorExpanded}
        >
          {editorExpanded ? '⊟' : '▼'}
        </button>
      </div>
      {editorExpanded && (
        <div className="ws-file-editor-body">
          {loading && <p className="ws-file-editor-status">Loading file…</p>}
          {error && !loading && <p className="ws-file-editor-error">{error}</p>}
          {!loading && !error && content !== null && (
            <WorkspaceCodeMirror
              key={filePath}
              filePath={filePath}
              value={content}
              fileName={fileName}
              onChange={setContent}
              onSave={handleSave}
            />
          )}
        </div>
      )}
    </div>
  );
}
