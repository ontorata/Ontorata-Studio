import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_TERMINAL_PROFILE,
  getTerminalProfile,
  TERMINAL_PROFILES,
  type ShellProfileId,
} from '../../config/terminal-profiles';
import { tryRunShellCommand } from '../../domain/terminal/shell-commands';
import {
  formatCommandNotFoundError,
  formatGenericError,
} from '../../domain/terminal/powershell-errors';
import { useConnection } from '../../hooks/useConnection';
import { useStudioClient } from '../../hooks/useStudioClient';
import { expandBashHistory } from '../../config/git-bash-shortcuts';
import { useTerminalInputKeyboard } from '../../hooks/useTerminalInputKeyboard';
import { useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';

type PanelTab = 'terminal' | 'output' | 'problems';

interface TerminalLine {
  id: string;
  kind: 'input' | 'output' | 'error' | 'system';
  text: string;
  status?: 'success' | 'error';
}

interface ProblemItem {
  id: string;
  severity: 'error' | 'warning';
  message: string;
  source?: string;
}

interface TerminalSession {
  id: string;
  profileId: ShellProfileId;
  title: string;
  cwd: string;
  lines: TerminalLine[];
}

const PANEL_TABS: Array<{ id: PanelTab; label: string }> = [
  { id: 'terminal', label: 'Terminal' },
  { id: 'output', label: 'Output' },
  { id: 'problems', label: 'Problems' },
];

const SESSIONS_WIDTH_STORAGE_KEY = 'ontorata-studio.ws-terminal-sessions-width';
const SESSIONS_WIDTH_DEFAULT = 124;
const SESSIONS_WIDTH_MIN = 88;
const SESSIONS_WIDTH_MAX = 288;

function readSessionsWidth(): number {
  try {
    const raw = localStorage.getItem(SESSIONS_WIDTH_STORAGE_KEY);
    if (!raw) return SESSIONS_WIDTH_DEFAULT;
    const value = Number(raw);
    if (!Number.isFinite(value)) return SESSIONS_WIDTH_DEFAULT;
    return Math.min(SESSIONS_WIDTH_MAX, Math.max(SESSIONS_WIDTH_MIN, value));
  } catch {
    return SESSIONS_WIDTH_DEFAULT;
  }
}

function nextSessionTitle(profileId: ShellProfileId): string {
  return getTerminalProfile(profileId).shortTitle;
}

function createSession(profileId: ShellProfileId = DEFAULT_TERMINAL_PROFILE): TerminalSession {
  const profile = getTerminalProfile(profileId);
  return {
    id: crypto.randomUUID(),
    profileId,
    title: nextSessionTitle(profileId),
    cwd: profile.defaultCwd,
    lines: profile.welcome
      ? [{ id: crypto.randomUUID(), kind: 'system', text: profile.welcome }]
      : [],
  };
}

export function WorkspaceTerminal() {
  const client = useStudioClient();
  const { hasActiveConnection } = useConnection();
  const { setShowTerminal, showTerminal } = useWorkspaceTabs();
  const [activeTab, setActiveTab] = useState<PanelTab>('terminal');
  const [sessions, setSessions] = useState<TerminalSession[]>(() => [createSession()]);
  const [activeSessionId, setActiveSessionId] = useState(() => sessions[0]?.id ?? '');
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [outputLines, setOutputLines] = useState<TerminalLine[]>([]);
  const [command, setCommand] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [splitMenuOpen, setSplitMenuOpen] = useState(false);
  const [dragSessionId, setDragSessionId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [sessionsWidth, setSessionsWidth] = useState(readSessionsWidth);
  const [isResizingSessions, setIsResizingSessions] = useState(false);
  const sessionsWidthRef = useRef(sessionsWidth);
  const bottomRef = useRef<HTMLDivElement>(null);
  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? sessions[0];

  sessionsWidthRef.current = sessionsWidth;

  useEffect(() => {
    if (showTerminal && sessions.length === 0) {
      const session = createSession();
      setSessions([session]);
      setActiveSessionId(session.id);
    }
  }, [showTerminal, sessions.length]);

  useEffect(() => {
    if (sessions.length && !sessions.some((s) => s.id === activeSessionId)) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.lines, activeTab, outputLines]);

  useEffect(() => {
    if (showTerminal && activeTab === 'terminal') {
      inputRef.current?.focus();
    }
  }, [showTerminal, activeTab, activeSessionId]);

  useEffect(() => {
    if (!profileMenuOpen && !splitMenuOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
        setSplitMenuOpen(false);
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [profileMenuOpen, splitMenuOpen]);

  function appendOutput(kind: TerminalLine['kind'], text: string) {
    setOutputLines((prev) => [...prev, { id: crypto.randomUUID(), kind, text }]);
  }

  function updateSession(sessionId: string, updater: (session: TerminalSession) => TerminalSession) {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? updater(s) : s)));
  }

  function appendSessionLine(
    sessionId: string,
    kind: TerminalLine['kind'],
    text: string,
    status?: TerminalLine['status'],
  ) {
    updateSession(sessionId, (session) => ({
      ...session,
      lines: [...session.lines, { id: crypto.randomUUID(), kind, text, status }],
    }));
    if (kind === 'output' || kind === 'system') appendOutput(kind, text);
  }

  function appendInputLine(sessionId: string, text: string): string {
    const id = crypto.randomUUID();
    updateSession(sessionId, (session) => ({
      ...session,
      lines: [...session.lines, { id, kind: 'input', text, status: 'success' }],
    }));
    return id;
  }

  function markInputLineStatus(sessionId: string, lineId: string, status: 'success' | 'error') {
    updateSession(sessionId, (session) => ({
      ...session,
      lines: session.lines.map((line) =>
        line.id === lineId ? { ...line, status } : line,
      ),
    }));
  }

  function addProblem(severity: ProblemItem['severity'], message: string, source = 'terminal') {
    setProblems((prev) => [...prev, { id: crypto.randomUUID(), severity, message, source }]);
  }

  function addSession(profileId: ShellProfileId = DEFAULT_TERMINAL_PROFILE) {
    setSessions((prev) => {
      const session = createSession(profileId);
      setActiveSessionId(session.id);
      return [...prev, session];
    });
    setProfileMenuOpen(false);
    setSplitMenuOpen(false);
  }

  function splitSession(profileId?: ShellProfileId) {
    const id = profileId ?? activeSession?.profileId ?? DEFAULT_TERMINAL_PROFILE;
    addSession(id);
  }

  function closeSession(sessionId: string) {
    const isLastSession = sessions.length === 1;

    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== sessionId);
      if (activeSessionId === sessionId && next.length > 0) {
        setActiveSessionId(next[0].id);
      }
      return next;
    });

    if (isLastSession) {
      setActiveSessionId('');
      setShowTerminal(false);
    }
  }

  function reorderSessions(fromId: string, toId: string) {
    if (fromId === toId) return;
    setSessions((prev) => {
      const fromIdx = prev.findIndex((s) => s.id === fromId);
      const toIdx = prev.findIndex((s) => s.id === toId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }

  function onSessionDragStart(event: React.DragEvent, sessionId: string) {
    setDragSessionId(sessionId);
    event.dataTransfer.setData('application/x-terminal-session', sessionId);
    event.dataTransfer.effectAllowed = 'move';
  }

  function onSessionDragOver(event: React.DragEvent, sessionId: string) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (dragSessionId && dragSessionId !== sessionId) {
      setDropTargetId(sessionId);
    }
  }

  function onSessionDrop(event: React.DragEvent, sessionId: string) {
    event.preventDefault();
    const fromId =
      event.dataTransfer.getData('application/x-terminal-session') || dragSessionId;
    if (fromId) reorderSessions(fromId, sessionId);
    setDragSessionId(null);
    setDropTargetId(null);
  }

  function onSessionDragEnd() {
    setDragSessionId(null);
    setDropTargetId(null);
  }

  function onSessionsResizeStart(event: React.MouseEvent) {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sessionsWidthRef.current;

    function onMove(ev: MouseEvent) {
      const next = Math.min(
        SESSIONS_WIDTH_MAX,
        Math.max(SESSIONS_WIDTH_MIN, startWidth + (startX - ev.clientX)),
      );
      setSessionsWidth(next);
    }

    function onUp() {
      try {
        localStorage.setItem(SESSIONS_WIDTH_STORAGE_KEY, String(sessionsWidthRef.current));
      } catch {
        /* ignore storage errors */
      }
      setIsResizingSessions(false);
      document.body.classList.remove('ws-resizing-terminal-sessions');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    setIsResizingSessions(true);
    document.body.classList.add('ws-resizing-terminal-sessions');
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  async function runCommand(session: TerminalSession, raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const profile = getTerminalProfile(session.profileId);
    const prompt = profile.formatPrompt(session.cwd);
    const inputLineId = appendInputLine(session.id, `${prompt} ${trimmed}`);

    let commandFailed = false;

    const shellResult = tryRunShellCommand(trimmed, {
      profileId: session.profileId,
      cwd: session.cwd,
      appendOutput: (text) => {
        if (text) appendSessionLine(session.id, 'output', text);
      },
      appendError: (text) => {
        commandFailed = true;
        appendSessionLine(session.id, 'error', text);
        addProblem('warning', text.split('\n')[0] ?? text, profile.label);
      },
      setCwd: (cwd) => updateSession(session.id, (s) => ({ ...s, cwd })),
      clearLines: () => updateSession(session.id, (s) => ({ ...s, lines: [] })),
    });

    if (shellResult.kind === 'handled') {
      if (shellResult.failed || commandFailed) {
        markInputLineStatus(session.id, inputLineId, 'error');
      }
      return;
    }

    const cmd = trimmed.toLowerCase();

    if (cmd === 'output') {
      setActiveTab('output');
      return;
    }

    if (cmd === 'problems') {
      setActiveTab('problems');
      return;
    }

    if (cmd === 'status') {
      appendSessionLine(
        session.id,
        'output',
        `Ratary: ${hasActiveConnection ? 'connected' : 'offline'}\nWorkspace: ready\nShell: ${profile.label}\nCwd: ${session.cwd}`,
      );
      return;
    }

    if (cmd === 'health') {
      try {
        const h = await client.getHealth();
        appendSessionLine(session.id, 'output', JSON.stringify(h, null, 2));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Health check failed';
        markInputLineStatus(session.id, inputLineId, 'error');
        appendSessionLine(session.id, 'error', formatGenericError(message, trimmed));
        addProblem('error', message, 'health');
      }
      return;
    }

    if (cmd === 'memories') {
      try {
        const res = await client.searchMemories({ q: '', limit: 5 });
        const count = res.results?.length ?? 0;
        appendSessionLine(session.id, 'output', `Latest memories: ${count} shown (max 5)`);
        res.results?.forEach((m) =>
          appendSessionLine(session.id, 'output', `  - ${m.title ?? m.id}`),
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Search failed';
        markInputLineStatus(session.id, inputLineId, 'error');
        appendSessionLine(session.id, 'error', formatGenericError(message, trimmed));
        addProblem('error', message, 'memories');
      }
      return;
    }

    markInputLineStatus(session.id, inputLineId, 'error');
    const errorText = formatCommandNotFoundError(trimmed);
    appendSessionLine(session.id, 'error', errorText);
    addProblem('warning', errorText.split('\n')[0] ?? errorText, profile.label);
  }

  const { handleKeyDown: onTerminalKeyDown, handleBodyKeyDown, pushHistory, getHistoryItems, onInputFocus } =
    useTerminalInputKeyboard({
    profileId: activeSession?.profileId ?? DEFAULT_TERMINAL_PROFILE,
    command,
    setCommand,
    sessionId: activeSession?.id,
    sessions,
    activeSessionId,
    setActiveSessionId,
    onNewSession: (profileId) => addSession(profileId ?? DEFAULT_TERMINAL_PROFILE),
    onCloseSession: closeSession,
    onClearScreen: () => {
      if (!activeSession) return;
      updateSession(activeSession.id, (s) => ({ ...s, lines: [] }));
    },
    onInterrupt: () => {
      if (!activeSession) return;
      appendSessionLine(activeSession.id, 'system', '^C');
    },
    onShowShortcuts: (text) => {
      if (!activeSession) return;
      appendSessionLine(activeSession.id, 'output', text);
    },
    onGoToOutput: () => setActiveTab('output'),
    onSubmitCommand: (cmd) => {
      if (!activeSession) return;
      setCommand('');
      pushHistory(activeSession.id, cmd);
      void runCommand(activeSession, cmd);
    },
    cwd: activeSession?.cwd,
    terminalBodyRef,
    inputRef,
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!activeSession) return;
    let value = command;

    if (activeSession.profileId === 'git-bash') {
      if (/^!.+:p$/.test(value.trim())) {
        const expanded = expandBashHistory(value, getHistoryItems(activeSession.id));
        appendSessionLine(activeSession.id, 'output', expanded);
        setCommand('');
        return;
      }
      value = expandBashHistory(value, getHistoryItems(activeSession.id));
    }

    setCommand('');
    if (value.trim()) pushHistory(activeSession.id, value);
    void runCommand(activeSession, value);
  }

  function clearProblems() {
    setProblems([]);
  }

  const prompt = activeSession
    ? getTerminalProfile(activeSession.profileId).formatPrompt(activeSession.cwd)
    : '>';

  return (
    <div className="ws-terminal">
      <div className="ws-panel-header ws-terminal-header">
        <div className="ws-terminal-tabs" role="tablist" aria-label="Terminal panels">
          {PANEL_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`ws-terminal-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.id === 'problems' && problems.length > 0 && (
                <span className="ws-terminal-tab-badge">{problems.length}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'terminal' && (
          <div className="ws-terminal-actions" ref={menuRef}>
            <button
              type="button"
              className="ws-terminal-action"
              title="New Terminal (PowerShell)"
              aria-label="New PowerShell terminal"
              onClick={() => addSession(DEFAULT_TERMINAL_PROFILE)}
            >
              +
            </button>
            <div className="ws-terminal-profile-wrap">
              <button
                type="button"
                className="ws-terminal-action"
                title="New terminal profile"
                aria-label="Select terminal profile"
                aria-expanded={profileMenuOpen}
                onClick={() => {
                  setProfileMenuOpen((open) => !open);
                  setSplitMenuOpen(false);
                }}
              >
                ▾
              </button>
              {profileMenuOpen && (
                <ul className="ws-terminal-profile-menu" role="menu">
                  {TERMINAL_PROFILES.map((profile) => (
                    <li key={profile.id} role="none">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => addSession(profile.id)}
                      >
                        {profile.label}
                      </button>
                    </li>
                  ))}
                  <li className="ws-terminal-menu-divider" role="separator" />
                  <li role="none" className="ws-terminal-menu-split">
                    <button
                      type="button"
                      role="menuitem"
                      aria-expanded={splitMenuOpen}
                      onClick={() => setSplitMenuOpen((open) => !open)}
                    >
                      Split Terminal
                      <span aria-hidden>›</span>
                    </button>
                    {splitMenuOpen && (
                      <ul className="ws-terminal-profile-menu ws-terminal-split-menu" role="menu">
                        {TERMINAL_PROFILES.map((profile) => (
                          <li key={profile.id} role="none">
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => splitSession(profile.id)}
                            >
                              {profile.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                </ul>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          className="ws-panel-close"
          aria-label="Close terminal"
          onClick={() => setShowTerminal(false)}
        >
          ×
        </button>
      </div>

      {activeTab === 'terminal' && activeSession && (
        <div className="ws-terminal-workspace">
          <div className="ws-terminal-main">
            <div
              ref={terminalBodyRef}
              className="ws-terminal-body ws-terminal-body-cursor"
              role="tabpanel"
              aria-label="Terminal"
              data-terminal-body={activeSession.profileId === 'cmd' ? 'true' : undefined}
              data-terminal-profile={activeSession.profileId}
              tabIndex={activeSession.profileId === 'cmd' ? 0 : undefined}
              onKeyDown={activeSession.profileId === 'cmd' ? handleBodyKeyDown : undefined}
              onClick={() => inputRef.current?.focus()}
            >
              {activeSession.lines.map((line) => (
                <div
                  key={line.id}
                  className={`ws-terminal-row ws-terminal-row-${line.kind}${line.status === 'error' ? ' has-error' : ''}`}
                >
                  <span className="ws-terminal-gutter" aria-hidden>
                    {line.kind === 'input' && line.status === 'error' && (
                      <span className="ws-terminal-gutter-error" title="Command failed" />
                    )}
                  </span>
                  <pre className={`ws-terminal-text ws-terminal-line ${line.kind}`}>{line.text}</pre>
                </div>
              ))}

              <form className="ws-terminal-row ws-terminal-row-active" onSubmit={onSubmit}>
                <span className="ws-terminal-gutter" aria-hidden>
                  <span className="ws-terminal-gutter-active" />
                </span>
                <label className="ws-terminal-active-line">
                  <span className="ws-terminal-prompt">{prompt}</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={command}
                    data-terminal-input
                    data-terminal-profile={activeSession.profileId}
                    onKeyDown={onTerminalKeyDown}
                    onFocus={(e) => onInputFocus(e.currentTarget)}
                    onChange={(e) => setCommand(e.target.value)}
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    aria-label="Terminal command"
                    className="ws-terminal-inline-input"
                  />
                </label>
              </form>
              <div ref={bottomRef} />
            </div>
          </div>

          <aside
            className={`ws-terminal-sessions${isResizingSessions ? ' resizing' : ''}`}
            aria-label="Terminal sessions"
            style={{ width: sessionsWidth, minWidth: sessionsWidth }}
          >
            <div
              className="ws-terminal-sessions-resize"
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize terminal sessions"
              onMouseDown={onSessionsResizeStart}
            />
            {sessions.map((session) => {
              const profile = getTerminalProfile(session.profileId);
              const isActive = session.id === activeSessionId;
              const isDragging = dragSessionId === session.id;
              const isDropTarget = dropTargetId === session.id;
              const hasErrors = session.lines.some(
                (line) => line.kind === 'error' || line.status === 'error',
              );
              return (
                <div
                  key={session.id}
                  className={`ws-terminal-session${isActive ? ' active' : ''}${isDragging ? ' dragging' : ''}${isDropTarget ? ' drop-target' : ''}`}
                  draggable
                  onDragStart={(event) => onSessionDragStart(event, session.id)}
                  onDragOver={(event) => onSessionDragOver(event, session.id)}
                  onDrop={(event) => onSessionDrop(event, session.id)}
                  onDragEnd={onSessionDragEnd}
                  onDragLeave={() => {
                    if (dropTargetId === session.id) setDropTargetId(null);
                  }}
                >
                  <button
                    type="button"
                    className="ws-terminal-session-btn"
                    title={profile.label}
                    aria-label={`${profile.label} — ${session.title}`}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => setActiveSessionId(session.id)}
                  >
                    <span className="ws-terminal-session-icon" aria-hidden>
                      {profile.icon}
                    </span>
                    <span className="ws-terminal-session-title">{session.title}</span>
                    {hasErrors && !isActive && (
                      <span className="ws-terminal-session-warn" title="Has errors" aria-label="Has errors">
                        !
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="ws-terminal-session-close"
                    aria-label={`Close ${session.title}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      closeSession(session.id);
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                      <path
                        fillRule="evenodd"
                        d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3h11V2h-11v1z"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
          </aside>
        </div>
      )}

      {activeTab === 'output' && (
        <div className="ws-terminal-body ws-terminal-panel" role="tabpanel" aria-label="Output">
          {outputLines.length === 0 ? (
            <div className="ws-terminal-empty">No output yet. Run commands in the Terminal tab.</div>
          ) : (
            outputLines.map((line) => (
              <div key={line.id} className={`ws-terminal-line ${line.kind}`}>
                {line.text}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {activeTab === 'problems' && (
        <div className="ws-terminal-body ws-terminal-panel" role="tabpanel" aria-label="Problems">
          {problems.length === 0 ? (
            <div className="ws-terminal-empty">No problems detected.</div>
          ) : (
            <>
              <div className="ws-problems-toolbar">
                <span>
                  {problems.length} problem{problems.length === 1 ? '' : 's'}
                </span>
                <button type="button" className="ws-problems-clear" onClick={clearProblems}>
                  Clear all
                </button>
              </div>
              <ul className="ws-problems-list">
                {problems.map((problem) => (
                  <li key={problem.id} className={`ws-problem ws-problem-${problem.severity}`}>
                    <span className="ws-problem-icon" aria-hidden>
                      {problem.severity === 'error' ? '✕' : '⚠'}
                    </span>
                    <div className="ws-problem-body">
                      <span className="ws-problem-message">{problem.message}</span>
                      {problem.source && (
                        <span className="ws-problem-source">{problem.source}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
