import { describe, expect, it } from 'vitest';
import { assembleWorkspacePrompt } from '../../src/domain/ai/prompt-assembler';
import { createWorkspaceContextPackage } from '../../src/domain/recall/workspace-context-package';

describe('assembleWorkspacePrompt', () => {
  const contextPackage = createWorkspaceContextPackage({
    packageId: 'pkg-assemble',
    query: 'migration decision',
    contextText: 'ADR-001 full body',
    items: [
      { content: 'ADR-001 full body', title: 'ADR-001', candidateId: 'cand-adr-0001' },
      { content: 'Policy body', title: 'Migration Policy', candidateId: 'cand-migration-policy' },
    ],
    memoryCount: 2,
    truncated: false,
  });

  it('formats system/context/user without mutating package order', () => {
    const prompt = assembleWorkspacePrompt({
      userPrompt: 'What was decided?',
      contextPackage,
      workspaceId: 'personal-default',
    });

    expect(prompt.user).toBe('What was decided?');
    expect(prompt.packageId).toBe('pkg-assemble');
    expect(prompt.system).toContain('Workspace: personal-default');
    expect(prompt.context.startsWith('ADR-001 full body')).toBe(true);
    expect(prompt.sourceLabels).toEqual(['ADR-001', 'Migration Policy']);
    expect(prompt.context).toContain('1. ADR-001');
    expect(prompt.context).toContain('2. Migration Policy');
  });

  it('does not expose recall-internal fields on assembled prompt', () => {
    const prompt = assembleWorkspacePrompt({
      userPrompt: 'q',
      contextPackage,
    });
    expect(prompt).not.toHaveProperty('policyVersion');
    expect(prompt).not.toHaveProperty('selectedCandidates');
    expect(prompt).not.toHaveProperty('RecallDecision');
  });

  it('prefers package.sourceLabels when Ratary envelope is present', () => {
    const withEnvelope = createWorkspaceContextPackage({
      packageId: 'pkg-server',
      query: 'q',
      contextText: 'body',
      items: [{ content: 'body', title: 'Item Title' }],
      memoryCount: 1,
      truncated: false,
      sourceLabels: ['SERVER-LABEL'],
    });
    const prompt = assembleWorkspacePrompt({
      userPrompt: 'What?',
      contextPackage: withEnvelope,
    });
    expect(prompt.sourceLabels).toEqual(['SERVER-LABEL']);
    expect(prompt.context).toContain('1. SERVER-LABEL');
    expect(prompt.context).not.toContain('Item Title');
  });
});
