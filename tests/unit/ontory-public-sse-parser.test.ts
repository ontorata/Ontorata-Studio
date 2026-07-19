import { describe, expect, it } from 'vitest';
import {
  accumulatePublicSseEvents,
  parsePublicSseBody,
} from '../../src/infrastructure/ai/ontory-public-sse-parser';

describe('ontory-public-sse-parser', () => {
  it('parses delta, complete, and error events', () => {
    const raw = [
      'event: delta',
      'data: {"text":"A"}',
      '',
      'event: complete',
      'data: {"text":"A","finishReason":"stop","requestId":"req-1"}',
      '',
    ].join('\n');

    const events = parsePublicSseBody(raw);
    expect(events.map((event) => event.event)).toEqual(['delta', 'complete']);
  });

  it('accumulates deltas until complete terminal event', () => {
    const events = parsePublicSseBody(
      [
        'event: delta',
        'data: {"text":"Hel"}',
        '',
        'event: delta',
        'data: {"text":"lo"}',
        '',
        'event: complete',
        'data: {"text":"Hello","finishReason":"stop","requestId":"req-1"}',
        '',
      ].join('\n'),
    );

    const result = accumulatePublicSseEvents(events);
    expect(result.text).toBe('Hello');
    expect(result.completion?.requestId).toBe('req-1');
    expect(result.error).toBeUndefined();
  });

  it('surfaces stream error terminal event', () => {
    const result = accumulatePublicSseEvents(
      parsePublicSseBody(
        [
          'event: error',
          'data: {"code":"bad_request","message":"policy"}',
          '',
        ].join('\n'),
      ),
    );

    expect(result.error).toEqual({ code: 'bad_request', message: 'policy' });
    expect(result.completion).toBeUndefined();
  });
});
