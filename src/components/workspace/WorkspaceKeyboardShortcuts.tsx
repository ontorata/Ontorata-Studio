import { useEffect } from 'react';
import { useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/** Global workspace keyboard shortcuts (Cursor-style). */
export function WorkspaceKeyboardShortcuts() {
  const { openTab, toggleSidebar, toggleAiPanel, toggleTerminal } = useWorkspaceTabs();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const mod = event.ctrlKey || event.metaKey;

      if (mod && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        toggleSidebar();
        return;
      }
      if (mod && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        toggleAiPanel();
        return;
      }
      if (mod && event.key === '`') {
        event.preventDefault();
        toggleTerminal();
        return;
      }
      if (mod && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        openTab('');
        return;
      }
      if (event.key === '/' && !mod) {
        event.preventDefault();
        openTab('search', 'Search');
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openTab, toggleSidebar, toggleAiPanel, toggleTerminal]);

  return null;
}
