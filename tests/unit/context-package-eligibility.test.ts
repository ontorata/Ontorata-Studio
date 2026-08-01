import { describe, expect, it } from 'vitest';
import { createWorkspaceContextPackage } from '../../src/domain/recall/workspace-context-package';
import {
  assertContextPackageEligibleForProjection,
  ContextPackageNotEligibleError,
  isContextPackageEligibleForProjection,
} from '../../src/domain/recall/context-package-eligibility';
import { presentContextPackageText } from '../../src/domain/recall/present-context-package';
import { assembleWorkspacePrompt } from '../../src/domain/ai/prompt-assembler';

function pkg(
  lifecycleState?: 'active' | 'retired' | 'archived',
): ReturnType<typeof createWorkspaceContextPackage> {
  return createWorkspaceContextPackage({
    packageId: 'pkg-1',
    query: 'q',
    contextText: 'body',
    items: [{ content: 'body', title: 'A' }],
    memoryCount: 1,
    truncated: false,
    ...(lifecycleState !== undefined ? { lifecycleState } : {}),
  });
}

describe('context-package-eligibility (ADR-1013)', () => {
  it('allows active and missing lifecycleState', () => {
    expect(isContextPackageEligibleForProjection(pkg())).toBe(true);
    expect(isContextPackageEligibleForProjection(pkg('active'))).toBe(true);
    expect(() => assertContextPackageEligibleForProjection(pkg('active'))).not.toThrow();
  });

  it('rejects retired and archived for presentation and prompt assembly', () => {
    expect(isContextPackageEligibleForProjection(pkg('retired'))).toBe(false);
    expect(isContextPackageEligibleForProjection(pkg('archived'))).toBe(false);

    expect(() => presentContextPackageText(pkg('retired'))).toThrow(ContextPackageNotEligibleError);
    expect(() =>
      assembleWorkspacePrompt({ userPrompt: 'hi', contextPackage: pkg('archived') }),
    ).toThrow(ContextPackageNotEligibleError);
  });
});
