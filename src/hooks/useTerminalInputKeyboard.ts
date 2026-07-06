import { useCallback, useRef, type RefObject } from 'react';
import { DEFAULT_TERMINAL_PROFILE, type ShellProfileId } from '../config/terminal-profiles';
import {
  deleteWordLeft,
  deleteWordRight,
  formatPowerShellShortcutsHelp,
  transformSelection,
} from '../config/powershell-shortcuts';
import {
  createBashKeyboardRefs,
  handleBashTerminalKeyDown,
  isBashTerminalShortcut,
  resetBashLineState,
} from './bash-terminal-keyboard';
import {
  createCmdKeyboardRefs,
  handleCmdBodyKeyDown,
  handleCmdInputKeyDown,
  isCmdTerminalShortcut,
  resetCmdKeyboardState,
} from './cmd-terminal-keyboard';

interface HistoryState {
  items: string[];
  index: number;
}

export interface TerminalInputKeyboardOptions {
  profileId: ShellProfileId;
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
  onGoToOutput: () => void;
  onSubmitCommand?: (command: string) => void;
  cwd?: string;
  terminalBodyRef: RefObject<HTMLElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
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

function handlePowerShellKeyDown(
  event: React.KeyboardEvent<HTMLInputElement>,
  options: TerminalInputKeyboardOptions,
  historyRef: RefObject<Map<string, HistoryState>>,
): boolean {
  const input = event.currentTarget;
  const {
    command,
    setCommand,
    sessionId,
    sessions,
    activeSessionId,
    setActiveSessionId,
    onNewSession,
    onCloseSession,
    onClearScreen,
    onInterrupt,
    onShowShortcuts,
    onGoToOutput,
  } = options;

  const mod = hasMod(event);
  const start = input.selectionStart ?? 0;
  const end = input.selectionEnd ?? 0;
  const hasSelection = start !== end;

  const stop = () => {
    event.preventDefault();
    event.stopPropagation();
  };

  if (event.key === 'F1') {
    stop();
    onShowShortcuts(formatPowerShellShortcutsHelp());
    return true;
  }

  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    if (!sessionId) return false;
    const state = historyRef.current.get(sessionId) ?? { items: [], index: -1 };
    if (state.items.length === 0) return false;
    stop();
    if (event.key === 'ArrowUp') {
      const nextIdx =
        state.index < 0 ? state.items.length - 1 : Math.max(0, state.index - 1);
      state.index = nextIdx;
      setCommand(state.items[nextIdx] ?? '');
    } else {
      const nextIdx =
        state.index < 0 ? 0 : Math.min(state.items.length - 1, state.index + 1);
      if (state.index < 0 || nextIdx === state.index) {
        state.index = -1;
        setCommand('');
      } else {
        state.index = nextIdx;
        setCommand(state.items[nextIdx] ?? '');
      }
    }
    historyRef.current.set(sessionId, state);
    return true;
  }

  if (mod && event.code === 'KeyT' && !event.shiftKey && !event.altKey) {
    stop();
    onNewSession(DEFAULT_TERMINAL_PROFILE);
    return true;
  }

  if (mod && event.code === 'KeyW' && !event.shiftKey && !event.altKey) {
    stop();
    onCloseSession(activeSessionId);
    return true;
  }

  if (mod && event.code === 'Tab') {
    const nextId = cycleSession(sessions, activeSessionId, event.shiftKey ? -1 : 1);
    if (nextId) {
      stop();
      setActiveSessionId(nextId);
    }
    return true;
  }

  if (mod && event.code === 'KeyL' && !event.shiftKey) {
    stop();
    onClearScreen();
    return true;
  }

  if (mod && event.shiftKey && event.code === 'KeyO') {
    stop();
    onGoToOutput();
    return true;
  }

  if (mod && event.code === 'KeyD' && !event.shiftKey) {
    stop();
    input.focus();
    return true;
  }

  if (mod && event.code === 'KeyC' && !hasSelection) {
    stop();
    setCommand('');
    onInterrupt();
    return true;
  }

  if (mod && event.code === 'Backspace') {
    stop();
    if (hasSelection) {
      const next = command.slice(0, start) + command.slice(end);
      setCommand(next);
      requestAnimationFrame(() => input.setSelectionRange(start, start));
    } else {
      const result = deleteWordLeft(command, start);
      setCommand(result.value);
      requestAnimationFrame(() => input.setSelectionRange(result.cursor, result.cursor));
    }
    return true;
  }

