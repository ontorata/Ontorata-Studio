/**
 * P1-D W1 — consumer-facing context package types.
 * Studio treats recall as opaque; these types describe workspace consumption only.
 */

export type WorkspaceContextRequest = {
  query: string;
  maxTokens?: number;
  project?: string;
};

export type WorkspaceContextItem = {
  content: string;
  title?: string;
  candidateId?: string;
  sourceReference?: string;
  ordinal: number;
};

export type WorkspaceContextPackage = {
  packageId: string;
  query: string;
  contextText: string;
  items: WorkspaceContextItem[];
  memoryCount: number;
  truncated: boolean;
  consumedVia: 'sdk-context-api';
};

export function createWorkspaceContextPackage(input: {
  packageId: string;
  query: string;
  contextText: string;
  items: Omit<WorkspaceContextItem, 'ordinal'>[];
  memoryCount: number;
  truncated: boolean;
}): WorkspaceContextPackage {
  return {
    packageId: input.packageId,
    query: input.query,
    contextText: input.contextText,
    items: input.items.map((item, index) => ({ ...item, ordinal: index })),
    memoryCount: input.memoryCount,
    truncated: input.truncated,
    consumedVia: 'sdk-context-api',
  };
}
