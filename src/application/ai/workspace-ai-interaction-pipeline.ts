import { assembleWorkspacePrompt, type AssembledPrompt } from '../../domain/ai/prompt-assembler';
import {
  createAIExecutionRequest,
  type AIExecutionRequest,
} from '../../domain/ai/ai-execution-request';
import type { WorkspaceContextPackage } from '../../domain/recall/workspace-context-package';
import type { WorkspaceSession, WorkspaceSessionId } from '../../domain/session/workspace-session';
import type { WorkspaceAiRuntimePort, WorkspaceAiCompletion } from './workspace-ai-runtime.port';
import type { WorkspaceRecallOrchestrator } from '../session/workspace-recall-orchestrator';

export type WorkspaceAiInteractionResult = Readonly<{
  session: WorkspaceSession;
  contextPackage: WorkspaceContextPackage;
  assembledPrompt: AssembledPrompt;
  executionRequest: AIExecutionRequest;
  completion: WorkspaceAiCompletion;
}>;

/**
 * W4 — AI interaction pipeline.
 * Flow: user prompt → recall orchestrator → ContextPackage → PromptAssembler
 *       → AIExecutionRequest → WorkspaceAiRuntimePort
 *
 * PromptAssembler never runs recall; runtime never sees recall-domain decision types.
 */
export class WorkspaceAiInteractionPipeline {
  constructor(
    private readonly recallOrchestrator: WorkspaceRecallOrchestrator,
    private readonly runtime: WorkspaceAiRuntimePort,
  ) {}

  async run(input: {
    sessionId: WorkspaceSessionId;
    userPrompt: string;
    workspaceId?: string;
    userId?: string;
    projectId?: string;
    maxTokens?: number;
  }): Promise<WorkspaceAiInteractionResult> {
    const { session, contextPackage } = await this.recallOrchestrator.attachContextPackage(
      input.sessionId,
      { query: input.userPrompt, maxTokens: input.maxTokens },
    );

    const assembledPrompt = assembleWorkspacePrompt({
      userPrompt: input.userPrompt,
      contextPackage,
      workspaceId: input.workspaceId,
    });

    const executionRequest = createAIExecutionRequest({
      prompt: assembledPrompt,
      workspaceId: input.workspaceId,
      userId: input.userId,
      projectId: input.projectId,
      capability: 'chat',
      tools: [],
    });

    const completion = await this.runtime.complete(executionRequest);

    return Object.freeze({
      session,
      contextPackage,
      assembledPrompt,
      executionRequest,
      completion,
    });
  }
}
