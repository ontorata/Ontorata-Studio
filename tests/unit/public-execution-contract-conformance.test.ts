import { describe, expect, it } from 'vitest';
import {
  createAIExecutionRequest,
  PUBLIC_REQUEST_KEYS,
  serializePublicExecutionRequest,
} from '../../src/domain/ai/ai-execution-request';
import {
  FORBIDDEN_PUBLIC_RESPONSE_KEYS,
  parseAIExecutionResponse,
  PUBLIC_RESPONSE_KEYS,
} from '../../src/domain/ai/ai-execution-response';
import { assembleWorkspacePrompt } from '../../src/domain/ai/prompt-assembler';
import { createWorkspaceContextPackage } from '../../src/domain/recall/workspace-context-package';

describe('Studio PI#002 public execution contract conformance', () => {
  it('serializes only documented public request keys', () => {
    const contextPackage = createWorkspaceContextPackage({
      packageId: 'pkg-conformance',
      query: 'q',
      contextText: 'ctx',
      items: [{ content: 'ctx', title: 'A' }],
      memoryCount: 1,
      truncated: false,
    });
    const prompt = assembleWorkspacePrompt({
      userPrompt: 'hello',
      contextPackage,
      workspaceId: 'ws-1',
    });

    const body = serializePublicExecutionRequest(
      createAIExecutionRequest({
        prompt,
        workspaceId: 'ws-1',
        userId: 'user-1',
        tools: ['search'],
        model: 'gpt-4o',
      }),
    );

    const bodyKeys = Object.keys(body).sort();
    expect(bodyKeys.every((key) => (PUBLIC_REQUEST_KEYS as readonly string[]).includes(key))).toBe(
      true,
    );
    expect(bodyKeys).toEqual(['metadata', 'model', 'prompt', 'tools']);
    expect(body.metadata).toMatchObject({ workspaceId: 'ws-1', userId: 'user-1' });
    expect(body).not.toHaveProperty('executionProfile');
    expect(body).not.toHaveProperty('capability');
    expect(body).not.toHaveProperty('provider');
  });

  it('parses only documented public response keys', () => {
    const response = parseAIExecutionResponse({
      text: 'ok',
      finishReason: 'stop',
      requestId: 'req-1',
      usage: { inputChars: 1, outputChars: 2 },
    });

    expect(Object.keys(response).sort()).toEqual(
      [...PUBLIC_RESPONSE_KEYS].filter((key) => key in response).sort(),
    );
  });

  it('rejects internal runtime fields on public response parse', () => {
    for (const forbidden of FORBIDDEN_PUBLIC_RESPONSE_KEYS) {
      expect(() =>
        parseAIExecutionResponse({
          text: 'x',
          finishReason: 'stop',
          requestId: 'req-1',
          [forbidden]: 'leak',
        }),
      ).toThrow(new RegExp(`unexpected field "${forbidden}"`));
    }
  });
});
