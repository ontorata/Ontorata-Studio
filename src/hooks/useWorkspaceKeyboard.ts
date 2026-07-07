import { useEffect, useRef, type RefObject } from 'react';
import { useAuth } from './useAuth';
import { isTerminalInputShortcut } from './useTerminalInputKeyboard';
import { useWorkspaceTabs } from './useWorkspaceTabs';

const CHORD_TIMEOUT_MS = 2000;

function isCodeEditorTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.closest('.cm-editor') !== null;
}

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
  const { isAuthenticated } = useAuth();
  const { openFolder, openWorkspace, openTab, toggleSidebar, toggleAiPanel, toggleTerminal } =
    useWorkspaceTabs();
  const actionsRef = useRef({
    openFolder,
    openWorkspace,
    openTab,
    toggleSidebar,
    toggleAiPanel,
    toggleTerminal,
    isAuthenticated,
  });
  const chordRef = useRef(false);
  const chordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    actionsRef.current = {
      openFolder,
      openWorkspace,
      openTab,
      toggleSidebar,
      toggleAiPanel,
      toggleTerminal,
      isAuthenticated,
    };
  }, [openFolder, openWorkspace, openTab, toggleSidebar, toggleAiPanel, toggleTerminal, isAuthenticated]);

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
      if (target.closest('input, textarea, select, [contenteditable="true"], .cm-editor')) return;
      if (!shellEl.contains(target)) return;
      shellEl.focus({ preventScroll: true });
    }

    function handleShortcut(event: KeyboardEvent): boolean {
      if (event.repeat) return false;

      if (isTerminalInputShortcut(event)) return false;

      // Code editor owns VS Code keybindings — do not run workspace shortcuts.
      if (isCodeEditorTarget(event.target)) return false;

      const mod = hasPrimaryMod(event);
      const { openFolder, openWorkspace, openTab, toggleSidebar, toggleAiPanel, toggleTerminal } =
        actionsRef.current;

      if (mod && !event.altKey && !event.shiftKey && event.code === 'KeyK') {
        armChord();
        return true;
      }

      if (chordRef.current && mod && !event.altKey && event.code === 'KeyO') {
        disarmChord();
        if (!actionsRef.current.isAuthenticated) return false;
        void openFolder();
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
        if (!actionsRef.current.isAuthenticated) return false;
        toggleTerminal();
        return true;
      }

      if (isEditableTarget(event.target)) return false;

      if (mod && event.shiftKey && event.code === 'KeyO') {
        if (!actionsRef.current.isAuthenticated) return false;
        void openWorkspace();
        return true;
      }
      if (mod && !event.altKey && !event.shiftKey && event.code === 'KeyO') {
        openTab('');
        return true;
      }
      if (!mod && !event.altKey && isSlash(event)) {
        if (!actionsRef.current.isAuthenticated) return false;
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
