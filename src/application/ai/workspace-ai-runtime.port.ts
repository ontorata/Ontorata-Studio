import type { AIExecutionRequest } from '../../domain/ai/ai-execution-request';

export type WorkspaceAiCompletion = Readonly<{
  text: string;
  provider: string;
  requestId?: string;
}>;

/**
 * Neutral AI runtime abstraction for Studio (and future Ontory adapters).
 *
 * Implementations may target OpenAI / Anthropic / local / Ontory runtime —
 * Studio must not couple to a concrete vendor.
 *
 * Input is AIExecutionRequest (AssembledPrompt + execution context), never
 * ContextPackage assembly internals or recall-domain types.
 */
export interface WorkspaceAiRuntimePort {
  complete(request: AIExecutionRequest): Promise<WorkspaceAiCompletion>;
}
