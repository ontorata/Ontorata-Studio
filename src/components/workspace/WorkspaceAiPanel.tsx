import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWorkspaceRecallOrchestrator } from '../../hooks/useWorkspaceRecallOrchestrator';
import { useWorkspaceBasePath } from '../../hooks/useWorkspacePath';
import { useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';
import {
  listContextSourceIds,
  presentContextPackageText,
} from '../../domain/recall/present-context-package';
import { Button, Input } from '../../presentation/design-system/primitives';
import { WorkspaceLoginForm } from './WorkspaceLoginForm';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  text: string;
  sourceIds?: string[];
}

const DRAFT_KEY = 'ontorata-studio-ontory-draft';

/** Right-side AI panel — Ontory with memory context via recall orchestrator. */
export function WorkspaceAiPanel() {
  const { isAuthenticated } = useAuth();
  const { ready, attachContextPackage } = useWorkspaceRecallOrchestrator();
  const base = useWorkspaceBasePath();
  const { setShowAiPanel } = useWorkspaceTabs();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(() => sessionStorage.getItem(DRAFT_KEY) ?? '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, input);
  }, [input]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    const query = input.trim();
    if (!query) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'tool', text: `fetch_context_package("${query}")` },
      ]);

      const { contextPackage } = await attachContextPackage(query, 2048);
      const sourceIds = [...listContextSourceIds(contextPackage)];

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: presentContextPackageText(contextPackage),
          sourceIds,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: err instanceof Error ? err.message : 'Request failed',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ws-ai-panel">
      <div className="ws-panel-header">
        <div className="ws-panel-header-title">
          <span>ONTORY</span>
          <small>AI Assistant</small>
        </div>
        <button
          type="button"
          className="ws-panel-close"
          aria-label="Close AI panel"
          onClick={() => setShowAiPanel(false)}
        >
          ×
        </button>
      </div>

      <div className="ws-ai-messages" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="ws-ai-empty">
            <p>Ask about your organizational memory.</p>
            <p className="muted">Responses use WorkspaceContextPackage via recall orchestrator.</p>
          </div>
        ) : (
          <ul className="ws-ai-thread">
            {messages.map((m) => (
              <li key={m.id} className={`ws-ai-bubble ${m.role}`}>
                <pre>{m.text}</pre>
                {m.sourceIds && m.sourceIds.length > 0 && (
                  <div className="ws-ai-links">
                    {m.sourceIds.map((id) => (
                      <Link key={id} to={`${base}/memories/${id}`}>
                        View source
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!isAuthenticated ? (
        <WorkspaceLoginForm variant="panel" />
      ) : (
        <form className="ws-ai-input" onSubmit={onSubmit}>
          <Input
            label="Message"
            hideLabel
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Ontory…"
            disabled={loading || !ready}
          />
          <Button type="submit" variant="primary" disabled={loading || !ready}>
            {loading ? '…' : 'Send'}
          </Button>
        </form>
      )}
    </div>
  );
}
