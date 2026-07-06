import { DEFAULT_TERMINAL_PROFILE, type ShellProfileId } from '../config/terminal-profiles';
import { listPathEntries } from '../domain/terminal/shell-commands';
import {
  capitalizeWordFromCursor,
  cutAfter,
  cutBefore,
  deleteCharAt,
  deleteCharBefore,
  deleteWordBefore,
  deleteWordFrom,
  formatGitBashShortcutsHelp,
  jumpToChar,
  lastArgument,
  lowercaseWordFromCursor,
  moveWordBackward,
  moveWordForward,
  swapCurrentWithPreviousWord,
  transposeChars,
  uppercaseWordFromCursor,
  yankKillRing,
  type BashEditorSnapshot,
  type BashSearchState,
} from '../config/git-bash-shortcuts';

interface HistoryState {
  items: string[];
  index: number;
}

export interface BashKeyboardContext {
  command: string;
  setCommand: (value: string) => void;
  sessionId: string | undefined;
  sessions: Array<{ id: string }>;
  activeSessionId: string;
  setActiveSessionId: (id: string) => void;
  onNewSession: (profileId?: ShellProfileId) => void;
  onCloseSession: (id: string) => void;
  onClearScreen: () => void;
  onInterrupt: () => void;
  onShowShortcuts: (text: string) => void;
  onSubmitCommand?: (command: string) => void;
  cwd?: string;
}

interface BashKeyboardRefs {
  history: Map<string, HistoryState>;
  killRing: string;
  undoStack: BashEditorSnapshot[];
  lineOriginal: BashEditorSnapshot | null;
  search: BashSearchState | null;
  pendingCtrlX: boolean;
  pendingJumpForward: boolean;
  pendingJumpBackward: boolean;
  exchangeMark: number | null;
}

function hasMod(event: React.KeyboardEvent | KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey;
}

function cycleSession(
  sessions: Array<{ id: string }>,
  activeId: string,
  direction: 1 | -1,
): string | null {
  if (sessions.length < 2) return null;
  const idx = sessions.findIndex((s) => s.id === activeId);
  if (idx < 0) return sessions[0]?.id ?? null;
  const next = (idx + direction + sessions.length) % sessions.length;
  return sessions[next]?.id ?? null;
}

function setInputState(
  input: HTMLInputElement,
  value: string,
  cursor: number,
  setCommand: (value: string) => void,
) {
  setCommand(value);
  requestAnimationFrame(() => input.setSelectionRange(cursor, cursor));
}

function pushUndo(refs: BashKeyboardRefs, snapshot: BashEditorSnapshot) {
  refs.undoStack.push(snapshot);
  if (refs.undoStack.length > 100) refs.undoStack.shift();
}

function applyEdit(
  input: HTMLInputElement,
  refs: BashKeyboardRefs,
  ctx: BashKeyboardContext,
  nextValue: string,
  nextCursor: number,
  cut?: string,
) {
  const start = input.selectionStart ?? 0;
  pushUndo(refs, { value: ctx.command, cursor: start });
  if (cut !== undefined && cut.length > 0) refs.killRing = cut;
  setInputState(input, nextValue, nextCursor, ctx.setCommand);
}

function navigateHistory(
  input: HTMLInputElement,
  refs: BashKeyboardRefs,
  ctx: BashKeyboardContext,
  direction: 'up' | 'down',
): boolean {
  if (!ctx.sessionId) return false;
  const state = refs.history.get(ctx.sessionId) ?? { items: [], index: -1 };
  if (state.items.length === 0) return false;

  if (direction === 'up') {
    const nextIdx = state.index < 0 ? state.items.length - 1 : Math.max(0, state.index - 1);
    state.index = nextIdx;
    const item = state.items[nextIdx] ?? '';
    setInputState(input, item, item.length, ctx.setCommand);
  } else {
    const nextIdx = state.index < 0 ? 0 : Math.min(state.items.length - 1, state.index + 1);
    if (state.index < 0 || nextIdx === state.index) {
      state.index = -1;
      setInputState(input, '', 0, ctx.setCommand);
    } else {
      state.index = nextIdx;
      const item = state.items[nextIdx] ?? '';
      setInputState(input, item, item.length, ctx.setCommand);
    }
  }

  refs.history.set(ctx.sessionId, state);
  return true;
}

