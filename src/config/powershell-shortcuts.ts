/** PowerShell ISE keyboard shortcuts — reference for Studio terminal input. */

export type ShortcutCategory = 'editing' | 'sessions' | 'navigation' | 'running';

export interface PowerShellShortcut {
  keys: string;
  action: string;
  category: ShortcutCategory;
}

/** Subset implemented in browser terminal input; full ISE list for help. */
export const POWERSHELL_ISE_SHORTCUTS: PowerShellShortcut[] = [
  { keys: 'F1', action: 'Show keyboard shortcuts', category: 'editing' },
  { keys: 'Ctrl + A', action: 'Select all', category: 'editing' },
  { keys: 'Ctrl + C', action: 'Copy selection, or interrupt line (^C)', category: 'editing' },
  { keys: 'Ctrl + X', action: 'Cut selection', category: 'editing' },
  { keys: 'Ctrl + V', action: 'Paste', category: 'editing' },
  { keys: 'Ctrl + Backspace', action: 'Delete word to the left', category: 'editing' },
  { keys: 'Ctrl + Delete', action: 'Delete word to the right', category: 'editing' },
  { keys: 'Ctrl + U', action: 'Lowercase selection', category: 'editing' },
  { keys: 'Ctrl + Shift + U', action: 'Uppercase selection', category: 'editing' },
  { keys: 'Up / Down', action: 'Command history', category: 'editing' },
  { keys: 'Ctrl + L', action: 'Clear screen (cls)', category: 'running' },
  { keys: 'Ctrl + C', action: 'Stop / interrupt when no selection', category: 'running' },
  { keys: 'Ctrl + T', action: 'New PowerShell tab', category: 'sessions' },
  { keys: 'Ctrl + W', action: 'Close PowerShell tab', category: 'sessions' },
  { keys: 'Ctrl + Tab', action: 'Next terminal tab', category: 'sessions' },
  { keys: 'Ctrl + Shift + Tab', action: 'Previous terminal tab', category: 'sessions' },
  { keys: 'Ctrl + D', action: 'Focus command line', category: 'navigation' },
  { keys: 'Ctrl + Shift + O', action: 'Go to Output panel', category: 'navigation' },
];

const CATEGORY_LABELS: Record<ShortcutCategory, string> = {
  editing: 'Editing text',
  sessions: 'PowerShell tabs',
  navigation: 'View / panes',
  running: 'Running commands',
};

export function formatPowerShellShortcutsHelp(): string {
  const groups = (['editing', 'sessions', 'navigation', 'running'] as ShortcutCategory[]).map(
    (category) => {
      const items = POWERSHELL_ISE_SHORTCUTS.filter((s) => s.category === category);
      const lines = items.map((s) => `  ${s.keys.padEnd(22)} ${s.action}`);
      return `${CATEGORY_LABELS[category]}:\n${lines.join('\n')}`;
    },
  );
  return [
    'PowerShell ISE shortcuts (Studio terminal)',
    'Reference: https://learn.microsoft.com/en-us/powershell/scripting/windows-powershell/ise/keyboard-shortcuts-for-the-windows-powershell-ise',
    '',
    ...groups,
  ].join('\n');
}

export function deleteWordLeft(value: string, cursor: number): { value: string; cursor: number } {
  let pos = cursor;
  while (pos > 0 && value[pos - 1] === ' ') pos -= 1;
  while (pos > 0 && value[pos - 1] !== ' ') pos -= 1;
  return { value: value.slice(0, pos) + value.slice(cursor), cursor: pos };
}

export function deleteWordRight(value: string, cursor: number): { value: string; cursor: number } {
  let pos = cursor;
  while (pos < value.length && value[pos] === ' ') pos += 1;
  while (pos < value.length && value[pos] !== ' ') pos += 1;
  return { value: value.slice(0, cursor) + value.slice(pos), cursor };
}

export function transformSelection(
  value: string,
  start: number,
  end: number,
  transform: (text: string) => string,
): { value: string; start: number; end: number } {
  const selected = value.slice(start, end);
  const transformed = transform(selected);
  return {
    value: value.slice(0, start) + transformed + value.slice(end),
    start,
    end: start + transformed.length,
  };
}
