import type { AIExecutionRequest } from '../../domain/ai/ai-execution-request';
import type {
  WorkspaceAiCompletion,
  WorkspaceAiRuntimePort,
} from '../../application/ai/workspace-ai-runtime.port';

/**
 * W4 stub runtime — proves pipeline wiring without binding a production LLM.
 * Later milestones may swap for OpenAI/Anthropic/local/Ontory adapters.
 */
export class EchoWorkspaceAiRuntime implements WorkspaceAiRuntimePort {
  readonly provider = 'echo-stub';

  async complete(request: AIExecutionRequest): Promise<WorkspaceAiCompletion> {
    const { prompt, workspaceId, capability, tools } = request;
    const sourceSummary =
      prompt.sourceLabels.length > 0
        ? prompt.sourceLabels.map((label) => `• ${label}`).join('\n')
        : '• (no labeled sources)';

    const text = [
      `[${this.provider}] Prompt assembled for package ${prompt.packageId}`,
      `capability=${capability}`,
      `workspace=${workspaceId ?? '(unspecified)'}`,
      `tools=${tools.length > 0 ? tools.join(',') : '(none)'}`,
      '',
      'User:',
      prompt.user,
      '',
      'Context length:',
      `${prompt.context.length} chars`,
      '',
      'Sources:',
      sourceSummary,
      '',
      'Note: replace EchoWorkspaceAiRuntime with a production WorkspaceAiRuntimePort adapter later.',
    ].join('\n');

    return Object.freeze({
      text,
      provider: this.provider,
    });
  }
}