function startSearch(
  refs: BashKeyboardRefs,
  ctx: BashKeyboardContext,
  input: HTMLInputElement,
  direction: 'reverse' | 'forward',
) {
  if (!ctx.sessionId) return;
  const state = refs.history.get(ctx.sessionId) ?? { items: [], index: -1 };
  const cursor = input.selectionStart ?? 0;
  const query = ctx.command.slice(0, cursor);
  const matches = state.items.filter((item) => item.includes(query));
  refs.search = {
    direction,
    query,
    matches,
    index: 0,
    original: ctx.command,
    originalCursor: cursor,
  };
  if (matches.length > 0) {
    setInputState(input, matches[0], matches[0].length, ctx.setCommand);
  }
}

function cycleSearch(refs: BashKeyboardRefs, ctx: BashKeyboardContext, input: HTMLInputElement) {
  if (!refs.search || refs.search.matches.length === 0) return;
  refs.search.index = (refs.search.index + 1) % refs.search.matches.length;
  const match = refs.search.matches[refs.search.index] ?? '';
  setInputState(input, match, match.length, ctx.setCommand);
}

function cancelSearch(refs: BashKeyboardRefs, ctx: BashKeyboardContext, input: HTMLInputElement) {
  if (!refs.search) return;
  setInputState(input, refs.search.original, refs.search.originalCursor, ctx.setCommand);
  refs.search = null;
}

function updateSearchQuery(
  refs: BashKeyboardRefs,
  ctx: BashKeyboardContext,
  input: HTMLInputElement,
  query: string,
) {
  if (!refs.search || !ctx.sessionId) return;
  const state = refs.history.get(ctx.sessionId) ?? { items: [], index: -1 };
  refs.search.query = query;
  refs.search.matches = state.items.filter((item) => item.includes(query));
  refs.search.index = 0;
  if (refs.search.matches.length > 0) {
    const match = refs.search.matches[0];
    setInputState(input, match, match.length, ctx.setCommand);
  } else {
    setInputState(input, query, query.length, ctx.setCommand);
  }
}

export function createBashKeyboardRefs(history: Map<string, HistoryState>): BashKeyboardRefs {
  return {
    history,
    killRing: '',
    undoStack: [],
    lineOriginal: null,
    search: null,
    pendingCtrlX: false,
    pendingJumpForward: false,
    pendingJumpBackward: false,
    exchangeMark: null,
  };
}

