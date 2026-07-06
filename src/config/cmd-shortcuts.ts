/**
 * Windows Command Prompt console keyboard shortcuts.
 * Reference: Windows Console host / conhost selection & navigation.
 */

export type CmdShortcutCategory = 'clipboard' | 'mark' | 'navigation' | 'history' | 'studio';

export interface CmdShortcut {
  keys: string;
  action: string;
  category: CmdShortcutCategory;
}

export const CMD_SHORTCUTS: CmdShortcut[] = [
  { keys: 'Ctrl + C', action: 'Copy the selected text (interrupt when nothing selected)', category: 'clipboard' },
  { keys: 'Ctrl + Insert', action: 'Copy the selected text', category: 'clipboard' },
  { keys: 'Ctrl + V', action: 'Paste text at the cursor', category: 'clipboard' },
  { keys: 'Shift + Insert', action: 'Paste text at the cursor', category: 'clipboard' },
  { keys: 'Ctrl + M', action: 'Enter Mark mode (keyboard selection in output buffer)', category: 'mark' },
  {
    keys: 'Alt + selection key',
    action: 'Begin selection in block mode (rectangular selection)',
    category: 'mark',
  },
  { keys: 'Arrow keys', action: 'Move the cursor in the direction specified (Mark mode)', category: 'mark' },
  { keys: 'Page Up', action: 'Move the cursor by one page up (Mark mode)', category: 'mark' },
  { keys: 'Page Down', action: 'Move the cursor by one page down (Mark mode)', category: 'mark' },
  {
    keys: 'Ctrl + Home',
    action: 'Mark mode: move cursor to beginning of buffer',
    category: 'mark',
  },
  {
    keys: 'Ctrl + End',
    action: 'Mark mode: move cursor to end of buffer',
    category: 'mark',
  },
  {
    keys: 'Ctrl + Up arrow',
    action: 'Move up one line in the output history (scroll buffer)',
    category: 'navigation',
  },
  {
    keys: 'Ctrl + Down arrow',
    action: 'Move down one line in the output history (scroll buffer)',
    category: 'navigation',
  },
  {
    keys: 'Ctrl + Home',
    action: 'History: if command line is empty, scroll viewport to top of buffer; else delete all characters left of cursor',
    category: 'history',
  },
  {
    keys: 'Ctrl + End',
    action: 'History: if command line is empty, scroll viewport to command line; else delete all characters right of cursor',
    category: 'history',
  },
  { keys: 'Up / Down', action: 'Previous / next command in history (command line)', category: 'history' },
  { keys: 'Ctrl + Shift + T', action: 'New Command Prompt tab (Studio)', category: 'studio' },
  { keys: 'Ctrl + Shift + W', action: 'Close terminal tab (Studio)', category: 'studio' },
  { keys: 'Ctrl + Tab', action: 'Next terminal tab (Studio)', category: 'studio' },
  { keys: 'F1', action: 'Show keyboard shortcuts', category: 'studio' },
];

const CATEGORY_LABELS: Record<CmdShortcutCategory, string> = {
  clipboard: 'Clipboard',
  mark: 'Mark mode / selection',
  navigation: 'Output navigation',
  history: 'Command line / history navigation',
  studio: 'Studio terminal tabs',
};

export function formatCmdShortcutsHelp(): string {
  const groups = (
    ['clipboard', 'mark', 'navigation', 'history', 'studio'] as CmdShortcutCategory[]
  ).map((category) => {
    const items = CMD_SHORTCUTS.filter((s) => s.category === category);
    const lines = items.map((s) => `  ${s.keys.padEnd(28)} ${s.action}`);
    return `${CATEGORY_LABELS[category]}:\n${lines.join('\n')}`;
  });

  return [
    'Command Prompt console shortcuts',
    'Reference: Windows Console selection & navigation',
    '',
    ...groups,
  ].join('\n');
}

export function deleteBeforeCursor(value: string, cursor: number): { value: string; cursor: number } {
  return { value: value.slice(cursor), cursor: 0 };
}

export function deleteAfterCursor(value: string, cursor: number): { value: string; cursor: number } {
  return { value: value.slice(0, cursor), cursor };
}

export const CMD_LINE_HEIGHT_PX = 20;
export const CMD_PAGE_SCROLL_RATIO = 0.85;
