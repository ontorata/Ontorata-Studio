import { describe, expect, it, vi } from 'vitest';
import { WorkspaceAiInteractionPipeline } from '../../src/application/ai/workspace-ai-interaction-pipeline';
import type { WorkspaceAiRuntimePort } from '../../src/application/ai/workspace-ai-runtime.port';
import { WorkspaceRecallOrchestrator } from '../../src/application/session/workspace-recall-orchestrator';
import type { WorkspaceRecallPort } from '../../src/application/recall/workspace-recall.port';
import { createWorkspaceContextPackage } from '../../src/domain/recall/workspace-context-package';
import { EchoWorkspaceAiRuntime } from '../../src/infrastructure/ai/echo-workspace-ai-runtime';
import { InMemoryWorkspaceSessionPort } from '../../src/infrastructure/session/in-memory-workspace-session-port';

function createRecallPortMock(): WorkspaceRecallPort {
  return {
    fetchContextPackage: vi.fn(async (request) =>
      createWorkspaceContextPackage({
        packageId: 'pkg-pipeline',
        query: request.query,
        contextText: `context:${request.query}`,
        items: [{ content: `context:${request.query}`, title: 'Source A', candidateId: 'cand-a' }],
        memoryCount: 1,
        truncated: false,
      }),
    ),
  };
}

describe('WorkspaceAiInteractionPipeline', () => {
  it('runs ContextPackage → PromptAssembler → AIExecutionRequest → runtime', async () => {
    const recallOrchestrator = new WorkspaceRecallOrchestrator(
      createRecallPortMock(),
      new InMemoryWorkspaceSessionPort(),
    );
    const session = recallOrchestrator.createWorkspaceSession('personal-default');
    const pipeline = new WorkspaceAiInteractionPipeline(
      recallOrchestrator,
      new EchoWorkspaceAiRuntime(),
    );

    const result = await pipeline.run({
      sessionId: session.sessionId,
      userPrompt: 'migration decision',
      workspaceId: 'personal-default',
    });

    expect(result.contextPackage.packageId).toBe('pkg-pipeline');
    expect(result.assembledPrompt.sourceLabels).toEqual(['Source A']);
    expect(result.executionRequest.prompt.user).toBe('migration decision');
    expect(result.executionRequest.metadata?.workspaceId).toBe('personal-default');
    expect(result.executionRequest.tools).toEqual([]);
    expect(result.executionRequest).not.toHaveProperty('executionProfile');
    expect(result.completion.finishReason).toBe('stop');
    expect(result.completion.text).toContain('Source A');
  });

  it('passes public AIExecutionRequest to runtime port', async () => {
    const complete = vi.fn(async () =>
      Object.freeze({ text: 'ok', finishReason: 'stop' as const, requestId: 'req-mock' }),
    );
    const runtime: WorkspaceAiRuntimePort = { complete };
    const recallOrchestrator = new WorkspaceRecallOrchestrator(
      createRecallPortMock(),
      new InMemoryWorkspaceSessionPort(),
    );
    const session = recallOrchestrator.createWorkspaceSession('ws-1');
    const pipeline = new WorkspaceAiInteractionPipeline(recallOrchestrator, runtime);

    await pipeline.run({
      sessionId: session.sessionId,
      userPrompt: 'hello',
      workspaceId: 'ws-1',
      userId: 'user-1',
    });

    expect(complete).toHaveBeenCalledOnce();
    const requestArg = complete.mock.calls[0]?.[0];
    expect(requestArg).toHaveProperty('prompt');
    expect(requestArg.metadata).toMatchObject({ workspaceId: 'ws-1', userId: 'user-1' });
    expect(requestArg.prompt).toHaveProperty('user', 'hello');
    expect(requestArg).not.toHaveProperty('executionProfile');
    expect(requestArg).not.toHaveProperty('capability');
    expect(requestArg).not.toHaveProperty('selectedCandidates');
    expect(requestArg).not.toHaveProperty('candidates');
  });
});
