import { FormEvent, useEffect, useRef, useState } from 'react';
import { useConnection } from '../../hooks/useConnection';
import { useStudioClient } from '../../hooks/useStudioClient';
import { useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';

interface TerminalLine {
  id: string;
  kind: 'system' | 'input' | 'output' | 'error';
  text: string;
}

export function WorkspaceTerminal() {
  const client = useStudioClient();
  const { hasActiveConnection } = useConnection();
  const { setShowTerminal } = useWorkspaceTabs();
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'welcome',
      kind: 'system',
      text: 'Ontorata Studio terminal — type "help" for commands.',
    },
  ]);
  const [command, setCommand] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  function append(kind: TerminalLine['kind'], text: string) {
    setLines((prev) => [...prev, { id: crypto.randomUUID(), kind, text }]);
  }

  async function runCommand(raw: string) {
    const cmd = raw.trim().toLowerCase();
    append('input', `$ ${raw}`);

    if (!cmd || cmd === 'clear') {
      if (cmd === 'clear') setLines([]);
      return;
    }

    if (cmd === 'help') {
      append('output', 'Commands: help, clear, status, health, memories');
      return;
    }

    if (cmd === 'status') {
      append(
        'output',
        `Ratary: ${hasActiveConnection ? 'connected' : 'offline'}\nWorkspace: ready`,
      );
      return;
    }

    if (cmd === 'health') {
      try {
        const h = await client.getHealth();
        append('output', JSON.stringify(h, null, 2));
      } catch (err) {
        append('error', err instanceof Error ? err.message : 'Health check failed');
      }
      return;
    }

    if (cmd === 'memories') {
      try {
        const res = await client.searchMemories({ q: '', limit: 5 });
        const count = res.results?.length ?? 0;
        append('output', `Latest memories: ${count} shown (max 5)`);
        res.results?.forEach((m) => append('output', `  - ${m.title ?? m.id}`));
      } catch (err) {
        append('error', err instanceof Error ? err.message : 'Search failed');
      }
      return;
    }

    append('error', `Unknown command: ${raw}. Type "help".`);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = command;
    setCommand('');
    void runCommand(value);
  }

  return (
    <div className="ws-terminal">
      <div className="ws-panel-header ws-terminal-header">
        <div className="ws-terminal-tabs">
          <span className="active">Terminal</span>
          <span>Output</span>
          <span>Problems</span>
        </div>
        <button
          type="button"
          className="ws-panel-close"
          aria-label="Close terminal"
          onClick={() => setShowTerminal(false)}
        >
          ×
        </button>
      </div>

      <div className="ws-terminal-body">
        {lines.map((line) => (
          <div key={line.id} className={`ws-terminal-line ${line.kind}`}>
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="ws-terminal-input-row" onSubmit={onSubmit}>
        <span className="ws-terminal-prompt">$</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter command…"
          spellCheck={false}
          autoComplete="off"
        />
      </form>
    </div>
  );
}
