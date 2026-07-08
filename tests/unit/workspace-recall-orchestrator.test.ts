import { describe, expect, it, vi } from 'vitest';
import { WorkspaceRecallOrchestrator } from '../../src/application/session/workspace-recall-orchestrator';
import { createWorkspaceContextPackage } from '../../src/domain/recall/workspace-context-package';
import { InMemoryWorkspaceSessionPort } from '../../src/infrastructure/session/in-memory-workspace-session-port';
import type { WorkspaceRecallPort } from '../../src/application/recall/workspace-recall.port';

function createRecallPortMock(): WorkspaceRecallPort {
  return {
    fetchContextPackage: vi.fn(async (request) =>
      createWorkspaceContextPackage({
        packageId: 'pkg-mock',
        query: request.query,
        contextText: `context:${request.query}`,
        items: [{ content: `context:${request.query}` }],
        memoryCount: 1,
        truncated: false,
      }),
    ),
  };
}

describe('WorkspaceRecallOrchestrator', () => {
  it('creates recall-stateless sessions', () => {
    const orchestrator = new WorkspaceRecallOrchestrator(
      createRecallPortMock(),
      new InMemoryWorkspaceSessionPort(),
    );
    const session = orchestrator.createWorkspaceSession('personal-default');
    expect(session.workspaceId).toBe('personal-default');
    expect(session.contextSnapshots).toEqual([]);
  });

  it('attaches immutable context package and stores snapshot ref only', async () => {
    const recallPort = createRecallPortMock();
    const sessionPort = new InMemoryWorkspaceSessionPort();
    const orchestrator = new WorkspaceRecallOrchestrator(recallPort, sessionPort);
    const session = orchestrator.createWorkspaceSession('personal-default');

    const result = await orchestrator.attachContextPackage(session.sessionId, {
      query: 'migration decision',
    });

    expect(recallPort.fetchContextPackage).toHaveBeenCalledOnce();
    expect(result.contextPackage.contextText).toBe('context:migration decision');
    expect(result.session.contextSnapshots).toHaveLength(1);
    expect(result.session.contextSnapshots[0]?.packageId).toBe('pkg-mock');
    expect(result.session.contextSnapshots[0]).not.toHaveProperty('contextText');
  });

  it('does not mutate prior session snapshots', async () => {
    const orchestrator = new WorkspaceRecallOrchestrator(
      createRecallPortMock(),
      new InMemoryWorkspaceSessionPort(),
    );
    const session = orchestrator.createWorkspaceSession('personal-default');
    const first = await orchestrator.attachContextPackage(session.sessionId, { query: 'one' });
    const second = await orchestrator.attachContextPackage(session.sessionId, { query: 'two' });

    expect(first.session.contextSnapshots).toHaveLength(1);
    expect(second.session.contextSnapshots).toHaveLength(2);
    expect(second.session.contextSnapshots[0]?.query).toBe('one');
    expect(second.session.contextSnapshots[1]?.query).toBe('two');
  });
});
