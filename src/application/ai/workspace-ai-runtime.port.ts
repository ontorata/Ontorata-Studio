import type { AIExecutionRequest } from '../../domain/ai/ai-execution-request';
import type { AIExecutionResponse } from '../../domain/ai/ai-execution-response';

/** Alias aligned with Ontory public response envelope (PI#002). */
export type WorkspaceAiCompletion = AIExecutionResponse;

export type WorkspaceAiStreamHandlers = Readonly<{
  onDelta?: (textChunk: string) => void;
}>;

/**
 * Neutral AI runtime abstraction for Studio (and future Ontory adapters).
 *
 * Input is public AIExecutionRequest only — no recall-domain or planner types.
 */
export interface WorkspaceAiRuntimePort {
  complete(request: AIExecutionRequest): Promise<WorkspaceAiCompletion>;

  /** Optional — Ontory REST adapter implements streaming via /v1/execute/stream. */
  stream?(
    request: AIExecutionRequest,
    handlers?: WorkspaceAiStreamHandlers,
  ): Promise<WorkspaceAiCompletion>;
}
