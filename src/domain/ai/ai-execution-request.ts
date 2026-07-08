import type { AssembledPrompt } from './prompt-assembler';

/**
 * Execution envelope for AI runtime — keeps identity/scope out of prompt text.
 * Neutral enough for future Ontory Runtime adapters without renaming Studio types.
 */
export type AIExecutionCapability = 'chat' | 'summarize' | 'tool-assist';

export type AIExecutionRequest = Readonly<{
  prompt: AssembledPrompt;
  workspaceId?: string;
  userId?: string;
  projectId?: string;
  capability: AIExecutionCapability;
  /** Tool names allowed for this request — empty until tool orchestration lands */
  tools: readonly string[];
  /** Opaque extension bag for future adapters (no recall internals) */
  metadata?: Readonly<Record<string, string>>;
}>;

export function createAIExecutionRequest(input: {
  prompt: AssembledPrompt;
  workspaceId?: string;
  userId?: string;
  projectId?: string;
  capability?: AIExecutionCapability;
  tools?: readonly string[];
  metadata?: Readonly<Record<string, string>>;
}): AIExecutionRequest {
  return Object.freeze({
    prompt: input.prompt,
    workspaceId: input.workspaceId,
    userId: input.userId,
    projectId: input.projectId,
    capability: input.capability ?? 'chat',
    tools: Object.freeze([...(input.tools ?? [])]),
    metadata: input.metadata ? Object.freeze({ ...input.metadata }) : undefined,
  });
}