export function handleBashTerminalKeyDown(
  event: React.KeyboardEvent<HTMLInputElement>,
  ctx: BashKeyboardContext,
  refs: BashKeyboardRefs,
): boolean {
  const input = event.currentTarget;
  const mod = hasMod(event);
  const start = input.selectionStart ?? 0;
  const end = input.selectionEnd ?? 0;
  const hasSelection = start !== end;

  const stop = () => {
    event.preventDefault();
    event.stopPropagation();
  };

  if (refs.search) {
    if (mod && event.code === 'KeyG') {
      stop();
      cancelSearch(refs, ctx, input);
      return true;
    }
    if (mod && event.code === 'KeyO') {
      stop();
      const cmd = ctx.command;
      refs.search = null;
      ctx.onSubmitCommand?.(cmd);
      return true;
    }
    if ((mod && event.code === 'KeyR') || (mod && event.code === 'KeyS')) {
      stop();
      cycleSearch(refs, ctx, input);
      return true;
    }
    if (event.key === 'Backspace') {
      stop();
      updateSearchQuery(refs, ctx, input, refs.search.query.slice(0, -1));
      return true;
    }
    if (event.key.length === 1 && !mod && !event.altKey) {
      stop();
      updateSearchQuery(refs, ctx, input, refs.search.query + event.key);
      return true;
    }
    if (event.key === 'Escape') {
      stop();
      cancelSearch(refs, ctx, input);
      return true;
    }
  }

  if (refs.pendingJumpForward || refs.pendingJumpBackward) {
    if (event.key.length === 1 && !mod) {
      stop();
      const forward = refs.pendingJumpForward;
      refs.pendingJumpForward = false;
      refs.pendingJumpBackward = false;
      const nextCursor = jumpToChar(ctx.command, start, event.key, forward);
      setInputState(input, ctx.command, nextCursor, ctx.setCommand);
      return true;
    }
    refs.pendingJumpForward = false;
    refs.pendingJumpBackward = false;
  }

  if (refs.pendingCtrlX) {
    refs.pendingCtrlX = false;
    if (mod && event.code === 'KeyU') {
      stop();
      if (refs.undoStack.length > 0) {
        const snap = refs.undoStack.pop()!;
        setInputState(input, snap.value, snap.cursor, ctx.setCommand);
      }
      return true;
    }
    if (mod && event.code === 'KeyX') {
      stop();
      if (refs.exchangeMark === null) {
        refs.exchangeMark = start;
        setInputState(input, ctx.command, 0, ctx.setCommand);
      } else {
        const mark = refs.exchangeMark;
        refs.exchangeMark = null;
        setInputState(input, ctx.command, mark, ctx.setCommand);
      }
      return true;
    }
  }

  if (event.key === 'F1') {
    stop();
    ctx.onShowShortcuts(formatGitBashShortcutsHelp());
    return true;
  }

  if (mod && event.code === 'BracketRight' && !event.altKey) {
    stop();
    refs.pendingJumpForward = true;
    return true;
  }

  if (mod && event.altKey && event.code === 'BracketRight') {
    stop();
    refs.pendingJumpBackward = true;
    return true;
  }

  if (mod && event.code === 'KeyX' && !event.shiftKey && !event.altKey) {
    stop();
    refs.pendingCtrlX = true;
    return true;
  }

  if (mod && event.code === 'KeyA' && !event.shiftKey && !event.altKey) {
    stop();
    setInputState(input, ctx.command, 0, ctx.setCommand);
    return true;
  }

  if (mod && event.code === 'KeyE' && !event.shiftKey && !event.altKey) {
    stop();
    setInputState(input, ctx.command, ctx.command.length, ctx.setCommand);
    return true;
  }

  if (mod && event.code === 'KeyB' && !event.shiftKey && !event.altKey) {
    stop();
    setInputState(input, ctx.command, Math.max(0, start - 1), ctx.setCommand);
    return true;
  }

  if (mod && event.code === 'KeyF' && !event.shiftKey && !event.altKey) {
    stop();
    setInputState(input, ctx.command, Math.min(ctx.command.length, start + 1), ctx.setCommand);
    return true;
  }

  if (event.altKey && (event.code === 'KeyF' || event.code === 'ArrowRight')) {
    stop();
    setInputState(input, ctx.command, moveWordForward(ctx.command, start), ctx.setCommand);
    return true;
  }

  if (event.altKey && (event.code === 'KeyB' || event.code === 'ArrowLeft')) {
    stop();
    setInputState(input, ctx.command, moveWordBackward(ctx.command, start), ctx.setCommand);
    return true;
  }

  if (mod && event.code === 'KeyH' && !event.shiftKey) {
    stop();
    if (hasSelection) {
      applyEdit(input, refs, ctx, ctx.command.slice(0, start) + ctx.command.slice(end), start);
    } else {
      const result = deleteCharBefore(ctx.command, start);
      applyEdit(input, refs, ctx, result.value, result.cursor);
    }
    return true;
  }

  if (mod && event.code === 'KeyD' && !event.shiftKey && !event.altKey) {
    stop();
    if (ctx.command.length === 0 && start === 0) {
      ctx.onCloseSession(ctx.activeSessionId);
      return true;
    }
    if (hasSelection) {
      applyEdit(input, refs, ctx, ctx.command.slice(0, start) + ctx.command.slice(end), start);
    } else {
      const result = deleteCharAt(ctx.command, start);
      applyEdit(input, refs, ctx, result.value, result.cursor);
    }
    return true;
  }

  if (mod && event.code === 'KeyU' && !event.shiftKey && !event.altKey) {
    stop();
    const result = cutBefore(ctx.command, start);
    applyEdit(input, refs, ctx, result.value, result.cursor, result.cut);
    return true;
  }

  if (mod && event.code === 'KeyK' && !event.shiftKey && !event.altKey) {
    stop();
    const result = cutAfter(ctx.command, start);
    applyEdit(input, refs, ctx, result.value, result.cursor, result.cut);
    return true;
  }

  if (mod && event.code === 'KeyW' && !event.shiftKey && !event.altKey) {
    stop();
    const result = deleteWordBefore(ctx.command, start);
    applyEdit(input, refs, ctx, result.value, result.cursor, result.cut);
    return true;
  }

  if (event.altKey && event.code === 'KeyD' && !mod) {
    stop();
    const result = deleteWordFrom(ctx.command, start);
    applyEdit(input, refs, ctx, result.value, result.cursor, result.cut);
    return true;
  }

  if (event.altKey && event.code === 'Backspace') {
    stop();
    const result = deleteWordBefore(ctx.command, start);
    applyEdit(input, refs, ctx, result.value, result.cursor, result.cut);
    return true;
  }

  if (mod && event.code === 'KeyY' && !event.shiftKey) {
    stop();
    const result = yankKillRing(ctx.command, start, refs.killRing);
    applyEdit(input, refs, ctx, result.value, result.cursor);
    return true;
  }

  if ((mod && event.code === 'KeyI') || event.key === 'Tab') {
    stop();
    const spacer = ctx.command.length === 0 ? '  ' : ' ';
    applyEdit(
      input,
      refs,
      ctx,
      ctx.command.slice(0, start) + spacer + ctx.command.slice(end),
      start + spacer.length,
    );
    return true;
  }

  if (mod && event.code === 'KeyL' && !event.shiftKey) {
    stop();
    ctx.onClearScreen();
    return true;
  }

  if (mod && event.code === 'KeyC' && !hasSelection) {
    stop();
    ctx.setCommand('');
    ctx.onInterrupt();
    return true;
  }

  if (mod && event.code === 'KeyZ' && !event.shiftKey) {
    stop();
    ctx.onInterrupt();
    return true;
  }

  if (mod && (event.code === 'Minus' || (event.shiftKey && event.code === 'Slash'))) {
    stop();
    if (refs.undoStack.length > 0) {
      const snap = refs.undoStack.pop()!;
      setInputState(input, snap.value, snap.cursor, ctx.setCommand);
    }
    return true;
  }

  if (mod && event.code === 'KeyT' && !event.shiftKey && !event.altKey) {
    stop();
    const result = transposeChars(ctx.command, start);
    applyEdit(input, refs, ctx, result.value, result.cursor);
    return true;
  }

  if (event.altKey && event.code === 'KeyT' && !mod) {
    stop();
    const result = swapCurrentWithPreviousWord(ctx.command, start);
    applyEdit(input, refs, ctx, result.value, result.cursor);
    return true;
  }

  if (event.altKey && event.code === 'KeyC' && !mod) {
    stop();
    const result = capitalizeWordFromCursor(ctx.command, start);
    applyEdit(input, refs, ctx, result.value, result.cursor);
    return true;
  }

  if (event.altKey && event.code === 'KeyU' && !mod) {
    stop();
    const result = uppercaseWordFromCursor(ctx.command, start);
    applyEdit(input, refs, ctx, result.value, result.cursor);
    return true;
  }

  if (event.altKey && event.code === 'KeyL' && !mod) {
    stop();
    const result = lowercaseWordFromCursor(ctx.command, start);
    applyEdit(input, refs, ctx, result.value, result.cursor);
    return true;
  }

  if (event.altKey && event.code === 'KeyR' && !mod) {
    stop();
    if (refs.lineOriginal) {
      setInputState(input, refs.lineOriginal.value, refs.lineOriginal.cursor, ctx.setCommand);
      refs.undoStack = [];
    }
    return true;
  }

  if (event.altKey && (event.code === 'Slash' || event.code === 'KeyQuestion')) {
    stop();
    const entries = ctx.cwd ? listPathEntries(ctx.cwd, true) : [];
    if (entries.length > 0) {
      ctx.onShowShortcuts(entries.join('  '));
    }
    return true;
  }

  if (event.altKey && event.code === 'Digit8' && event.shiftKey) {
    stop();
    const entries = ctx.cwd ? listPathEntries(ctx.cwd, true) : [];
    if (entries.length > 0) {
      const joined = entries.join(' ');
      applyEdit(
        input,
        refs,
        ctx,
        ctx.command.slice(0, start) + joined + ctx.command.slice(end),
        start + joined.length,
      );
    }
    return true;
  }

  if (event.altKey && event.code === 'Period' && !event.shiftKey && !mod) {
    stop();
    if (!ctx.sessionId) return true;
    const state = refs.history.get(ctx.sessionId) ?? { items: [], index: -1 };
    const prev = state.items[state.items.length - 1];
    if (prev) {
      const arg = lastArgument(prev);
      if (arg) {
        applyEdit(
          input,
          refs,
          ctx,
          ctx.command.slice(0, start) + arg + ctx.command.slice(end),
          start + arg.length,
        );
      }
    }
    return true;
  }

  if (event.altKey && event.code === 'Comma') {
    stop();
    if (!ctx.sessionId) return true;
    const state = refs.history.get(ctx.sessionId) ?? { items: [], index: -1 };
    if (state.items.length > 0) {
      const first = state.items[0];
      setInputState(input, first, first.length, ctx.setCommand);
      state.index = 0;
      refs.history.set(ctx.sessionId, state);
    }
    return true;
  }

  if (event.altKey && event.shiftKey && event.code === 'Period') {
    stop();
    setInputState(input, '', 0, ctx.setCommand);
    if (ctx.sessionId) {
      const state = refs.history.get(ctx.sessionId) ?? { items: [], index: -1 };
      state.index = -1;
      refs.history.set(ctx.sessionId, state);
    }
    return true;
  }

  if (event.altKey && event.code === 'KeyP' && !mod) {
    stop();
    startSearch(refs, ctx, input, 'reverse');
    return true;
  }

  if (event.altKey && event.code === 'KeyN' && !mod) {
    stop();
    startSearch(refs, ctx, input, 'forward');
    return true;
  }

  if (mod && event.altKey && event.code === 'KeyE') {
    stop();
    applyEdit(input, refs, ctx, ctx.command.replace(/\s+/g, ' ').trim(), ctx.command.length);
    return true;
  }

  if (mod && event.code === 'KeyP' && !event.shiftKey && !event.altKey) {
    stop();
    navigateHistory(input, refs, ctx, 'up');
    return true;
  }

  if (mod && event.code === 'KeyN' && !event.shiftKey && !event.altKey) {
    stop();
    navigateHistory(input, refs, ctx, 'down');
    return true;
  }

  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    stop();
    navigateHistory(input, refs, ctx, event.key === 'ArrowUp' ? 'up' : 'down');
    return true;
  }

  if (mod && event.code === 'KeyR' && !event.shiftKey && !event.altKey) {
    stop();
    if (refs.search?.direction === 'reverse') {
      cycleSearch(refs, ctx, input);
    } else {
      startSearch(refs, ctx, input, 'reverse');
    }
    return true;
  }

  if (mod && event.code === 'KeyS' && !event.shiftKey && !event.altKey) {
    stop();
    if (refs.search?.direction === 'forward') {
      cycleSearch(refs, ctx, input);
    } else {
      startSearch(refs, ctx, input, 'forward');
    }
    return true;
  }

  if (mod && event.shiftKey && event.code === 'KeyT' && !event.altKey) {
    stop();
    ctx.onNewSession('git-bash');
    return true;
  }

  if (mod && event.shiftKey && event.code === 'KeyW' && !event.altKey) {
    stop();
    ctx.onCloseSession(ctx.activeSessionId);
    return true;
  }

  if (mod && event.code === 'Tab') {
    const nextId = cycleSession(ctx.sessions, ctx.activeSessionId, event.shiftKey ? -1 : 1);
    if (nextId) {
      stop();
      ctx.setActiveSessionId(nextId);
    }
    return true;
  }

  if (input.dataset.bashLineInit !== '1') {
    refs.lineOriginal = { value: ctx.command, cursor: start };
    input.dataset.bashLineInit = '1';
  }

  return false;
}

