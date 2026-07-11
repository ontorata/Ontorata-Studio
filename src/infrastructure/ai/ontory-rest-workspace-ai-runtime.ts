import type { AIExecutionRequest } from '../../domain/ai/ai-execution-request';
import type {
  WorkspaceAiCompletion,
  WorkspaceAiRuntimePort,
} from '../../application/ai/workspace-ai-runtime.port';
import { getDefaultOntoryBaseUrl } from '../../config/env';

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

type OntoryExecuteSuccess = {
  text: string;
  provider: string;
  requestId: string;
  finishedAt?: string;
};

type OntoryErrorBody = {
  error?: string;
  message?: string;
};

/**
 * Studio → Ontory over HTTP only.
 * Must not import Ontory packages or run Dispatcher in-process.
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
      body: JSON.stringify({
        prompt: {
          system: request.prompt.system,
          context: request.prompt.context,
          user: request.prompt.user,
          sourceLabels: [...request.prompt.sourceLabels],
          packageId: request.prompt.packageId,
          query: request.prompt.query,
        },
        workspaceId: request.workspaceId,
        userId: request.userId,
        projectId: request.projectId,
        capability: request.capability,
        tools: [...request.tools],
        metadata: request.metadata ? { ...request.metadata } : undefined,
      }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!res.ok) {
      let code = 'execute_failed';
      let message = `Ontory execute failed (${res.status})`;
      try {
        const errBody = (await res.json()) as OntoryErrorBody;
        if (typeof errBody.error === 'string') code = errBody.error;
        if (typeof errBody.message === 'string' && errBody.message.trim()) {
          message = errBody.message;
        }
      } catch {
        // keep defaults
      }
      throw new OntoryRuntimeHttpError(message, res.status, code);
    }

    const body = (await res.json()) as OntoryExecuteSuccess;
    if (typeof body.text !== 'string' || typeof body.provider !== 'string') {
      throw new OntoryRuntimeHttpError('Invalid AIExecutionResponse from Ontory', res.status, 'invalid_envelope');
    }

    return Object.freeze({
      text: body.text,
      provider: body.provider,
      requestId: typeof body.requestId === 'string' ? body.requestId : undefined,
    });
  }
}
