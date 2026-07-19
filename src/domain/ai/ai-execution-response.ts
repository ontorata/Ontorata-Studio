/**
 * PI#002 public execution response — mirrors docs/REST-EXECUTION-API.md (Ontory).
 */
export type FinishReason =
  | 'stop'
  | 'length'
  | 'tool_calls'
  | 'content_filter'
  | 'error';

export type Usage = Readonly<{
  inputChars?: number;
  outputChars?: number;
  inputTokens?: number;
  outputTokens?: number;
}>;

export type AIExecutionResponse = Readonly<{
  text: string;
  finishReason: FinishReason;
  requestId: string;
  usage?: Usage;
}>;

export const PUBLIC_RESPONSE_KEYS = Object.freeze([
  'text',
  'finishReason',
  'usage',
  'requestId',
] as const);

export const FORBIDDEN_PUBLIC_RESPONSE_KEYS = Object.freeze([
  'provider',
  'planner',
  'catalogEntry',
  'executionProfile',
  'requiredCapabilities',
  'retryPolicy',
  'selectionDecision',
  'adapter',
  'workspaceId',
  'finishedAt',
] as const);

export function parseAIExecutionResponse(value: unknown): AIExecutionResponse {
  if (!value || typeof value !== 'object') {
    throw new Error('Invalid AIExecutionResponse: not an object');
  }

  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!(PUBLIC_RESPONSE_KEYS as readonly string[]).includes(key)) {
      throw new Error(`Invalid AIExecutionResponse: unexpected field "${key}"`);
    }
    if ((FORBIDDEN_PUBLIC_RESPONSE_KEYS as readonly string[]).includes(key)) {
      throw new Error(`Invalid AIExecutionResponse: internal field "${key}" leaked`);
    }
  }

  const text = record.text;
  const finishReason = record.finishReason;
  const requestId = record.requestId;

  if (typeof text !== 'string') {
    throw new Error('Invalid AIExecutionResponse: text must be a string');
  }
  if (typeof finishReason !== 'string') {
    throw new Error('Invalid AIExecutionResponse: finishReason must be a string');
  }
  if (typeof requestId !== 'string' || requestId.length === 0) {
    throw new Error('Invalid AIExecutionResponse: requestId must be a non-empty string');
  }

  return Object.freeze({
    text,
    finishReason: finishReason as FinishReason,
    requestId,
    usage: record.usage as Usage | undefined,
  });
}
