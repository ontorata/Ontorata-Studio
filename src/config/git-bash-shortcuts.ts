/**
 * Git Bash / GNU Readline (Emacs) keyboard shortcuts.
 * Reference: https://gist.github.com/tuxfight3r/60051ac67c5f0445efee
 */

export type BashShortcutCategory = 'moving' | 'edit' | 'history' | 'expansion' | 'studio';

export interface GitBashShortcut {
  keys: string;
  action: string;
  category: BashShortcutCategory;
}

export const GIT_BASH_SHORTCUTS: GitBashShortcut[] = [
  // Moving
  { keys: 'Ctrl + A', action: 'Go to beginning of command line', category: 'moving' },
  { keys: 'Ctrl + E', action: 'Go to end of command line', category: 'moving' },
  { keys: 'Ctrl + B', action: 'Move back one character', category: 'moving' },
  { keys: 'Ctrl + F', action: 'Move forward one character', category: 'moving' },
  { keys: 'Alt + F', action: 'Move cursor forward one word', category: 'moving' },
  { keys: 'Alt + B', action: 'Move cursor back one word', category: 'moving' },
  {
    keys: 'Ctrl + X, Ctrl + X',
    action: 'Toggle between start of line and current cursor position',
    category: 'moving',
  },
  {
    keys: 'Ctrl + ], X',
    action: 'Move forward to the next occurrence of character X',
    category: 'moving',
  },
  {
    keys: 'Alt + Ctrl + ], X',
    action: 'Move backward to the previous occurrence of character X',
    category: 'moving',
  },

  // Edit / other
  { keys: 'Ctrl + D', action: 'Delete character under cursor (empty line: exit shell)', category: 'edit' },
  { keys: 'Ctrl + H', action: 'Delete previous character before cursor', category: 'edit' },
  { keys: 'Ctrl + U', action: 'Clear / cut text before cursor', category: 'edit' },
  { keys: 'Ctrl + K', action: 'Clear / cut text after cursor', category: 'edit' },
  { keys: 'Ctrl + W', action: 'Delete the word before the cursor', category: 'edit' },
  { keys: 'Alt + D', action: 'Delete the word from the cursor', category: 'edit' },
  { keys: 'Ctrl + Y', action: 'Paste last cut (yank)', category: 'edit' },
  { keys: 'Ctrl + I', action: 'Command completion (same as Tab)', category: 'edit' },
  { keys: 'Tab', action: 'Auto-complete', category: 'edit' },
  { keys: 'Ctrl + L', action: 'Clear the screen', category: 'edit' },
  { keys: 'Ctrl + C', action: 'Kill whatever is running / interrupt line', category: 'edit' },
  { keys: 'Ctrl + Z', action: 'Place current process in background', category: 'edit' },
  { keys: 'Ctrl + _', action: 'Undo', category: 'edit' },
  { keys: 'Ctrl + X, Ctrl + U', action: 'Undo the last changes', category: 'edit' },
  { keys: 'Ctrl + T', action: 'Swap the last two characters before the cursor', category: 'edit' },
  { keys: 'Esc + T', action: 'Swap last two words before the cursor', category: 'edit' },
  { keys: 'Alt + T', action: 'Swap current word with previous', category: 'edit' },
  { keys: 'Alt + Backspace', action: 'Delete previous word', category: 'edit' },
  {
    keys: 'Alt + <',
    action: 'Move to the first line in history',
    category: 'edit',
  },
  {
    keys: 'Alt + >',
    action: 'Move to end of input history (current line)',
    category: 'edit',
  },
  {
    keys: 'Alt + ?',
    action: 'Display file/folder names in the current path as help',
    category: 'edit',
  },
  {
    keys: 'Alt + *',
    action: 'Insert all file/folder names in the current path',
    category: 'edit',
  },
  {
    keys: 'Alt + .',
    action: 'Insert the last argument of the previous command',
    category: 'edit',
  },
  {
    keys: 'Alt + C',
    action: 'Capitalize from cursor to end of word',
    category: 'edit',
  },
  { keys: 'Alt + U', action: 'Uppercase from cursor to end of word', category: 'edit' },
  { keys: 'Alt + L', action: 'Lowercase from cursor to end of word', category: 'edit' },
  {
    keys: 'Alt + P',
    action: 'Non-incremental reverse search of history',
    category: 'edit',
  },
  { keys: 'Alt + R', action: 'Undo all changes to the line', category: 'edit' },
  { keys: 'Alt + Ctrl + E', action: 'Expand command line', category: 'edit' },

  // History
  {
    keys: 'Ctrl + R',
    action: 'Search backward through command history',
    category: 'history',
  },
  {
    keys: 'Ctrl + S',
    action: 'Search forward through command history',
    category: 'history',
  },
  {
    keys: 'Ctrl + P',
    action: 'Previous command in history (same as Up arrow)',
    category: 'history',
  },
  {
    keys: 'Ctrl + N',
    action: 'Next command in history (same as Down arrow)',
    category: 'history',
  },
  {
    keys: 'Ctrl + O',
    action: 'Execute the command found via Ctrl+R or Ctrl+S',
    category: 'history',
  },
  { keys: 'Ctrl + G', action: 'Escape from history search mode', category: 'history' },
  { keys: 'Up / Down', action: 'Navigate command history', category: 'history' },

  // History expansion (typed then Enter)
  { keys: '!!', action: 'Run previous command', category: 'expansion' },
  { keys: '!vi', action: 'Run previous command that begins with vi', category: 'expansion' },
  { keys: '!vi:p', action: 'Print previous command that begins with vi', category: 'expansion' },
  { keys: '!n', action: 'Execute nth command in history', category: 'expansion' },
  { keys: '!$', action: 'Last argument of last command', category: 'expansion' },
  { keys: '!^', action: 'First argument of last command', category: 'expansion' },
  {
    keys: '^abc^xyz',
    action: 'Replace first occurrence of abc with xyz in last command and run',
    category: 'expansion',
  },
  { keys: 'cd -', action: 'Change to previous working directory', category: 'expansion' },

  // Studio-only (avoid conflicts with Bash Ctrl+T / Ctrl+W)
  { keys: 'Ctrl + Shift + T', action: 'New terminal tab', category: 'studio' },
  { keys: 'Ctrl + Shift + W', action: 'Close terminal tab', category: 'studio' },
  { keys: 'Ctrl + Tab', action: 'Next terminal tab', category: 'studio' },
  { keys: 'Ctrl + Shift + Tab', action: 'Previous terminal tab', category: 'studio' },
  { keys: 'F1', action: 'Show keyboard shortcuts', category: 'studio' },
];

