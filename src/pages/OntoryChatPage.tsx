import { FormEvent, useState } from 'react';
import { useStudioClient } from '../hooks/useStudioClient';
import { Button, Card, EmptyState, Input, PageHeader } from '../presentation/design-system/primitives';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

/** Phase 07 — Ontory chat MVP (memory search as response proxy). */
export function OntoryChatPage() {
  const client = useStudioClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const query = input.trim();
    if (!query) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const results = await client.searchMemories({ q: query, limit: 3 });
      const hits = results.results ?? [];
      const summary =
        hits.length > 0
          ? hits
              .map((m) => `• ${m.title ?? m.id}: ${(m.content ?? '').slice(0, 120)}…`)
              .join('\n')
          : 'No matching memories found in your Ratary brain.';
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', text: summary },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: err instanceof Error ? err.message : 'Search failed',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Ontory Chat"
        description="MVP assistant — answers grounded in your Ratary memories (full agent loop in Ontory product)."
      />
      <Card className="chat-panel">
        {messages.length === 0 ? (
          <EmptyState title="Start a conversation" description="Ask about your project memories." />
        ) : (
          <ul className="chat-messages">
            {messages.map((m) => (
              <li key={m.id} className={`chat-bubble ${m.role}`}>
                {m.text}
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
