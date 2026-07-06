import type { RefObject } from 'react';
import {
  CMD_LINE_HEIGHT_PX,
  CMD_PAGE_SCROLL_RATIO,
  deleteAfterCursor,
  deleteBeforeCursor,
  formatCmdShortcutsHelp,
} from '../config/cmd-shortcuts';
import { DEFAULT_TERMINAL_PROFILE, type ShellProfileId } from '../config/terminal-profiles';

interface HistoryState {
  items: string[];
  index: number;
}

export interface CmdKeyboardContext {
  command: string;
  setCommand: (value: string) => void;
  sessionId: string | undefined;
  sessions: Array<{ id: string }>;
  activeSessionId: string;
  setActiveSessionId: (id: string) => void;
  onNewSession: (profileId?: ShellProfileId) => void;
  onCloseSession: (id: string) => void;
  onInterrupt: () => void;
  onShowShortcuts: (text: string) => void;
  terminalBodyRef: RefObject<HTMLElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
}

export interface CmdKeyboardRefs {
  history: Map<string, HistoryState>;
  markMode: boolean;
  blockMode: boolean;
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

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function readClipboard(): Promise<string> {
  try {
    return await navigator.clipboard.readText();
  } catch {
    return '';
  }
}

function getSelectedText(input: HTMLInputElement): string {
  const start = input.selectionStart ?? 0;
  const end = input.selectionEnd ?? 0;
  if (start === end) {
    const docSelection = window.getSelection()?.toString() ?? '';
    return docSelection;
  }
  return input.value.slice(start, end);
}

function scrollBodyByLines(body: HTMLElement, lines: number) {
  body.scrollBy({ top: lines * CMD_LINE_HEIGHT_PX, behavior: 'auto' });
}

function scrollBodyByPage(body: HTMLElement, direction: 1 | -1) {
  const delta = body.clientHeight * CMD_PAGE_SCROLL_RATIO * direction;
  body.scrollBy({ top: delta, behavior: 'auto' });
}

function scrollBodyToTop(body: HTMLElement) {
  body.scrollTo({ top: 0, behavior: 'auto' });
}

function scrollBodyToBottom(body: HTMLElement) {
  body.scrollTo({ top: body.scrollHeight, behavior: 'auto' });
}

function focusCommandInput(ctx: CmdKeyboardContext) {
  ctx.inputRef.current?.focus({ preventScroll: false });
  scrollBodyToBottom(ctx.terminalBodyRef.current!);
}

function collectOutputText(body: HTMLElement): string {
  const nodes = body.querySelectorAll<HTMLElement>('.ws-terminal-text');
  return Array.from(nodes)
    .map((node) => node.textContent ?? '')
    .join('\n');
}

function moveMarkSelection(body: HTMLElement, key: string, extend: boolean) {
  const selection = window.getSelection();
  if (!selection) return;

  if (!extend && selection.isCollapsed && selection.rangeCount === 0) {
    const texts = body.querySelectorAll('.ws-terminal-text');
    const last = texts[texts.length - 1];
    if (last) {
      const range = document.createRange();
      range.selectNodeContents(last);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    return;
  }

  const modify = (
    selection as Selection & { modify?: (action: string, direction: string, granularity: string) => void }
  ).modify;

  if (typeof modify === 'function') {
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      modify(extend ? 'extend' : 'move', key === 'ArrowLeft' ? 'backward' : 'forward', 'character');
      return;
    }
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      modify(extend ? 'extend' : 'move', key === 'ArrowUp' ? 'backward' : 'forward', 'line');
    }
    return;
  }

  if (key === 'ArrowUp' || key === 'ArrowDown') {
    scrollBodyByLines(body, key === 'ArrowUp' ? -1 : 1);
  }
}

export function createCmdKeyboardRefs(history: Map<string, HistoryState>): CmdKeyboardRefs {
  return { history, markMode: false, blockMode: false };
}

