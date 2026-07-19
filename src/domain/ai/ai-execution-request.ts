import type { AssembledPrompt } from './prompt-assembler';

/**
 * PI#002 public execution request — mirrors docs/REST-EXECUTION-API.md (Ontory).
 */
export type AIExecutionRequest = Readonly<{
  prompt: AssembledPrompt;
  /** Execution intent — omitted for automatic provider/model selection. */
  model?: string;
  /** When true, use POST /v1/execute/stream on Ontory REST adapter. */
  stream?: boolean;
  tools: readonly string[];
  metadata?: Readonly<Record<string, unknown>>;
}>;

export const PUBLIC_REQUEST_KEYS = Object.freeze([
  'prompt',
  'model',
  'stream',
  'tools',
  'metadata',
] as const);

const IDENTITY_METADATA_KEYS = ['workspaceId', 'userId', 'projectId'] as const;

export function createAIExecutionRequest(input: {
  prompt: AssembledPrompt;
  workspaceId?: string;
  userId?: string;
  projectId?: string;
  model?: string;
  stream?: boolean;
  tools?: readonly string[];
  metadata?: Readonly<Record<string, unknown>>;
}): AIExecutionRequest {
  const metadata: Record<string, unknown> = {};

  if (input.metadata) {
    for (const [key, value] of Object.entries(input.metadata)) {
      metadata[key] = value;
    }
  }

  if (input.workspaceId) metadata.workspaceId = input.workspaceId;
  if (input.userId) metadata.userId = input.userId;
  if (input.projectId) metadata.projectId = input.projectId;

  return Object.freeze({
    prompt: input.prompt,
    model: input.model,
    stream: input.stream,
    tools: Object.freeze([...(input.tools ?? [])]),
    metadata: Object.keys(metadata).length > 0 ? Object.freeze(metadata) : undefined,
  }) as AIExecutionRequest;
}

export function serializePublicExecutionRequest(
  request: AIExecutionRequest,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    prompt: {
      system: request.prompt.system,
      context: request.prompt.context,
      user: request.prompt.user,
      sourceLabels: [...request.prompt.sourceLabels],
      packageId: request.prompt.packageId,
      query: request.prompt.query,
    },
    tools: [...request.tools],
  };

  if (request.model !== undefined) body.model = request.model;
  if (request.stream !== undefined) body.stream = request.stream;
  if (request.metadata !== undefined) {
    body.metadata = { ...request.metadata };
  }

  for (const key of Object.keys(body)) {
    if (!(PUBLIC_REQUEST_KEYS as readonly string[]).includes(key)) {
      throw new Error(`serializePublicExecutionRequest: unexpected field "${key}"`);
    }
  }

  for (const identityKey of IDENTITY_METADATA_KEYS) {
    if (identityKey in body) {
      throw new Error(`serializePublicExecutionRequest: identity must use metadata.${identityKey}`);
    }
  }

  return body;
}
