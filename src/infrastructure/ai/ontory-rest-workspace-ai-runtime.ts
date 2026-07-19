import type { AIExecutionRequest } from '../../domain/ai/ai-execution-request';
import { serializePublicExecutionRequest } from '../../domain/ai/ai-execution-request';
import { parseAIExecutionResponse } from '../../domain/ai/ai-execution-response';
import type {
  WorkspaceAiCompletion,
  WorkspaceAiRuntimePort,
  WorkspaceAiStreamHandlers,
} from '../../application/ai/workspace-ai-runtime.port';
import { getDefaultOntoryBaseUrl } from '../../config/env';
import {
  accumulatePublicSseEvents,
  parsePublicSseBody,
} from './ontory-public-sse-parser';

export type OntoryRestRuntimeOptions = {
  baseUrl?: string;
  /** Default 15s */
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export class OntoryRuntimeHttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code = 'ontory_http_error') {
    super(message);
    this.name = 'OntoryRuntimeHttpError';
    this.status = status;
    this.code = code;
  }
}

type OntoryErrorBody = {
  error?: string;
  message?: string;
};

/**
 * Studio → Ontory over HTTP only (PI#002 public contract).
 * Must not import Ontory packages or embed planner/runtime fields in requests.
 */
export class OntoryRestWorkspaceAiRuntime implements WorkspaceAiRuntimePort {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: OntoryRestRuntimeOptions = {}) {
    this.baseUrl = (options.baseUrl ?? getDefaultOntoryBaseUrl()).replace(/\/$/, '');
    this.timeoutMs = options.timeoutMs ?? 15_000;
    this.fetchImpl = options.fetchImpl ?? fetch.bind(globalThis);
  }

  async health(): Promise<{ status: string; service?: string }> {
    const res = await this.fetchImpl(`${this.baseUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!res.ok) {
      throw new OntoryRuntimeHttpError(`Ontory health failed (${res.status})`, res.status, 'health_failed');
    }
    return (await res.json()) as { status: string; service?: string };
  }

  async complete(request: AIExecutionRequest): Promise<WorkspaceAiCompletion> {
    const res = await this.fetchImpl(`${this.baseUrl}/v1/execute`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(serializePublicExecutionRequest(request)),
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!res.ok) {
      throw await this.readHttpError(res);
    }

    return parseAIExecutionResponse(await res.json());
  }

  async stream(
    request: AIExecutionRequest,
    handlers: WorkspaceAiStreamHandlers = {},
  ): Promise<WorkspaceAiCompletion> {
    const res = await this.fetchImpl(`${this.baseUrl}/v1/execute/stream`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(serializePublicExecutionRequest({ ...request, stream: true })),
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!res.ok) {
      throw await this.readHttpError(res);
    }

    const raw = await res.text();
    const events = parsePublicSseBody(raw);

    for (const event of events) {
      if (event.event === 'delta' && typeof event.data.text === 'string') {
        handlers.onDelta?.(event.data.text);
      }
    }

    const accumulated = accumulatePublicSseEvents(events);
    if (accumulated.error) {
      throw new OntoryRuntimeHttpError(accumulated.error.message, 502, accumulated.error.code);
    }
    if (!accumulated.completion) {
      throw new OntoryRuntimeHttpError('Stream ended without complete event', 502, 'invalid_stream');
    }

    return accumulated.completion;
  }

  private async readHttpError(res: Response): Promise<OntoryRuntimeHttpError> {
    let code = 'execute_failed';
    let message = `Ontory request failed (${res.status})`;
    try {
      const errBody = (await res.json()) as OntoryErrorBody;
      if (typeof errBody.error === 'string') code = errBody.error;
      if (typeof errBody.message === 'string' && errBody.message.trim()) {
        message = errBody.message;
      }
    } catch {
      // keep defaults
    }
    return new OntoryRuntimeHttpError(message, res.status, code);
  }
}
