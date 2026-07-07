import { useCallback, useEffect, useState } from 'react';
import { resolveFileHandle } from '../../domain/workspace/resolve-file-handle';
import { isLikelyTextFile, readFileHandleText, writeFileHandleText } from '../../domain/workspace/read-file';
import { fromWorkspaceFilePath } from '../../domain/workspace/workspace-file-path';
import { useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';
import { WorkspaceCodeMirror } from './WorkspaceCodeMirror';

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

  const relativePath = fromWorkspaceFilePath(filePath);
  const fileName = tab?.label ?? relativePath.split('/').pop() ?? 'File';
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
  }, [tab?.fileHandle, fileName, filePath]);

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
      const handle =
        workspaceFolder?.handle !== null && workspaceFolder?.handle !== undefined
          ? await resolveFileHandle(workspaceFolder.handle, relativePath, { requestWrite: false })
          : tab?.fileHandle;
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

  return (
    <div className="ws-file-editor">
      <div className="ws-file-editor-header">
        <span className="ws-file-editor-path">
          {relativePath}
          {isDirty ? ' •' : ''}
        </span>
        {saveMessage && <span className="ws-file-editor-save-msg">{saveMessage}</span>}
        {saving && <span className="ws-file-editor-save-msg">Saving…</span>}
      </div>
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
  );
}
