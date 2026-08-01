import type { BuildContextResult } from '@ratary/sdk';
import {
  createWorkspaceContextPackage,
  type WorkspaceContextPackage,
  type WorkspaceContextRequest,
} from '../../domain/recall/workspace-context-package';

function readBoolean(value: unknown): boolean {
  return value === true;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readSourceLabels(value: unknown): readonly string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return Object.freeze(value.filter((entry): entry is string => typeof entry === 'string'));
}

function readConfidence(
  value: unknown,
): 'high' | 'medium' | 'low' | number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value === 'high' || value === 'medium' || value === 'low') return value;
  return undefined;
}

function readLifecycleState(
  value: unknown,
): 'active' | 'retired' | 'archived' | undefined {
  if (value === 'active' || value === 'retired' || value === 'archived') return value;
  return undefined;
}

/**
 * Maps canonical SDK context output to workspace consumption shape.
 * Prefers Ratary-issued ADR-1011 envelope; falls back to client UUID during rollout.
 * Preserves server order; Studio does not rank or filter candidates.
 */
export function mapSdkContextResult(
  request: WorkspaceContextRequest,
  result: BuildContextResult,
  fallbackPackageId: string,
): WorkspaceContextPackage {
  const contextText = readString(result.context);
  const memoryCount = readNumber(result.memoryCount, contextText ? 1 : 0);
  const truncated = readBoolean(result.truncated);

  const rawItems = Array.isArray(result.items) ? result.items : [];
  const items =
    rawItems.length > 0
      ? rawItems.map((entry) => {
          const record = entry as Record<string, unknown>;
          return {
            content: readString(record.content ?? record.text),
            title: readString(record.title) || undefined,
            candidateId: readString(record.candidateId) || undefined,
            sourceReference: readString(record.sourceReference) || undefined,
          };
        })
      : contextText
        ? [{ content: contextText }]
        : [];

  const packageId = readOptionalString(result.packageId) ?? fallbackPackageId;
  const query = readOptionalString(result.query) ?? request.query;
  const sourceLabels = readSourceLabels(result.sourceLabels);

  return createWorkspaceContextPackage({
    packageId,
    query,
    contextText,
    items,
    memoryCount,
    truncated,
    ownerId: readOptionalString(result.ownerId),
    createdAt: readOptionalString(result.createdAt),
    confidence: readConfidence(result.confidence),
    confidenceModel: readOptionalString(result.confidenceModel),
    updateMechanism: readOptionalString(result.updateMechanism),
    lifecycleState: readLifecycleState(result.lifecycleState),
    sourceLabels,
  });
}
