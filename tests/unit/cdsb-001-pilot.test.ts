import { describe, expect, it, vi } from 'vitest';
import { executeCdsb001Brief } from '../../src/application/pilot/cdsb-001-execution';
import { assembleCdsb001Prompt } from '../../src/domain/pilot/cdsb-001-prompt';
import type { WorkspaceAiRuntimePort } from '../../src/application/ai/workspace-ai-runtime.port';

describe('assembleCdsb001Prompt', () => {
  it('builds prompt from project notes without recall labels', () => {
    const prompt = assembleCdsb001Prompt({
      projectId: 'client-a',
      weekRange: '2026-W29',
      projectNotes: 'Shipped API v2 draft.',
      workspaceId: 'ws-pilot',
    });

    expect(prompt.user).toContain('client-a');
    expect(prompt.context).toContain('Shipped API v2 draft.');
    expect(prompt.sourceLabels).toEqual(['cdsb-001:project-notes']);
    expect(prompt.system).toContain('CDSB-001');
    expect(prompt.context).not.toContain('organizational context');
  });
});

describe('executeCdsb001Brief', () => {
  it('calls runtime with public request and pilot metadata', async () => {
    const complete = vi.fn(async () =>
      Object.freeze({
        text: 'brief',
        finishReason: 'stop' as const,
        requestId: 'req-cdsb',
      }),
    );
    const runtime: WorkspaceAiRuntimePort = { complete, health: vi.fn() };

    const result = await executeCdsb001Brief(runtime, {
      workspaceId: 'ws-1',
      projectId: 'client-a',
      weekRange: '2026-W29',
      projectNotes: 'Notes',
    });

    expect(result.requestId).toBe('req-cdsb');
    expect(complete).toHaveBeenCalledOnce();
    const request = complete.mock.calls[0]![0];
    expect(request).not.toHaveProperty('executionProfile');
    expect(request).not.toHaveProperty('capability');
    expect(request.metadata).toMatchObject({
      pilotId: 'CDSB-001',
      projectId: 'client-a',
      workspaceId: 'ws-1',
    });
    expect(request.prompt.context).toContain('Notes');
  });
});
