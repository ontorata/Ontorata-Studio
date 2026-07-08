/**
 * P1-D W1 — consumer-facing context package types (immutable).
 * Studio treats recall as opaque; workspace may read but must not mutate packages.
 */

export type WorkspaceContextRequest = Readonly<{
  query: string;
  maxTokens?: number;
  project?: string;
}>;

export type WorkspaceContextItem = Readonly<{
  content: string;
  title?: string;
  candidateId?: string;
  sourceReference?: string;
  ordinal: number;
}>;

export type WorkspaceContextPackage = Readonly<{
  packageId: string;
  query: string;
  contextText: string;
  items: readonly WorkspaceContextItem[];
  memoryCount: number;
  truncated: boolean;
  consumedVia: 'sdk-context-api';
}>;

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== 'object') return value;
  Object.freeze(value);
  for (const child of Object.values(value as Record<string, unknown>)) {
    deepFreeze(child);
  }
  return value;
}

export function createWorkspaceContextPackage(input: {
  packageId: string;
  query: string;
  contextText: string;
  items: ReadonlyArray<Omit<WorkspaceContextItem, 'ordinal'>>;
  memoryCount: number;
  truncated: boolean;
}): WorkspaceContextPackage {
  const items = input.items.map((item, index) => ({ ...item, ordinal: index }));
  return deepFreeze({
    packageId: input.packageId,
    query: input.query,
    contextText: input.contextText,
    items,
    memoryCount: input.memoryCount,
    truncated: input.truncated,
    consumedVia: 'sdk-context-api',
  });
}

export function toContextSnapshotRef(
  contextPackage: WorkspaceContextPackage,
  fetchedAt = new Date().toISOString(),
): WorkspaceContextSnapshotRef {
  return deepFreeze({
    snapshotId: crypto.randomUUID(),
    packageId: contextPackage.packageId,
    query: contextPackage.query,
    fetchedAt,
    memoryCount: contextPackage.memoryCount,
    truncated: contextPackage.truncated,
  });
}

/** Session holds references only — not recall pipeline state. */
export type WorkspaceContextSnapshotRef = Readonly<{
  snapshotId: string;
  packageId: string;
  query: string;
  fetchedAt: string;
  memoryCount: number;
  truncated: boolean;
}>;
