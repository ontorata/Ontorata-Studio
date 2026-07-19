import type { AIExecutionRequest } from '../../domain/ai/ai-execution-request';
import type {
  WorkspaceAiCompletion,
  WorkspaceAiRuntimePort,
} from '../../application/ai/workspace-ai-runtime.port';

/**
 * W4 stub runtime — proves pipeline wiring without binding a production LLM.
 */
export class EchoWorkspaceAiRuntime implements WorkspaceAiRuntimePort {
  async complete(request: AIExecutionRequest): Promise<WorkspaceAiCompletion> {
    const workspaceId =
      typeof request.metadata?.workspaceId === 'string' ? request.metadata.workspaceId : undefined;
    const sourceSummary =
      request.prompt.sourceLabels.length > 0
        ? request.prompt.sourceLabels.map((label) => `• ${label}`).join('\n')
        : '• (no labeled sources)';

    const text = [
      '[echo-stub] Prompt assembled for package',
      request.prompt.packageId,
      `workspace=${workspaceId ?? '(unspecified)'}`,
      `tools=${request.tools.length > 0 ? request.tools.join(',') : '(none)'}`,
      '',
      'User:',
      request.prompt.user,
      '',
      'Context length:',
      `${request.prompt.context.length} chars`,
      '',
      'Sources:',
      sourceSummary,
    ].join('\n');

    return Object.freeze({
      text,
      finishReason: 'stop',
      requestId: 'echo-stub-req',
    });
  }
}