const CATEGORY_LABELS: Record<BashShortcutCategory, string> = {
  moving: 'Moving',
  edit: 'Edit / other',
  history: 'History search',
  expansion: 'History expansion (type then Enter)',
  studio: 'Studio terminal tabs',
};

export function formatGitBashShortcutsHelp(): string {
  const groups = (
    ['moving', 'edit', 'history', 'expansion', 'studio'] as BashShortcutCategory[]
  ).map((category) => {
    const items = GIT_BASH_SHORTCUTS.filter((s) => s.category === category);
    const lines = items.map((s) => `  ${s.keys.padEnd(24)} ${s.action}`);
    return `${CATEGORY_LABELS[category]}:\n${lines.join('\n')}`;
  });

  return [
    'Git Bash shortcuts (GNU Readline / Emacs mode)',
    'Reference: https://gist.github.com/tuxfight3r/60051ac67c5f0445efee',
    '',
    ...groups,
  ].join('\n');
}

export function isWordChar(ch: string): boolean {
  return /[A-Za-z0-9_]/.test(ch);
}

export function moveWordForward(value: string, cursor: number): number {
  let pos = cursor;
  while (pos < value.length && !isWordChar(value[pos])) pos += 1;
  while (pos < value.length && isWordChar(value[pos])) pos += 1;
  return pos;
}

export function moveWordBackward(value: string, cursor: number): number {
  let pos = cursor;
  while (pos > 0 && !isWordChar(value[pos - 1])) pos -= 1;
  while (pos > 0 && isWordChar(value[pos - 1])) pos -= 1;
  return pos;
}

export function deleteWordBefore(value: string, cursor: number): { value: string; cursor: number; cut: string } {
  let start = cursor;
  while (start > 0 && value[start - 1] === ' ') start -= 1;
  while (start > 0 && value[start - 1] !== ' ') start -= 1;
  const cut = value.slice(start, cursor);
  return { value: value.slice(0, start) + value.slice(cursor), cursor: start, cut };
}

export function deleteWordFrom(value: string, cursor: number): { value: string; cursor: number; cut: string } {
  let end = cursor;
  while (end < value.length && !isWordChar(value[end])) end += 1;
  while (end < value.length && isWordChar(value[end])) end += 1;
  const cut = value.slice(cursor, end);
  return { value: value.slice(0, cursor) + value.slice(end), cursor, cut };
}

export function cutBefore(value: string, cursor: number): { value: string; cursor: number; cut: string } {
  const cut = value.slice(0, cursor);
  return { value: value.slice(cursor), cursor: 0, cut };
}

export function cutAfter(value: string, cursor: number): { value: string; cursor: number; cut: string } {
  const cut = value.slice(cursor);
  return { value: value.slice(0, cursor), cursor, cut };
}

export function deleteCharAt(value: string, cursor: number): { value: string; cursor: number } {
  if (cursor >= value.length) return { value, cursor };
  return { value: value.slice(0, cursor) + value.slice(cursor + 1), cursor };
}

export function deleteCharBefore(value: string, cursor: number): { value: string; cursor: number } {
  if (cursor <= 0) return { value, cursor };
  return { value: value.slice(0, cursor - 1) + value.slice(cursor), cursor: cursor - 1 };
}