  if (mod && event.code === 'Delete') {
    stop();
    if (hasSelection) {
      const next = command.slice(0, start) + command.slice(end);
      setCommand(next);
      requestAnimationFrame(() => input.setSelectionRange(start, start));
    } else {
      const result = deleteWordRight(command, start);
      setCommand(result.value);
      requestAnimationFrame(() => input.setSelectionRange(result.cursor, result.cursor));
    }
    return true;
  }

  if (mod && event.shiftKey && event.code === 'KeyU') {
    if (!hasSelection) return false;
    stop();
    const result = transformSelection(command, start, end, (t) => t.toUpperCase());
    setCommand(result.value);
    requestAnimationFrame(() => input.setSelectionRange(result.start, result.end));
    return true;
  }

  if (mod && event.code === 'KeyU' && !event.shiftKey) {
    if (!hasSelection) return false;
    stop();
    const result = transformSelection(command, start, end, (t) => t.toLowerCase());
    setCommand(result.value);
    requestAnimationFrame(() => input.setSelectionRange(result.start, result.end));
    return true;
  }

  return false;
}

export function useTerminalInputKeyboard(options: TerminalInputKeyboardOptions) {
  const historyRef = useRef<Map<string, HistoryState>>(new Map());
  const bashRefs = useRef(createBashKeyboardRefs(historyRef.current));
  const cmdRefs = useRef(createCmdKeyboardRefs(historyRef.current));
  const optionsRef = useRef(options);
  optionsRef.current = options;
  bashRefs.current.history = historyRef.current;
  cmdRefs.current.history = historyRef.current;

  const pushHistory = useCallback((sessionId: string, entry: string) => {
    const trimmed = entry.trim();
    if (!trimmed) return;
    const map = historyRef.current;
    const state = map.get(sessionId) ?? { items: [], index: -1 };
    if (state.items[state.items.length - 1] !== trimmed) {
      state.items.push(trimmed);
    }
    state.index = -1;
    map.set(sessionId, state);
  }, []);

  const getHistoryItems = useCallback((sessionId: string): string[] => {
    return historyRef.current.get(sessionId)?.items ?? [];
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const opts = optionsRef.current;

    let handled = false;
    if (opts.profileId === 'git-bash') {
      handled = handleBashTerminalKeyDown(event, opts, bashRefs.current);
    } else if (opts.profileId === 'cmd') {
      handled = handleCmdInputKeyDown(event, opts, cmdRefs.current);
    } else {
      handled = handlePowerShellKeyDown(event, opts, historyRef);
    }

    if (handled) return;

    if (event.key === 'Enter') {
      if (opts.profileId === 'git-bash') resetBashLineState(input, bashRefs.current);
      if (opts.profileId === 'cmd') {
        resetCmdKeyboardState(cmdRefs.current, opts.terminalBodyRef.current);
      }
    }
  }, []);

  const handleBodyKeyDown = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    const opts = optionsRef.current;
    if (opts.profileId !== 'cmd') return;
    handleCmdBodyKeyDown(event, opts, cmdRefs.current);
  }, []);

  const onInputFocus = useCallback((input: HTMLInputElement) => {
    const opts = optionsRef.current;
    if (opts.profileId === 'git-bash') {
      resetBashLineState(input, bashRefs.current);
    }
    if (opts.profileId === 'cmd' && opts.terminalBodyRef.current) {
      resetCmdKeyboardState(cmdRefs.current, opts.terminalBodyRef.current);
    }
  }, []);

  return { handleKeyDown, handleBodyKeyDown, pushHistory, getHistoryItems, onInputFocus };
}

/** Keys handled by terminal input — global workspace handler should defer. */
export function isTerminalInputShortcut(event: KeyboardEvent): boolean {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;

  if (target.getAttribute('data-terminal-profile') === 'git-bash') {
    return target.hasAttribute('data-terminal-input') && isBashTerminalShortcut(event);
  }

  if (target.getAttribute('data-terminal-profile') === 'cmd') {
    return isCmdTerminalShortcut(event);
  }

  if (!target.hasAttribute('data-terminal-input')) return false;

  if (event.key === 'F1') return true;
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') return true;

  if (!hasMod(event)) return false;

  const codes = new Set([
    'KeyT',
    'KeyW',
    'KeyL',
    'KeyU',
    'KeyD',
    'KeyC',
    'Backspace',
    'Delete',
    'Tab',
  ]);
  if (codes.has(event.code)) return true;
  if (event.shiftKey && event.code === 'KeyO') return true;

  return false;
}

export function isPowerShellTerminalShortcut(event: KeyboardEvent): boolean {
  return isTerminalInputShortcut(event);
}
