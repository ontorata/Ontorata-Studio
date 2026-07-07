import { EditorView } from '@codemirror/view';

/** Light theme aligned with Studio workspace shell. */
export const studioEditorTheme = EditorView.theme(
  {
    '&': {
      height: '100%',
      backgroundColor: '#ffffff',
      color: '#111827',
      fontSize: '14px',
    },
    '.cm-scroller': {
      fontFamily: "var(--font-mono, 'Cascadia Mono', 'Cascadia Code', Consolas, 'Courier New', ui-monospace, monospace)",
      lineHeight: '1.5',
      fontVariantLigatures: 'none',
    },
    '.cm-gutters': {
      fontFamily: "var(--font-mono, 'Cascadia Mono', 'Cascadia Code', Consolas, 'Courier New', ui-monospace, monospace)",
      backgroundColor: '#f3f6f5',
      color: '#8a9690',
      borderRight: '1px solid #d1dbd6',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#e8eeeb',
      color: '#0f9d63',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(22, 196, 127, 0.06)',
    },
    '.cm-cursor': {
      borderLeftColor: '#0f9d63',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: 'rgba(22, 196, 127, 0.22) !important',
    },
    '.cm-foldGutter span': {
      color: '#5f6b66',
    },
  },
  { dark: false },
);
