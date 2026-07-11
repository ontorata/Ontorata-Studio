import { useCallback, useMemo, useRef } from 'react';
import { WorkspaceRecallOrchestrator } from '../application/session/workspace-recall-orchestrator';
import type { WorkspaceRecallOrchestrationResult } from '../application/session/workspace-recall-orchestrator';
import { WorkspaceRecallAdapter } from '../infrastructure/ratary/workspace-recall-adapter';
import { InMemoryWorkspaceSessionPort } from '../infrastructure/session/in-memory-workspace-session-port';
import { useOptionalStudioClient } from './useStudioClient';
import { useWorkspaceId } from './useWorkspacePath';

type SessionBinding = {
  workspaceId: string;
  sessionId: string;
};

/**
 * W3 — UI consumes recall only through WorkspaceRecallOrchestrator.
 * Presentation layer must not call StudioRataryClient.buildContext / SDK directly.
 */
export function useWorkspaceRecallOrchestrator() {
  const client = useOptionalStudioClient();
  const workspaceId = useWorkspaceId();
  const sessionPortRef = useRef(new InMemoryWorkspaceSessionPort());
  const bindingRef = useRef<SessionBinding | null>(null);

  const orchestrator = useMemo(() => {
    if (!client) return null;
    return new WorkspaceRecallOrchestrator(
      new WorkspaceRecallAdapter(client),
      sessionPortRef.current,
    );
  }, [client]);

  const ensureSessionId = useCallback(() => {
    if (!orchestrator) return null;
    const bound = bindingRef.current;
    if (bound && bound.workspaceId === workspaceId) {
      return bound.sessionId;
    }
    const session = orchestrator.createWorkspaceSession(workspaceId);
    bindingRef.current = { workspaceId, sessionId: session.sessionId };
    return session.sessionId;
  }, [orchestrator, workspaceId]);

  const attachContextPackage = useCallback(
    async (query: string, maxTokens = 2048): Promise<WorkspaceRecallOrchestrationResult> => {
      if (!orchestrator) {
        throw new Error('Workspace recall orchestrator unavailable — Ratary client not connected');
      }
      const sessionId = ensureSessionId();
      if (!sessionId) {
        throw new Error('Workspace session could not be created');
      }
      return orchestrator.attachContextPackage(sessionId, { query, maxTokens });
    },
    [ensureSessionId, orchestrator],
  );

  return {
    ready: Boolean(orchestrator),
    attachContextPackage,
  };
}
