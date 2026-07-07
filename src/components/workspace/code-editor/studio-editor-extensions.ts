import { history } from '@codemirror/commands';
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language';
import { highlightSelectionMatches, search } from '@codemirror/search';
import { type Extension } from '@codemirror/state';
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  lineNumbers,
} from '@codemirror/view';
import { getLanguageExtension } from './get-language-extension';
import { studioEditorKeymapExtension } from './studio-editor-keymap';
import { studioEditorTheme } from './studio-editor-theme';

export function createStudioEditorExtensions(
  fileName: string,
  onSave?: () => void | Promise<void>,
): Extension[] {
  return [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightActiveLine(),
    foldGutter(),
    bracketMatching(),
    indentOnInput(),
    history(),
    search({ top: true }),
    highlightSelectionMatches(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    studioEditorTheme,
    EditorView.lineWrapping,
    EditorView.contentAttributes.of({ 'data-studio-editor': 'true' }),
    studioEditorKeymapExtension(onSave),
    ...getLanguageExtension(fileName),
  ];
}
