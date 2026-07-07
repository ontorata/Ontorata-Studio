import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RataryConnectionNotice } from '../components/RataryConnectionNotice';
import { formatRataryApiError } from '../infrastructure/ratary/format-ratary-api-error';
import { useRataryTabClient } from '../hooks/useRataryTabClient';
import { useWorkspaceBasePath } from '../hooks/useWorkspacePath';
import { Button, Card, EmptyState, Input, PageHeader } from '../presentation/design-system/primitives';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  text: string;
  memoryIds?: string[];
}

const DRAFT_KEY = 'ontorata-studio-ontory-draft';

/** Phase 07 — Ontory chat with memory search + context build. */
export function OntoryChatPage() {
  const { client, authLoading, missingConnection } = useRataryTabClient();
  const base = useWorkspaceBasePath();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(() => sessionStorage.getItem(DRAFT_KEY) ?? '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, input);
  }, [input]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const query = input.trim();
    if (!query || !client) return;

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
              .map((m) => `• ${m.title ?? m.id}: ${(m.content ?? m.summary ?? '').slice(0, 160)}`)
              .join('\n')
          : 'No matching memories found.';

      const contextBlock =
        contextRes && 'context' in contextRes && typeof contextRes.context === 'string'
          ? `\n\nContext (${contextRes.context.length} chars):\n${contextRes.context.slice(0, 800)}${contextRes.context.length > 800 ? '…' : ''}`
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
          text: formatRataryApiError(err),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="page">
        <p>Loading session…</p>
      </div>
    );
  }

  if (missingConnection) {
    return <RataryConnectionNotice title="Ontory Chat" />;
  }

  return (
    <div className="page">
      <PageHeader
        title="Ontory Chat"
        description="Memory-grounded assistant — searches and builds context from your Ratary brain."
      />
      <Card className="chat-panel">
        {messages.length === 0 ? (
          <EmptyState
            title="Start a conversation"
            description="Ask about your project memories. Responses cite Ratary search + context APIs."
          />
        ) : (
          <ul className="chat-messages">
            {messages.map((m) => (
              <li key={m.id} className={`chat-bubble ${m.role}`}>
                {m.text}
                {m.memoryIds && m.memoryIds.length > 0 && (
                  <div className="chat-links">
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
        <form className="chat-input-row" onSubmit={onSubmit}>
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
      </Card>
    </div>
  );
}
