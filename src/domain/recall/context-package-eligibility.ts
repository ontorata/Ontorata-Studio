import type { WorkspaceContextPackage } from './workspace-context-package';

/**
 * ADR-1013 Studio consumer policy: packages known as retired/archived
 * MUST NOT be projected into new assistant turns or UI presentation.
 * Missing lifecycleState remains eligible (pre-wire / remint rollout).
 */
export class ContextPackageNotEligibleError extends Error {
  readonly packageId: string;
  readonly lifecycleState: string;

  constructor(packageId: string, lifecycleState: string) {
    super(
      `Context Package ${packageId} is not eligible for new work (lifecycleState=${lifecycleState})`,
    );
    this.name = 'ContextPackageNotEligibleError';
    this.packageId = packageId;
    this.lifecycleState = lifecycleState;
  }
}

export function isContextPackageEligibleForProjection(
  contextPackage: WorkspaceContextPackage,
): boolean {
  const state = contextPackage.lifecycleState;
  if (state === undefined) return true;
  return state === 'active';
}

export function assertContextPackageEligibleForProjection(
  contextPackage: WorkspaceContextPackage,
): void {
  if (!isContextPackageEligibleForProjection(contextPackage)) {
    throw new ContextPackageNotEligibleError(
      contextPackage.packageId,
      contextPackage.lifecycleState ?? 'unknown',
    );
  }
}
