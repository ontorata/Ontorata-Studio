import { describe, expect, it, vi } from 'vitest';
import { WorkspaceAiInteractionPipeline } from '../../src/application/ai/workspace-ai-interaction-pipeline';
import type { WorkspaceAiRuntimePort } from '../../src/application/ai/workspace-ai-runtime.port';
import type { WorkspaceRecallPort } from '../../src/application/recall/workspace-recall.port';
import { WorkspaceRecallOrchestrator } from '../../src/application/session/workspace-recall-orchestrator';
import {
  createWorkspaceContextPackage,
  type WorkspaceContextPackage,
} from '../../src/domain/recall/workspace-context-package';
import { EchoWorkspaceAiRuntime } from '../../src/infrastructure/ai/echo-workspace-ai-runtime';
import { InMemoryWorkspaceSessionPort } from '../../src/infrastructure/session/in-memory-workspace-session-port';
import {
  WORKSPACE_AI_SMOKE_FIXTURE,
  type SmokeScenario,
} from '../fixtures/workspace-ai-smoke-fixture';

function packageFromScenario(scenario: SmokeScenario): WorkspaceContextPackage {
  if (!scenario.injectCandidates || scenario.candidates.length === 0) {
    return createWorkspaceContextPackage({
      packageId: `pkg-${scenario.id}`,
      query: scenario.userPrompt,
      contextText: '',
      items: [],
      memoryCount: 0,
      truncated: false,
    });
  }

  return createWorkspaceContextPackage({
    packageId: `pkg-${scenario.id}`,
    query: scenario.userPrompt,
    contextText: scenario.candidates.map((c) => c.content).join('\n\n'),
    items: scenario.candidates.map((c) => ({
      content: c.content,
      title: c.title,
      candidateId: c.candidateId,
    })),
    memoryCount: scenario.candidates.length,
    truncated: false,
  });
}

function createScriptedRecallPort(responses: WorkspaceContextPackage[]): WorkspaceRecallPort {
  let index = 0;
  return {
    fetchContextPackage: vi.fn(async () => {
      const next = responses[Math.min(index, responses.length - 1)]!;
      index += 1;
      return next;
    }),
  };
}

