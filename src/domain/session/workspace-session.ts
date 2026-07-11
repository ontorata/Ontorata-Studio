import type { WorkspaceContextSnapshotRef } from '../../domain/recall/workspace-context-package';

export type WorkspaceSessionId = string;

/** Recall-stateless workspace session — stores snapshot references only. */
export type WorkspaceSession = Readonly<{
  sessionId: WorkspaceSessionId;
  workspaceId: string;
  contextSnapshots: readonly WorkspaceContextSnapshotRef[];
  createdAt: string;
  updatedAt: string;
}>;
