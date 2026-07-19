import type { AIExecutionResponse } from '../../domain/ai/ai-execution-response';
import { parseAIExecutionResponse } from '../../domain/ai/ai-execution-response';

export type PublicSseEvent = Readonly<{
  event: 'delta' | 'complete' | 'error';
  data: Record<string, unknown>;
}>;

export type PublicStreamError = Readonly<{
  code: string;
  message: string;
}>;

export function parsePublicSseBody(raw: string): PublicSseEvent[] {
  const events: PublicSseEvent[] = [];
  const blocks = raw
    .split('\n\n')
    .map((block) => block.trim())
    .filter(Boolean);

  for (const block of blocks) {
    const lines = block.split('\n');
    let eventName: PublicSseEvent['event'] | undefined;
    let dataLine: string | undefined;

    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventName = line.slice('event:'.length).trim() as PublicSseEvent['event'];
      } else if (line.startsWith('data:')) {
        dataLine = line.slice('data:'.length).trim();
      }
    }

    if (!eventName || !dataLine) continue;
    events.push(
      Object.freeze({
        event: eventName,
        data: JSON.parse(dataLine) as Record<string, unknown>,
      }),
    );
  }

  return events;
}

export type PublicStreamAccumulation = Readonly<{
  text: string;
  completion?: AIExecutionResponse;
  error?: PublicStreamError;
}>;

/**
 * Accumulates public SSE events per REST-EXECUTION-API.md.
 * Terminal rule: exactly one `complete` or `error` after zero or more `delta` events.
 */
export function accumulatePublicSseEvents(events: readonly PublicSseEvent[]): PublicStreamAccumulation {
  let text = '';
  let completion: AIExecutionResponse | undefined;
  let error: PublicStreamError | undefined;
  let terminalCount = 0;

  for (const event of events) {
    if (terminalCount > 0) {
      break;
    }

    switch (event.event) {
      case 'delta': {
        const chunk = event.data.text;
        if (typeof chunk === 'string') {
          text += chunk;
        }
        break;
      }
      case 'complete': {
        terminalCount += 1;
        completion = parseAIExecutionResponse(event.data);
        text = completion.text;
        break;
      }
      case 'error': {
        terminalCount += 1;
        const code = typeof event.data.code === 'string' ? event.data.code : 'provider_error';
        const message =
          typeof event.data.message === 'string' ? event.data.message : 'stream execution failed';
        error = Object.freeze({ code, message });
        break;
      }
      default:
        break;
    }
  }

  return Object.freeze({ text, completion, error });
}
