import { describe, expect, it } from 'vitest';
import { createWorkspaceContextPackage } from '../../src/domain/recall/workspace-context-package';
import {
  listContextSourceIds,
  listContextSourceLabels,
  presentContextPackageText,
} from '../../src/domain/recall/present-context-package';

describe('presentContextPackage', () => {
  const pkg = createWorkspaceContextPackage({
    packageId: 'pkg-ui',
    query: 'migration decision',
    contextText: 'ADR-001 body',
    items: [
      { content: 'ADR-001 body', title: 'ADR-001', candidateId: 'cand-adr-0001' },
      { content: 'Policy body', title: 'Migration Policy', candidateId: 'cand-migration-policy' },
    ],
    memoryCount: 2,
    truncated: false,
  });

  it('lists sources in package order without reordering', () => {
    expect(listContextSourceLabels(pkg)).toEqual(['ADR-001', 'Migration Policy']);
    expect(listContextSourceIds(pkg)).toEqual(['cand-adr-0001', 'cand-migration-policy']);
  });

  it('presents full context text without trimming or merging', () => {
    const text = presentContextPackageText(pkg);
    expect(text.startsWith('ADR-001 body')).toBe(true);
    expect(text).toContain('• ADR-001');
    expect(text).toContain('• Migration Policy');
    expect(text).not.toContain('…');
  });
});
