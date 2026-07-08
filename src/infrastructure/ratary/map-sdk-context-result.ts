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

/**
 * Maps canonical SDK context output to workspace consumption shape.
 * Preserves server order; Studio does not rank or filter candidates.
 */
export function mapSdkContextResult(
  request: WorkspaceContextRequest,
  result: BuildContextResult,
  packageId: string,
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

  return createWorkspaceContextPackage({
    packageId,
    query: request.query,
    contextText,
    items,
    memoryCount,
    truncated,
  });
}
