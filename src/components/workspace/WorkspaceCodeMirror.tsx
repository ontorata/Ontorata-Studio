import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { useEffect, useRef } from 'react';
import { createStudioEditorExtensions } from './code-editor/studio-editor-extensions';

interface WorkspaceCodeMirrorProps {
  value: string;
  fileName: string;
  filePath: string;
  onChange?: (value: string) => void;
  onSave?: () => void | Promise<void>;
}

export function WorkspaceCodeMirror({
  value,
  fileName,
  filePath,
  onChange,
  onSave,
}: WorkspaceCodeMirrorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const extensions = [
      ...createStudioEditorExtensions(fileName, () => onSaveRef.current?.()),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current?.(update.state.doc.toString());
        }
      }),
    ];

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({ state, parent: host });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [filePath, fileName]);

  return <div className="ws-code-editor" ref={hostRef} />;
}
