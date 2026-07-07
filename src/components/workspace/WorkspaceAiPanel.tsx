import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useOptionalStudioClient } from '../../hooks/useStudioClient';
import { useWorkspaceBasePath } from '../../hooks/useWorkspacePath';
import { useWorkspaceTabs } from '../../hooks/useWorkspaceTabs';
import { Button, Input } from '../../presentation/design-system/primitives';
import { WorkspaceLoginForm } from './WorkspaceLoginForm';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  text: string;
  memoryIds?: string[];
}

const DRAFT_KEY = 'ontorata-studio-ontory-draft';

/** Right-side AI panel — Ontory with memory context. */
export function WorkspaceAiPanel() {
  const { isAuthenticated } = useAuth();
  const client = useOptionalStudioClient();
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
    if (!client) return;
    const query = input.trim();
    if (!query) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'tool', text: `search_memories("${query}")` },
      ]);

      const [searchRes, contextRes] = await Promise.all([
        client.searchMemories({ q: query, limit: 5 }),
        client.buildContext({ task: query, maxTokens: 2048 }).catch(() => null),
      ]);

      const hits = searchRes.results ?? [];
      const memoryIds = hits.map((m) => m.id);
      const hitLines =
        hits.length > 0
          ? hits
              .map((m) => `• ${m.title ?? m.id}: ${(m.content ?? m.summary ?? '').slice(0, 120)}`)
              .join('\n')
          : 'No matching memories found.';

      const contextBlock =
        contextRes && 'context' in contextRes && typeof contextRes.context === 'string'
          ? `\n\nContext:\n${contextRes.context.slice(0, 500)}${contextRes.context.length > 500 ? '…' : ''}`
          : '';

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: `${hitLines}${contextBlock}`,
          memoryIds,
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
            <p className="muted">Responses use Ratary search + context.</p>
          </div>
        ) : (
          <ul className="ws-ai-thread">
            {messages.map((m) => (
              <li key={m.id} className={`ws-ai-bubble ${m.role}`}>
                <pre>{m.text}</pre>
                {m.memoryIds && m.memoryIds.length > 0 && (
                  <div className="ws-ai-links">
                    {m.memoryIds.map((id) => (
                      <Link key={id} to={`${base}/memories/${id}`}>
                        View memory
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
            disabled={loading}
          />
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? '…' : 'Send'}
          </Button>
        </form>
      )}
    </div>
  );
}
