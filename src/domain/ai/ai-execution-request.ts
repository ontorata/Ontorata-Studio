import type { AssembledPrompt } from './prompt-assembler';
import type { ExecutionProfile } from './execution-profile';

export type { ExecutionConstraints, ExecutionProfile } from './execution-profile';

/**
 * Execution envelope for AI runtime — keeps identity/scope out of prompt text.
 * Neutral enough for future Ontory Runtime adapters without renaming Studio types.
 */
/**
 * @deprecated Prefer executionProfile (Phase 6A). Retained for Ontory REST backward compatibility during migration.
 * Use mapCapabilityToExecutionProfile() when bridging legacy callers.
 */
export type AIExecutionCapability = 'chat' | 'summarize' | 'tool-assist';

export type AIExecutionRequest = Readonly<{
  prompt: AssembledPrompt;
  workspaceId?: string;
  userId?: string;
  projectId?: string;
  /**
   * @deprecated Prefer executionProfile — retained for REST backward compatibility (Phase 6A).
   */
  capability: AIExecutionCapability;
  /** Primary public execution intent (ADR-2101 / Phase 6A). */
  executionProfile?: ExecutionProfile;
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
  /** @deprecated Prefer executionProfile. */
  capability?: AIExecutionCapability;
  executionProfile?: ExecutionProfile;
  tools?: readonly string[];
  metadata?: Readonly<Record<string, string>>;
}): AIExecutionRequest {
  return Object.freeze({
    prompt: input.prompt,
    workspaceId: input.workspaceId,
    userId: input.userId,
    projectId: input.projectId,
    capability: input.capability ?? 'chat',
    executionProfile: input.executionProfile
      ? Object.freeze({
          name: input.executionProfile.name,
          constraints: input.executionProfile.constraints
            ? Object.freeze({ ...input.executionProfile.constraints })
            : undefined,
        })
      : undefined,
    tools: Object.freeze([...(input.tools ?? [])]),
    metadata: input.metadata ? Object.freeze({ ...input.metadata }) : undefined,
  });
}