export function resetBashLineState(input: HTMLInputElement, refs: BashKeyboardRefs) {
  delete input.dataset.bashLineInit;
  refs.lineOriginal = null;
  refs.search = null;
  refs.pendingCtrlX = false;
  refs.pendingJumpForward = false;
  refs.pendingJumpBackward = false;
  refs.exchangeMark = null;
}

export function isBashTerminalShortcut(event: KeyboardEvent): boolean {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;
  if (target.getAttribute('data-terminal-profile') !== 'git-bash') return false;
  if (!target.hasAttribute('data-terminal-input')) return false;

  if (event.key === 'F1') return true;
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') return true;
  if (event.key === 'Tab') return true;
  if (event.key === 'Escape') return true;
  if (event.altKey) return true;

  if (!hasMod(event)) return false;

  const codes = new Set([
    'KeyA',
    'KeyB',
    'KeyC',
    'KeyD',
    'KeyE',
    'KeyF',
    'KeyG',
    'KeyH',
    'KeyI',
    'KeyK',
    'KeyL',
    'KeyN',
    'KeyO',
    'KeyP',
    'KeyR',
    'KeyS',
    'KeyT',
    'KeyU',
    'KeyW',
    'KeyX',
    'KeyY',
    'KeyZ',
    'Minus',
    'BracketRight',
    'Tab',
  ]);
  if (codes.has(event.code)) return true;
  if (event.shiftKey && (event.code === 'KeyT' || event.code === 'KeyW' || event.code === 'Slash')) {
    return true;
  }

  return false;
}

export { DEFAULT_TERMINAL_PROFILE };