export function setCmdMarkMode(refs: CmdKeyboardRefs, enabled: boolean, body: HTMLElement | null) {
  refs.markMode = enabled;
  refs.blockMode = false;
  if (body) {
    body.dataset.cmdMarkMode = enabled ? 'true' : 'false';
    body.classList.toggle('ws-terminal-mark-mode', enabled);
    if (enabled) {
      body.focus({ preventScroll: true });
      const texts = body.querySelectorAll('.ws-terminal-text');
      const last = texts[texts.length - 1];
      if (last) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(last);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }
}

export function handleCmdInputKeyDown(
  event: React.KeyboardEvent<HTMLInputElement>,
  ctx: CmdKeyboardContext,
  refs: CmdKeyboardRefs,
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
    onInterrupt,
    onShowShortcuts,
    terminalBodyRef,
  } = ctx;

  const mod = hasMod(event);
  const start = input.selectionStart ?? 0;
  const end = input.selectionEnd ?? 0;
  const hasSelection = start !== end;
  const body = terminalBodyRef.current;

  const stop = () => {
    event.preventDefault();
    event.stopPropagation();
  };

  if (event.key === 'F1') {
    stop();
    onShowShortcuts(formatCmdShortcutsHelp());
    return true;
  }

  if (mod && event.code === 'KeyM' && !event.shiftKey && !event.altKey) {
    stop();
    if (body) setCmdMarkMode(refs, !refs.markMode, body);
    return true;
  }

  if (mod && event.code === 'Insert' && !event.shiftKey) {
    stop();
    const text = getSelectedText(input);
    if (text) void copyText(text);
    return true;
  }

  if ((mod && event.code === 'KeyV' && !event.shiftKey) || (event.shiftKey && event.code === 'Insert')) {
    stop();
    void readClipboard().then((text) => {
      if (!text) return;
      const next = command.slice(0, start) + text + command.slice(end);
      setInputState(input, next, start + text.length, setCommand);
    });
    return true;
  }

  if (mod && event.code === 'KeyC' && !event.shiftKey) {
    if (hasSelection) {
      stop();
      void copyText(command.slice(start, end));
      return true;
    }
    stop();
    setCommand('');
    onInterrupt();
    return true;
  }

  if (mod && event.code === 'Home') {
    stop();
    if (command.length === 0 && body) {
      scrollBodyToTop(body);
    } else {
      const result = deleteBeforeCursor(command, start);
      setInputState(input, result.value, result.cursor, setCommand);
    }
    return true;
  }

  if (mod && event.code === 'End') {
    stop();
    if (command.length === 0 && body) {
      focusCommandInput(ctx);
    } else {
      const result = deleteAfterCursor(command, start);
      setInputState(input, result.value, result.cursor, setCommand);
    }
    return true;
  }

  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    if (!sessionId) return false;
    const state = refs.history.get(sessionId) ?? { items: [], index: -1 };
    if (state.items.length === 0) return false;
    stop();
    if (event.key === 'ArrowUp') {
      const nextIdx = state.index < 0 ? state.items.length - 1 : Math.max(0, state.index - 1);
      state.index = nextIdx;
      const item = state.items[nextIdx] ?? '';
      setInputState(input, item, item.length, setCommand);
    } else {
      const nextIdx = state.index < 0 ? 0 : Math.min(state.items.length - 1, state.index + 1);
      if (state.index < 0 || nextIdx === state.index) {
        state.index = -1;
        setInputState(input, '', 0, setCommand);
      } else {
        state.index = nextIdx;
        const item = state.items[nextIdx] ?? '';
        setInputState(input, item, item.length, setCommand);
      }
    }
    refs.history.set(sessionId, state);
    return true;
  }

  if (mod && event.code === 'ArrowUp' && body) {
    stop();
    scrollBodyByLines(body, -1);
    return true;
  }

  if (mod && event.code === 'ArrowDown' && body) {
    stop();
    scrollBodyByLines(body, 1);
    return true;
  }

  if (mod && event.shiftKey && event.code === 'KeyT' && !event.altKey) {
    stop();
    onNewSession('cmd');
    return true;
  }

  if (mod && event.shiftKey && event.code === 'KeyW' && !event.altKey) {
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

  if (refs.markMode && body) {
    setCmdMarkMode(refs, false, body);
  }

  return false;
}

