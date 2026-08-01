import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  createStrategicSessionArtifactId,
  listStrategicSessionArtifacts,
  saveStrategicSessionArtifact,
  type StrategicSessionArtifact,
} from '../../src/domain/decisions/strategic-session-artifact';

describe('strategic-session-artifact storage', () => {
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

  it('persists artifacts per workspace with decision model attribution', () => {
    const artifact: StrategicSessionArtifact = {
      id: createStrategicSessionArtifactId(),
      workspaceId: 'ws-a',
      goal: 'Improve recall quality',
      packageId: 'pkg-1',
      outcome: 'success — step budget reached',
      decisionModel: {
        id: 'ontorata-internal-v1',
        version: '1.0.0',
        displayName: 'Ontorata Internal',
        executionProfileName: 'analysis',
      },
      steps: [{ index: 1, text: 'step one', status: 'ok' }],
      recordedAt: new Date().toISOString(),
    };
    saveStrategicSessionArtifact(artifact);

    const listed = listStrategicSessionArtifacts('ws-a');
    expect(listed).toHaveLength(1);
    expect(listed[0]?.decisionModel?.id).toBe('ontorata-internal-v1');
    expect(listStrategicSessionArtifacts('ws-b')).toHaveLength(0);
  });

  it('persists computed model sandbox audit fields', () => {
    const artifact: StrategicSessionArtifact = {
      id: createStrategicSessionArtifactId(),
      workspaceId: 'ws-a',
      goal: 'Score evidence',
      packageId: 'pkg-1',
      outcome: 'success — step budget reached',
      decisionModel: {
        id: 'ontorata-computed-scorer-v1',
        version: '1.0.0',
        displayName: 'Ontorata Computed Scorer v1',
        executionProfileName: 'analysis',
        computedPlugin: { kind: 'worker', artifactDigestPrefix: '97212904c798' },
        pluginDigestPrefix: '97212904c798',
        sandboxOutcome: 'ok',
      },
      steps: [{ index: 1, text: 'step one', status: 'ok' }],
      recordedAt: new Date().toISOString(),
    };
    saveStrategicSessionArtifact(artifact);
    const listed = listStrategicSessionArtifacts('ws-a');
    expect(listed[0]?.decisionModel?.sandboxOutcome).toBe('ok');
    expect(listed[0]?.decisionModel?.pluginDigestPrefix).toBe('97212904c798');
  });
});
