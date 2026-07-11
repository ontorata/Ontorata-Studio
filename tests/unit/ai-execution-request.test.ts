import { describe, expect, it } from 'vitest';
import { createAIExecutionRequest } from '../../src/domain/ai/ai-execution-request';
import { assembleWorkspacePrompt } from '../../src/domain/ai/prompt-assembler';
import { createWorkspaceContextPackage } from '../../src/domain/recall/workspace-context-package';

describe('AIExecutionRequest', () => {
  it('keeps execution context outside prompt text', () => {
    const contextPackage = createWorkspaceContextPackage({
      packageId: 'pkg-exec',
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
    const request = createAIExecutionRequest({
      prompt,
      workspaceId: 'ws-1',
      userId: 'user-9',
      projectId: 'proj-1',
      tools: ['search_notes'],
    });

    expect(request.prompt.user).toBe('hello');
    expect(request.workspaceId).toBe('ws-1');
    expect(request.userId).toBe('user-9');
    expect(request.projectId).toBe('proj-1');
    expect(request.tools).toEqual(['search_notes']);
    expect(Object.isFrozen(request)).toBe(true);
    expect(request.prompt.system).not.toContain('user-9');
    expect(request.prompt.system).not.toContain('proj-1');
  });
});
