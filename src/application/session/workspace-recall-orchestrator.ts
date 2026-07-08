import type {
  WorkspaceContextPackage,
  WorkspaceContextRequest,
} from '../../domain/recall/workspace-context-package';
import { toContextSnapshotRef } from '../../domain/recall/workspace-context-package';
import type { WorkspaceRecallPort } from '../recall/workspace-recall.port';
import type { WorkspaceSession, WorkspaceSessionId } from '../../domain/session/workspace-session';
import type { WorkspaceSessionPort } from './workspace-session.port';

export type WorkspaceRecallOrchestrationResult = Readonly<{
  session: WorkspaceSession;
  contextPackage: WorkspaceContextPackage;
}>;

/**
 * Orchestrates session lifecycle + recall consumption.
 * Does not cache recall internals — only appends immutable snapshot refs.
 */
export class WorkspaceRecallOrchestrator {
  constructor(
    private readonly recallPort: WorkspaceRecallPort,
    private readonly sessionPort: WorkspaceSessionPort,
  ) {}

  createWorkspaceSession(workspaceId: string): WorkspaceSession {
    return this.sessionPort.createSession(workspaceId);
  }

  async attachContextPackage(
    sessionId: WorkspaceSessionId,
    request: WorkspaceContextRequest,
  ): Promise<WorkspaceRecallOrchestrationResult> {
    const existing = this.sessionPort.getSession(sessionId);
    if (!existing) {
      throw new Error(`Workspace session not found: ${sessionId}`);
    }

    const contextPackage = await this.recallPort.fetchContextPackage(request);
    const snapshot = toContextSnapshotRef(contextPackage);
    const session = this.sessionPort.appendContextSnapshot(sessionId, snapshot);
    return { session, contextPackage };
  }
}
