import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RataryConnectionNotice } from '../components/RataryConnectionNotice';
import { formatRataryApiError } from '../infrastructure/ratary/format-ratary-api-error';
import { useRataryTabClient } from '../hooks/useRataryTabClient';
import { useWorkspaceRecallOrchestrator } from '../hooks/useWorkspaceRecallOrchestrator';
import { useWorkspaceBasePath } from '../hooks/useWorkspacePath';
import {
  listContextSourceIds,
  presentContextPackageText,
} from '../domain/recall/present-context-package';
import { Button, Card, EmptyState, Input, PageHeader } from '../presentation/design-system/primitives';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  text: string;
  sourceIds?: string[];
}

const DRAFT_KEY = 'ontorata-studio-ontory-draft';

/** Ontory chat — consumes WorkspaceContextPackage via recall orchestrator. */
export function OntoryChatPage() {
  const { authLoading, missingConnection } = useRataryTabClient();
  const { ready, attachContextPackage } = useWorkspaceRecallOrchestrator();
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
    if (!query || !ready) return;

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
        description="Memory-grounded assistant — consumes ContextPackage via workspace recall orchestrator."
      />
      <Card className="chat-panel">
        {messages.length === 0 ? (
          <EmptyState
            title="Start a conversation"
            description="Ask about your project memories. Responses cite WorkspaceContextPackage sources."
          />
        ) : (
          <ul className="chat-messages">
            {messages.map((m) => (
              <li key={m.id} className={`chat-bubble ${m.role}`}>
                {m.text}
                {m.sourceIds && m.sourceIds.length > 0 && (
                  <div className="chat-links">
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
        <form className="chat-input-row" onSubmit={onSubmit}>
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
      </Card>
    </div>
  );
}
