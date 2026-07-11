import { describe, expect, it } from 'vitest';
import {
  createWorkspaceContextPackage,
  toContextSnapshotRef,
  type WorkspaceContextItem,
} from '../../src/domain/recall/workspace-context-package';

describe('workspace context package contracts', () => {
  it('assigns stable ordinals preserving input order', () => {
    const items: ReadonlyArray<Omit<WorkspaceContextItem, 'ordinal'>> = [
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

  it('is deeply frozen (read-only consumption)', () => {
    const pkg = createWorkspaceContextPackage({
      packageId: 'pkg-ro',
      query: 'q',
      contextText: 'ctx',
      items: [{ content: 'ctx' }],
      memoryCount: 1,
      truncated: false,
    });
    expect(Object.isFrozen(pkg)).toBe(true);
    expect(Object.isFrozen(pkg.items)).toBe(true);
    expect(Object.isFrozen(pkg.items[0])).toBe(true);
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

  it('creates immutable snapshot refs without recall state', () => {
    const pkg = createWorkspaceContextPackage({
      packageId: 'pkg-3',
      query: 'q',
      contextText: 'ctx',
      items: [{ content: 'ctx' }],
      memoryCount: 1,
      truncated: false,
    });
    const ref = toContextSnapshotRef(pkg, '2026-07-08T10:00:00.000Z');
    expect(ref.packageId).toBe('pkg-3');
    expect(ref.fetchedAt).toBe('2026-07-08T10:00:00.000Z');
    expect(Object.isFrozen(ref)).toBe(true);
    expect(ref).not.toHaveProperty('contextText');
  });
});