describe('W5 workspace AI pipeline smoke', () => {
  it('fixture covers required smoke foci', () => {
    const foci = new Set(WORKSPACE_AI_SMOKE_FIXTURE.scenarios.map((s) => s.focus));
    expect(foci).toEqual(
      new Set(['empty-context', 'single-context', 'multi-source', 'session-resume', 'boundary']),
    );
  });

  it('s1 empty context still produces AIExecutionRequest', async () => {
    const scenario = WORKSPACE_AI_SMOKE_FIXTURE.scenarios.find((s) => s.id === 's1-empty-context')!;
    const sessions = new InMemoryWorkspaceSessionPort();
    const orchestrator = new WorkspaceRecallOrchestrator(
      createScriptedRecallPort([packageFromScenario(scenario)]),
      sessions,
    );
    const session = orchestrator.createWorkspaceSession(scenario.workspaceId);
    const pipeline = new WorkspaceAiInteractionPipeline(orchestrator, new EchoWorkspaceAiRuntime());

    const result = await pipeline.run({
      sessionId: session.sessionId,
      userPrompt: scenario.userPrompt,
      workspaceId: scenario.workspaceId,
      userId: scenario.userId,
    });

    expect(result.assembledPrompt.sourceLabels).toHaveLength(scenario.expectSourceCount);
    expect(result.executionRequest.prompt).toBe(result.assembledPrompt);
    expect(result.executionRequest.workspaceId).toBe(scenario.workspaceId);
    expect(result.session.contextSnapshots).toHaveLength(scenario.expectSnapshotCountAfter);
  });

  it('s2–s3 context packages preserve source order into runtime', async () => {
    for (const id of ['s2-single-context', 's3-multi-source'] as const) {
      const scenario = WORKSPACE_AI_SMOKE_FIXTURE.scenarios.find((s) => s.id === id)!;
      const sessions = new InMemoryWorkspaceSessionPort();
      const orchestrator = new WorkspaceRecallOrchestrator(
        createScriptedRecallPort([packageFromScenario(scenario)]),
        sessions,
      );
      const session = orchestrator.createWorkspaceSession(scenario.workspaceId);
      const pipeline = new WorkspaceAiInteractionPipeline(
        orchestrator,
        new EchoWorkspaceAiRuntime(),
      );

      const result = await pipeline.run({
        sessionId: session.sessionId,
        userPrompt: scenario.userPrompt,
        workspaceId: scenario.workspaceId,
        userId: scenario.userId,
      });

      expect(result.assembledPrompt.sourceLabels).toHaveLength(scenario.expectSourceCount);
      expect(result.assembledPrompt.sourceLabels).toEqual(scenario.candidates.map((c) => c.title));
      expect(result.completion.provider).toBe('echo-stub');
    }
  });

  it('s4 session resume appends snapshot without resetting prior refs', async () => {
    const first = WORKSPACE_AI_SMOKE_FIXTURE.scenarios.find((s) => s.id === 's2-single-context')!;
    const resume = WORKSPACE_AI_SMOKE_FIXTURE.scenarios.find((s) => s.id === 's4-session-resume')!;
    const sessions = new InMemoryWorkspaceSessionPort();
    const orchestrator = new WorkspaceRecallOrchestrator(
      createScriptedRecallPort([packageFromScenario(first), packageFromScenario(resume)]),
      sessions,
    );
    const session = orchestrator.createWorkspaceSession(first.workspaceId);
    const pipeline = new WorkspaceAiInteractionPipeline(orchestrator, new EchoWorkspaceAiRuntime());

    await pipeline.run({
      sessionId: session.sessionId,
      userPrompt: first.userPrompt,
      workspaceId: first.workspaceId,
      userId: first.userId,
    });

    const result = await pipeline.run({
      sessionId: session.sessionId,
      userPrompt: resume.userPrompt,
      workspaceId: resume.workspaceId,
      userId: resume.userId,
    });

    expect(result.session.contextSnapshots).toHaveLength(resume.expectSnapshotCountAfter);
    expect(result.session.contextSnapshots[0]?.query).toBe(first.userPrompt);
    expect(result.session.contextSnapshots[1]?.query).toBe(resume.userPrompt);
  });

  it('s5 boundary: runtime receives AIExecutionRequest only (no recall internals)', async () => {
    const scenario = WORKSPACE_AI_SMOKE_FIXTURE.scenarios.find((s) => s.id === 's5-boundary')!;
    const complete = vi.fn(async () => Object.freeze({ text: 'ok', provider: 'mock' }));
    const runtime: WorkspaceAiRuntimePort = { complete };
    const sessions = new InMemoryWorkspaceSessionPort();
    const orchestrator = new WorkspaceRecallOrchestrator(
      createScriptedRecallPort([packageFromScenario(scenario)]),
      sessions,
    );
    const session = orchestrator.createWorkspaceSession(scenario.workspaceId);
    const pipeline = new WorkspaceAiInteractionPipeline(orchestrator, runtime);

    await pipeline.run({
      sessionId: session.sessionId,
      userPrompt: scenario.userPrompt,
      workspaceId: scenario.workspaceId,
      userId: scenario.userId,
    });

    expect(complete).toHaveBeenCalledOnce();
    const request = complete.mock.calls[0]?.[0];
    expect(request).toHaveProperty('prompt');
    expect(request).toHaveProperty('capability', 'chat');
    expect(request).toHaveProperty('workspaceId', scenario.workspaceId);
    expect(request).not.toHaveProperty('selectedCandidates');
    expect(request).not.toHaveProperty('policyVersion');
    expect(request).not.toHaveProperty('candidates');
    expect(JSON.stringify(request)).not.toMatch(/RecallDecision|RecallPolicy/);
  });

  it('full smoke path: Prompt → Orchestrator → ContextPackage → AIExecutionRequest → RuntimePort', async () => {
    const scenario = WORKSPACE_AI_SMOKE_FIXTURE.scenarios.find((s) => s.id === 's3-multi-source')!;
    const observed: string[] = [];
    const recallPort: WorkspaceRecallPort = {
      fetchContextPackage: async (request) => {
        observed.push(`orchestrator:${request.query}`);
        return packageFromScenario(scenario);
      },
    };
    const runtime: WorkspaceAiRuntimePort = {
      complete: async (request) => {
        observed.push(`runtime:${request.prompt.packageId}`);
        return Object.freeze({ text: 'pipeline-ok', provider: 'trace' });
      },
    };
    const sessions = new InMemoryWorkspaceSessionPort();
    const orchestrator = new WorkspaceRecallOrchestrator(recallPort, sessions);
    const session = orchestrator.createWorkspaceSession(scenario.workspaceId);
    const pipeline = new WorkspaceAiInteractionPipeline(orchestrator, runtime);

    const result = await pipeline.run({
      sessionId: session.sessionId,
      userPrompt: scenario.userPrompt,
      workspaceId: scenario.workspaceId,
    });

    expect(observed[0]).toBe(`orchestrator:${scenario.userPrompt}`);
    expect(observed[1]).toBe(`runtime:${result.contextPackage.packageId}`);
    expect(result.executionRequest.prompt.packageId).toBe(result.contextPackage.packageId);
    expect(result.completion.text).toBe('pipeline-ok');
  });
});
