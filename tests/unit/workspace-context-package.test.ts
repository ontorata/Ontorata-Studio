import { describe, expect, it } from 'vitest';
import {
  createWorkspaceContextPackage,
  type WorkspaceContextItem,
} from '../../src/domain/recall/workspace-context-package';

describe('workspace context package contracts', () => {
  it('assigns stable ordinals preserving input order', () => {
    const items: Omit<WorkspaceContextItem, 'ordinal'>[] = [
      { content: 'first', candidateId: 'cand-a' },
      { content: 'second', candidateId: 'cand-b' },
    ];
    const pkg = createWorkspaceContextPackage({
      packageId: 'pkg-1',
      query: 'migration decision',
      contextText: 'first\nsecond',
      items,
      memoryCount: 2,
      truncated: false,
    });
    expect(pkg.items.map((item) => item.ordinal)).toEqual([0, 1]);
    expect(pkg.items[0]?.candidateId).toBe('cand-a');
    expect(pkg.consumedVia).toBe('sdk-context-api');
  });

  it('does not expose ranking or policy fields', () => {
    const pkg = createWorkspaceContextPackage({
      packageId: 'pkg-2',
      query: 'q',
      contextText: 'ctx',
      items: [{ content: 'ctx' }],
      memoryCount: 1,
      truncated: false,
    });
    expect(pkg).not.toHaveProperty('policyVersion');
    expect(pkg).not.toHaveProperty('selectedCandidates');
    expect(pkg).not.toHaveProperty('score');
  });
});
