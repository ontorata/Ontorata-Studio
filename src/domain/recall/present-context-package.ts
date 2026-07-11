import type { WorkspaceContextPackage } from '../recall/workspace-context-package';

/**
 * Presentation helpers for UI consumption of immutable ContextPackage.
 * Read-only: never reorder, filter, trim, or merge packages.
 */
export function listContextSourceLabels(
  contextPackage: WorkspaceContextPackage,
): readonly string[] {
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
  const sources = listContextSourceLabels(contextPackage);
  const sourceBlock =
    sources.length > 0 ? `\n\nSources:\n${sources.map((label) => `• ${label}`).join('\n')}` : '';
  return `${contextPackage.contextText}${sourceBlock}`;
}