export function transposeChars(value: string, cursor: number): { value: string; cursor: number } {
  if (cursor < 2) return { value, cursor };
  const i = cursor - 2;
  const chars = value.split('');
  [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
  return { value: chars.join(''), cursor };
}

export function transposeWords(value: string, cursor: number): { value: string; cursor: number } {
  const end = moveWordBackward(value, cursor);
  const mid = moveWordBackward(value, end);
  const start = moveWordBackward(value, mid);
  if (start === mid || mid === end) return { value, cursor };
  const first = value.slice(start, mid);
  const second = value.slice(mid, end);
  const next = value.slice(0, start) + second + first + value.slice(end);
  return { value: next, cursor: start + second.length + first.length };
}

export function swapCurrentWithPreviousWord(value: string, cursor: number): { value: string; cursor: number } {
  const curEnd = moveWordForward(value, moveWordBackward(value, cursor));
  const curStart = moveWordBackward(value, curEnd);
  const prevEnd = curStart;
  const prevStart = moveWordBackward(value, prevEnd);
  if (prevStart === prevEnd || curStart === curEnd) return { value, cursor };
  const prev = value.slice(prevStart, prevEnd);
  const current = value.slice(curStart, curEnd);
  const next = value.slice(0, prevStart) + current + prev + value.slice(curEnd);
  return { value: next, cursor: prevStart + current.length };
}

export function transformWordFromCursor(
  value: string,
  cursor: number,
  transform: (word: string) => string,
): { value: string; cursor: number; end: number } {
  const start = moveWordBackward(value, moveWordForward(value, cursor));
  const end = moveWordForward(value, start);
  const word = value.slice(start, end);
  const transformed = transform(word);
  return {
    value: value.slice(0, start) + transformed + value.slice(end),
    cursor: start,
    end: start + transformed.length,
  };
}

export function capitalizeWordFromCursor(value: string, cursor: number): { value: string; cursor: number } {
  const result = transformWordFromCursor(value, cursor, (word) => {
    if (!word) return word;
    return word[0].toUpperCase() + word.slice(1);
  });
  return { value: result.value, cursor: result.cursor };
}

export function uppercaseWordFromCursor(value: string, cursor: number): { value: string; cursor: number } {
  const result = transformWordFromCursor(value, cursor, (word) => word.toUpperCase());
  return { value: result.value, cursor: result.cursor };
}

export function lowercaseWordFromCursor(value: string, cursor: number): { value: string; cursor: number } {
  const result = transformWordFromCursor(value, cursor, (word) => word.toLowerCase());
  return { value: result.value, cursor: result.cursor };
}

export function jumpToChar(value: string, cursor: number, ch: string, forward: boolean): number {
  if (!ch) return cursor;
  if (forward) {
    const idx = value.indexOf(ch, cursor);
    return idx >= 0 ? idx : cursor;
  }
  const slice = value.slice(0, cursor);
  const idx = slice.lastIndexOf(ch);
  return idx >= 0 ? idx : cursor;
}

export function yankKillRing(value: string, cursor: number, ring: string): { value: string; cursor: number } {
  if (!ring) return { value, cursor };
  return { value: value.slice(0, cursor) + ring + value.slice(cursor), cursor: cursor + ring.length };
}

export function lastArgument(command: string): string {
  const parts = command.trim().split(/\s+/);
  return parts.length > 1 ? (parts[parts.length - 1] ?? '') : '';
}

export function firstArgument(command: string): string {
  const parts = command.trim().split(/\s+/);
  return parts.length > 1 ? (parts[1] ?? '') : '';
}

/** Expand Bash history references before execution (Emacs/history expansion). */
export function expandBashHistory(input: string, history: string[]): string {
  const trimmed = input.trim();
  if (!trimmed || history.length === 0) return input;

  const last = history[history.length - 1] ?? '';

  const caretReplace = trimmed.match(/^\^([^^]+)\^([^^]*)\^?$/);
  if (caretReplace) {
    const [, from, to] = caretReplace;
    if (last.includes(from)) return last.replace(from, to);
    return trimmed;
  }

  if (trimmed === '!!') return last;

  if (trimmed === '!$') return lastArgument(last) || trimmed;
  if (trimmed === '!^') return firstArgument(last) || trimmed;

  const printPrefix = trimmed.match(/^!(.+):p$/);
  if (printPrefix) {
    const prefix = printPrefix[1];
    const match = [...history].reverse().find((item) => item.startsWith(prefix));
    return match ?? trimmed;
  }

  if (trimmed.startsWith('!') && !trimmed.startsWith('!!')) {
    const prefix = trimmed.slice(1);
    if (/^\d+$/.test(prefix)) {
      const idx = Number(prefix) - 1;
      return history[idx] ?? trimmed;
    }
    const match = [...history].reverse().find((item) => item.startsWith(prefix));
    return match ?? trimmed;
  }

  return input;
}

export interface BashEditorSnapshot {
  value: string;
  cursor: number;
}

export interface BashSearchState {
  direction: 'reverse' | 'forward';
  query: string;
  matches: string[];
  index: number;
  original: string;
  originalCursor: number;
}
