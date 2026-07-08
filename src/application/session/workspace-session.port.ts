import type { WorkspaceSession, WorkspaceSessionId } from '../../domain/session/workspace-session';
import type { WorkspaceContextSnapshotRef } from '../../domain/recall/workspace-context-package';

/** Session lifecycle port — no recall logic. */
export interface WorkspaceSessionPort {
  createSession(workspaceId: string): WorkspaceSession;
  getSession(sessionId: WorkspaceSessionId): WorkspaceSession | null;
  appendContextSnapshot(
    sessionId: WorkspaceSessionId,
    snapshot: WorkspaceContextSnapshotRef,
  ): WorkspaceSession;
}
