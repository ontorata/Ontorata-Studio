import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  createDecisionBriefId,
  listDecisionBriefArtifacts,
  saveDecisionBriefArtifact,
  type DecisionBriefArtifact,
} from '../../src/domain/decisions/decision-brief-artifact';

describe('decision-brief-artifact storage', () => {
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

  it('persists artifacts per workspace', () => {
    const artifact: DecisionBriefArtifact = {
      id: createDecisionBriefId(),
      workspaceId: 'ws-a',
      question: 'Should we adopt X?',
      memoryCount: 2,
      sourceIds: ['m1'],
      sourceLabels: ['Note A'],
      contextPreview: 'evidence text',
      verdict: 'accepted',
      createdAt: new Date().toISOString(),
      decidedAt: new Date().toISOString(),
    };
    saveDecisionBriefArtifact(artifact);

    expect(listDecisionBriefArtifacts('ws-a')).toHaveLength(1);
    expect(listDecisionBriefArtifacts('ws-b')).toHaveLength(0);
  });
});