export function handleCmdBodyKeyDown(
  event: React.KeyboardEvent<HTMLElement>,
  ctx: CmdKeyboardContext,
  refs: CmdKeyboardRefs,
): boolean {
  const body = event.currentTarget;
  const mod = hasMod(event);
  const input = ctx.inputRef.current;

  const stop = () => {
    event.preventDefault();
    event.stopPropagation();
  };

  if (mod && event.code === 'KeyM' && !event.shiftKey && !event.altKey) {
    stop();
    setCmdMarkMode(refs, !refs.markMode, body);
    return true;
  }

  if (mod && event.code === 'KeyC' && !event.shiftKey) {
    const selected = window.getSelection()?.toString() ?? '';
    if (selected) {
      stop();
      void copyText(selected);
      return true;
    }
  }

  if (mod && event.code === 'Insert' && !event.shiftKey) {
    stop();
    const selected = window.getSelection()?.toString() ?? '';
    if (selected) void copyText(selected);
    return true;
  }

  if ((mod && event.code === 'KeyV') || (event.shiftKey && event.code === 'Insert')) {
    stop();
    if (input) {
      void readClipboard().then((text) => {
        if (!text) return;
        input.focus();
        const start = input.selectionStart ?? ctx.command.length;
        const end = input.selectionEnd ?? start;
        const next = ctx.command.slice(0, start) + text + ctx.command.slice(end);
        setInputState(input, next, start + text.length, ctx.setCommand);
      });
    }
    return true;
  }

  if (mod && event.code === 'ArrowUp') {
    stop();
    scrollBodyByLines(body, -1);
    return true;
  }

  if (mod && event.code === 'ArrowDown') {
    stop();
    scrollBodyByLines(body, 1);
    return true;
  }

  if (!refs.markMode) return false;

  if (event.altKey && event.key.startsWith('Arrow')) {
    stop();
    refs.blockMode = true;
    body.dataset.cmdBlockMode = 'true';
    moveMarkSelection(body, event.key, true);
    return true;
  }

  if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    stop();
    moveMarkSelection(body, event.key, event.shiftKey);
    return true;
  }

  if (event.key === 'PageUp') {
    stop();
    scrollBodyByPage(body, -1);
    moveMarkSelection(body, 'ArrowUp', event.shiftKey);
    return true;
  }

  if (event.key === 'PageDown') {
    stop();
    scrollBodyByPage(body, 1);
    moveMarkSelection(body, 'ArrowDown', event.shiftKey);
    return true;
  }

  if (mod && event.code === 'Home') {
    stop();
    scrollBodyToTop(body);
    if (refs.markMode) {
      const selection = window.getSelection();
      const first = body.querySelector('.ws-terminal-text');
      if (selection && first) {
        selection.removeAllRanges();
        const range = document.createRange();
        range.setStart(first, 0);
        range.collapse(true);
        selection.addRange(range);
      }
    } else if (ctx.command.length === 0) {
      scrollBodyToTop(body);
    }
    return true;
  }

  if (mod && event.code === 'End') {
    stop();
    if (refs.markMode) {
      scrollBodyToBottom(body);
      const selection = window.getSelection();
      selection?.collapseToEnd();
    } else {
      focusCommandInput(ctx);
    }
    return true;
  }

  if (event.key === 'Escape') {
    stop();
    setCmdMarkMode(refs, false, body);
    input?.focus();
    return true;
  }

  if (event.key === 'Enter' && refs.markMode) {
    stop();
    const selected = window.getSelection()?.toString() ?? collectOutputText(body);
    if (selected) void copyText(selected);
    setCmdMarkMode(refs, false, body);
    input?.focus();
    return true;
  }

  return false;
}

export function resetCmdKeyboardState(refs: CmdKeyboardRefs, body: HTMLElement | null) {
  setCmdMarkMode(refs, false, body);
}

export function isCmdTerminalShortcut(event: KeyboardEvent): boolean {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;

  const onInput =
    target.hasAttribute('data-terminal-input') &&
    target.getAttribute('data-terminal-profile') === 'cmd';
  const onBody =
    target.hasAttribute('data-terminal-body') &&
    target.getAttribute('data-terminal-profile') === 'cmd';

  if (!onInput && !onBody) return false;

  if (event.key === 'F1') return true;
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') return onInput;
  if (event.key === 'PageUp' || event.key === 'PageDown') return onBody;
  if (event.key === 'Escape') return onBody;
  if (event.altKey && event.key.startsWith('Arrow')) return onBody;

  if (!hasMod(event)) return false;

  const codes = new Set([
    'KeyC',
    'KeyV',
    'KeyM',
    'Insert',
    'Home',
    'End',
    'ArrowUp',
    'ArrowDown',
    'Tab',
  ]);
  if (codes.has(event.code)) return true;
  if (event.shiftKey && (event.code === 'Insert' || event.code === 'KeyT' || event.code === 'KeyW')) {
    return true;
  }

  return false;
}

export { DEFAULT_TERMINAL_PROFILE, formatCmdShortcutsHelp };
