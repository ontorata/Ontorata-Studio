import { describe, expect, it, vi } from 'vitest';
import { createAIExecutionRequest } from '../../src/domain/ai/ai-execution-request';
import { assembleWorkspacePrompt } from '../../src/domain/ai/prompt-assembler';
import { createWorkspaceContextPackage } from '../../src/domain/recall/workspace-context-package';
import {
  OntoryRestWorkspaceAiRuntime,
  OntoryRuntimeHttpError,
} from '../../src/infrastructure/ai/ontory-rest-workspace-ai-runtime';

function sampleRequest() {
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
    tools: [],
  });
}

function parseExecuteBody(fetchImpl: ReturnType<typeof vi.fn>) {
  const [, init] = fetchImpl.mock.calls[0]!;
  return JSON.parse(String(init?.body)) as Record<string, unknown>;
}

describe('OntoryRestWorkspaceAiRuntime', () => {
  it('posts public AIExecutionRequest and maps public AIExecutionResponse', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          text: 'from-ontory',
          finishReason: 'stop',
          requestId: 'req-1',
          usage: { inputChars: 1, outputChars: 2 },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const runtime = new OntoryRestWorkspaceAiRuntime({
      baseUrl: 'http://ontory.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const completion = await runtime.complete(sampleRequest());
    expect(completion).toEqual({
      text: 'from-ontory',
      finishReason: 'stop',
      requestId: 'req-1',
      usage: { inputChars: 1, outputChars: 2 },
    });

    const body = parseExecuteBody(fetchImpl);
    expect(body.prompt).toMatchObject({ user: 'hello' });
    expect(body.metadata).toMatchObject({ workspaceId: 'ws-1', userId: 'user-1' });
    expect(body).not.toHaveProperty('workspaceId');
    expect(body).not.toHaveProperty('capability');
    expect(body).not.toHaveProperty('executionProfile');
    expect(body).not.toHaveProperty('provider');
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

  it('rejects legacy provider field in response envelope', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          text: 'legacy',
          provider: 'stub',
          requestId: 'req-legacy',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    const runtime = new OntoryRestWorkspaceAiRuntime({
      baseUrl: 'http://ontory.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(runtime.complete(sampleRequest())).rejects.toThrow(/unexpected field "provider"/);
  });

  it('streams delta and complete with identical completion semantics', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.endsWith('/v1/execute/stream')) {
        return new Response(
          [
            'event: delta',
            'data: {"text":"Hel"}',
            '',
            'event: delta',
            'data: {"text":"lo"}',
            '',
            'event: complete',
            'data: {"text":"Hello","finishReason":"stop","requestId":"req-stream"}',
            '',
          ].join('\n'),
          { status: 200, headers: { 'content-type': 'text/event-stream' } },
        );
      }
      return new Response(
        JSON.stringify({
          text: 'Hello',
          finishReason: 'stop',
          requestId: 'req-stream',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    });

    const runtime = new OntoryRestWorkspaceAiRuntime({
      baseUrl: 'http://ontory.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const request = sampleRequest();
    const nonStream = await runtime.complete(request);
    const deltas: string[] = [];
    const streamed = await runtime.stream(request, {
      onDelta: (chunk) => deltas.push(chunk),
    });

    expect(streamed).toEqual(nonStream);
    expect(deltas).toEqual(['Hel', 'lo']);
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
