import { useEffect, useRef, type RefObject } from 'react';
import { isTerminalInputShortcut } from './useTerminalInputKeyboard';
import { useWorkspaceTabs } from './useWorkspaceTabs';

const CHORD_TIMEOUT_MS = 2000;

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target.closest('[contenteditable="true"]')) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function hasPrimaryMod(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey;
}

function isBacktick(event: KeyboardEvent): boolean {
  return event.code === 'Backquote' || event.key === '`' || event.key === '~';
}

function isSlash(event: KeyboardEvent): boolean {
  return event.code === 'Slash' || event.code === 'NumpadDivide' || event.key === '/';
}

/** Global workspace keyboard shortcuts with browser-safe fallbacks. */
export function useWorkspaceKeyboard(shellRef: RefObject<HTMLElement | null>) {
  const { openTab, toggleSidebar, toggleAiPanel, toggleTerminal } = useWorkspaceTabs();
  const actionsRef = useRef({ openTab, toggleSidebar, toggleAiPanel, toggleTerminal });
  const chordRef = useRef(false);
  const chordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    actionsRef.current = { openTab, toggleSidebar, toggleAiPanel, toggleTerminal };
  }, [openTab, toggleSidebar, toggleAiPanel, toggleTerminal]);

  useEffect(() => {
    const root = shellRef.current;
    if (!root) return;
    const shellEl: HTMLElement = root;

    function disarmChord() {
      chordRef.current = false;
      if (chordTimerRef.current) {
        clearTimeout(chordTimerRef.current);
        chordTimerRef.current = null;
      }
    }

    function armChord() {
      chordRef.current = true;
      if (chordTimerRef.current) clearTimeout(chordTimerRef.current);
      chordTimerRef.current = setTimeout(disarmChord, CHORD_TIMEOUT_MS);
    }

    function focusShellUnlessEditable(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (!shellEl.contains(target)) return;
      shellEl.focus({ preventScroll: true });
    }

    function handleShortcut(event: KeyboardEvent): boolean {
      if (event.repeat) return false;

      if (isTerminalInputShortcut(event)) return false;

      const mod = hasPrimaryMod(event);
      const { openTab, toggleSidebar, toggleAiPanel, toggleTerminal } = actionsRef.current;

      if (mod && !event.altKey && !event.shiftKey && event.code === 'KeyK') {
        armChord();
        return true;
      }

      if (chordRef.current && mod && !event.altKey && event.code === 'KeyO') {
        disarmChord();
        openTab('');
        return true;
      }
      if (chordRef.current && mod && !event.altKey && event.code === 'KeyJ') {
        disarmChord();
        toggleAiPanel();
        return true;
      }
      if (chordRef.current && mod && !event.altKey && event.code === 'KeyB') {
        disarmChord();
        toggleSidebar();
        return true;
      }
      if (chordRef.current) disarmChord();

      if (mod && !event.altKey && event.code === 'KeyB') {
        toggleSidebar();
        return true;
      }
      if (mod && event.altKey && event.code === 'KeyJ') {
        toggleAiPanel();
        return true;
      }
      if (mod && !event.altKey && !event.shiftKey && event.code === 'KeyJ') {
        toggleAiPanel();
        return true;
      }
      if (mod && isBacktick(event)) {
        toggleTerminal();
        return true;
      }

      if (isEditableTarget(event.target)) return false;

      if (mod && event.shiftKey && event.code === 'KeyO') {
        openTab('');
        return true;
      }
      if (mod && !event.altKey && !event.shiftKey && event.code === 'KeyO') {
        openTab('');
        return true;
      }
      if (!mod && !event.altKey && isSlash(event)) {
        openTab('search', 'Search');
        return true;
      }

      return false;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!handleShortcut(event)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    requestAnimationFrame(() => shellEl.focus({ preventScroll: true }));
    document.addEventListener('pointerdown', focusShellUnlessEditable, { capture: true });
    window.addEventListener('keydown', onKeyDown, { capture: true });

    return () => {
      disarmChord();
      document.removeEventListener('pointerdown', focusShellUnlessEditable, { capture: true });
      window.removeEventListener('keydown', onKeyDown, { capture: true });
    };
  }, [shellRef]);
}
