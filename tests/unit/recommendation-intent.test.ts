import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  listRecommendationIntents,
  saveRecommendationIntent,
} from '../../src/domain/decisions/recommendation-intent';

describe('recommendation intent artifact', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
    });
  });

  it('persists accept/reject per workspace', () => {
    const ws = 'ws-test';
    saveRecommendationIntent({
      id: 'rec-1',
      workspaceId: ws,
      cardId: 'card-1',
      traceId: 'trace-1',
      verdict: 'accepted',
      recordedAt: new Date().toISOString(),
      title: 'Test card',
    });

    const list = listRecommendationIntents(ws);
    expect(list).toHaveLength(1);
    expect(list[0]?.verdict).toBe('accepted');
  });
});
