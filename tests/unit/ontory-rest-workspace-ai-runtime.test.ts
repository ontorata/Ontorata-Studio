import { describe, expect, it, vi } from 'vitest';
import { createAIExecutionRequest } from '../../src/domain/ai/ai-execution-request';
import { assembleWorkspacePrompt } from '../../src/domain/ai/prompt-assembler';
import { createWorkspaceContextPackage } from '../../src/domain/recall/workspace-context-package';
import {
  OntoryRestWorkspaceAiRuntime,
  OntoryRuntimeHttpError,
} from '../../src/infrastructure/ai/ontory-rest-workspace-ai-runtime';

function sampleRequest(options?: { executionProfile?: { name: string; constraints?: { latencyClass?: 'interactive' | 'batch' } } }) {
  const contextPackage = createWorkspaceContextPackage({
    packageId: 'pkg-rest',
    query: 'hello',
    contextText: 'ctx',
    items: [{ content: 'ctx', title: 'A', candidateId: 'cand-a' }],
    memoryCount: 1,
    truncated: false,
  });
  const prompt = assembleWorkspacePrompt({
    userPrompt: 'hello',
    contextPackage,
    workspaceId: 'ws-1',
  });
  return createAIExecutionRequest({
    prompt,
    workspaceId: 'ws-1',
    userId: 'user-1',
    capability: 'chat',
    executionProfile: options?.executionProfile,
    tools: [],
  });
}

function parseExecuteBody(fetchImpl: ReturnType<typeof vi.fn>) {
  const [, init] = fetchImpl.mock.calls[0]!;
  return JSON.parse(String(init?.body)) as Record<string, unknown>;
}

describe('OntoryRestWorkspaceAiRuntime', () => {
  it('posts AIExecutionRequest and maps AIExecutionResponse', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          text: 'from-ontory',
          provider: 'stub',
          requestId: 'req-1',
          finishedAt: '2026-07-08T12:00:00.000Z',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const runtime = new OntoryRestWorkspaceAiRuntime({
      baseUrl: 'http://ontory.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const completion = await runtime.complete(sampleRequest());
    expect(completion.text).toBe('from-ontory');
    expect(completion.provider).toBe('stub');
    expect(completion.requestId).toBe('req-1');

    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('http://ontory.test/v1/execute');
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual({ 'content-type': 'application/json' });
    const body = parseExecuteBody(fetchImpl);
    expect(body.prompt).toMatchObject({ user: 'hello' });
    expect(body.workspaceId).toBe('ws-1');
    expect(body.capability).toBe('chat');
    expect(body).not.toHaveProperty('executionProfile');
  });

  it('includes executionProfile in JSON body when present on request', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({ text: 'ok', provider: 'stub', requestId: 'req-2' }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    const runtime = new OntoryRestWorkspaceAiRuntime({
      baseUrl: 'http://ontory.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await runtime.complete(
      sampleRequest({ executionProfile: { name: 'conversation' } }),
    );

    const body = parseExecuteBody(fetchImpl);
    expect(body.capability).toBe('chat');
    expect(body.executionProfile).toEqual({ name: 'conversation' });
  });

  it('forwards executionProfile constraints without adapter mapping', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({ text: 'ok', provider: 'stub', requestId: 'req-3' }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    const runtime = new OntoryRestWorkspaceAiRuntime({
      baseUrl: 'http://ontory.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await runtime.complete(
      sampleRequest({
        executionProfile: {
          name: 'conversation',
          constraints: { latencyClass: 'interactive' },
        },
      }),
    );

    const body = parseExecuteBody(fetchImpl);
    expect(body.executionProfile).toEqual({
      name: 'conversation',
      constraints: { latencyClass: 'interactive' },
    });
  });

  it('maps Ontory error envelope', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ error: 'bad_request', message: 'validation failed' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const runtime = new OntoryRestWorkspaceAiRuntime({
      baseUrl: 'http://ontory.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(runtime.complete(sampleRequest())).rejects.toMatchObject({
      name: 'OntoryRuntimeHttpError',
      status: 400,
      code: 'bad_request',
      message: 'validation failed',
    } satisfies Partial<OntoryRuntimeHttpError>);
  });

  it('health hits /health', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ status: 'ok', service: 'ontory-runtime' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const runtime = new OntoryRestWorkspaceAiRuntime({
      baseUrl: 'http://ontory.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const health = await runtime.health();
    expect(health.status).toBe('ok');
    expect(fetchImpl.mock.calls[0]?.[0]).toBe('http://ontory.test/health');
  });
});
