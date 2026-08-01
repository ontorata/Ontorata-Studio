import type { WorkspaceContextPackage } from '../recall/workspace-context-package';
import { assertContextPackageEligibleForProjection } from './context-package-eligibility';

/**
 * Presentation helpers for UI consumption of immutable ContextPackage.
 * Read-only: never reorder, filter, trim, or merge packages.
 */
export function listContextSourceLabels(
  contextPackage: WorkspaceContextPackage,
): readonly string[] {
  if (contextPackage.sourceLabels && contextPackage.sourceLabels.length > 0) {
    return contextPackage.sourceLabels;
  }
  return contextPackage.items.map((item) => {
    return item.title ?? item.candidateId ?? item.sourceReference ?? `item-${item.ordinal}`;
  });
}

export function listContextSourceIds(
  contextPackage: WorkspaceContextPackage,
): readonly string[] {
  return contextPackage.items
    .map((item) => item.candidateId)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);
}

/** Build assistant-visible text from package fields without mutating/trimming content. */
export function presentContextPackageText(contextPackage: WorkspaceContextPackage): string {
  assertContextPackageEligibleForProjection(contextPackage);
  const sources = listContextSourceLabels(contextPackage);
  const sourceBlock =
    sources.length > 0 ? `\n\nSources:\n${sources.map((label) => `• ${label}`).join('\n')}` : '';
  return `${contextPackage.contextText}${sourceBlock}`;
}
