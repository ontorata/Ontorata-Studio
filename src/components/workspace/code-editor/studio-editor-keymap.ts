import { findNext, findPrevious, openSearchPanel } from '@codemirror/search';
import { Prec, type Extension } from '@codemirror/state';
import { keymap, type KeyBinding } from '@codemirror/view';
import { vscodeKeymap } from '@replit/codemirror-vscode-keymap';

/** Prevent browser chrome shortcuts while the code editor is focused. */
const browserGuardKeymap: KeyBinding[] = [
  { key: 'Mod-p', preventDefault: true, run: () => true },
  { key: 'Mod-w', preventDefault: true, run: () => true },
  { key: 'Mod-n', preventDefault: true, run: () => true },
  { key: 'Mod-t', preventDefault: true, run: () => true },
  { key: 'Mod-Shift-t', preventDefault: true, run: () => true },
];

/** VS Code bindings missing from @replit/codemirror-vscode-keymap. */
const supplementalKeymap: KeyBinding[] = [
  { key: 'Mod-h', preventDefault: true, run: openSearchPanel },
  { key: 'F3', run: findNext },
  { key: 'Shift-F3', run: findPrevious },
];

export function createSaveKeyBinding(onSave: () => void | Promise<void>): KeyBinding {
  return {
    key: 'Mod-s',
    preventDefault: true,
    run: () => {
      void onSave();
      return true;
    },
  };
}

export function studioEditorKeymapExtension(onSave?: () => void | Promise<void>): Extension {
  const bindings: KeyBinding[] = [
    ...(onSave ? [createSaveKeyBinding(onSave)] : []),
    ...browserGuardKeymap,
    ...supplementalKeymap,
    ...vscodeKeymap,
  ];

  return Prec.highest(keymap.of(bindings));
}
