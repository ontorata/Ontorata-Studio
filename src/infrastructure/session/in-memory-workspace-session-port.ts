import type { WorkspaceSessionPort } from '../../application/session/workspace-session.port';
import type { WorkspaceContextSnapshotRef } from '../../domain/recall/workspace-context-package';
import type { WorkspaceSession, WorkspaceSessionId } from '../../domain/session/workspace-session';

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== 'object') return value;
  Object.freeze(value);
  for (const child of Object.values(value as Record<string, unknown>)) {
    deepFreeze(child);
  }
  return value;
}

/** In-memory session store for W2 — orchestration only, no recall state. */
export class InMemoryWorkspaceSessionPort implements WorkspaceSessionPort {
  private readonly sessions = new Map<WorkspaceSessionId, WorkspaceSession>();

  createSession(workspaceId: string): WorkspaceSession {
    const now = new Date().toISOString();
    const session = deepFreeze({
      sessionId: crypto.randomUUID(),
      workspaceId,
      contextSnapshots: [],
      createdAt: now,
      updatedAt: now,
    });
    this.sessions.set(session.sessionId, session);
    return session;
  }

  getSession(sessionId: WorkspaceSessionId): WorkspaceSession | null {
    return this.sessions.get(sessionId) ?? null;
  }

  appendContextSnapshot(
    sessionId: WorkspaceSessionId,
    snapshot: WorkspaceContextSnapshotRef,
  ): WorkspaceSession {
    const current = this.sessions.get(sessionId);
    if (!current) {
      throw new Error(`Workspace session not found: ${sessionId}`);
    }
    const updated = deepFreeze({
      ...current,
      contextSnapshots: [...current.contextSnapshots, snapshot],
      updatedAt: new Date().toISOString(),
    });
    this.sessions.set(sessionId, updated);
    return updated;
  }
}
