import { useCallback, useMemo, useRef } from 'react';
import { WorkspaceAiInteractionPipeline } from '../application/ai/workspace-ai-interaction-pipeline';
import type { WorkspaceAiInteractionResult } from '../application/ai/workspace-ai-interaction-pipeline';
import type { WorkspaceAiRuntimePort } from '../application/ai/workspace-ai-runtime.port';
import { WorkspaceRecallOrchestrator } from '../application/session/workspace-recall-orchestrator';
import { getDefaultOntoryBaseUrl } from '../config/env';
import { EchoWorkspaceAiRuntime } from '../infrastructure/ai/echo-workspace-ai-runtime';
import { OntoryRestWorkspaceAiRuntime } from '../infrastructure/ai/ontory-rest-workspace-ai-runtime';
import { WorkspaceRecallAdapter } from '../infrastructure/ratary/workspace-recall-adapter';
import { InMemoryWorkspaceSessionPort } from '../infrastructure/session/in-memory-workspace-session-port';
import { useOptionalStudioClient } from './useStudioClient';
import { useWorkspaceId } from './useWorkspacePath';

type SessionBinding = {
  workspaceId: string;
  sessionId: string;
};

function resolveRuntimePort(): WorkspaceAiRuntimePort {
  const mode = import.meta.env.VITE_ONTORY_RUNTIME?.trim().toLowerCase();
  if (mode === 'echo') {
    return new EchoWorkspaceAiRuntime();
  }
  // Default P2-A path: Studio talks to Ontory over HTTP only.
  return new OntoryRestWorkspaceAiRuntime({ baseUrl: getDefaultOntoryBaseUrl() });
}

/**
 * AI interaction via WorkspaceAiRuntimePort.
 * Prefer Ontory REST; set VITE_ONTORY_RUNTIME=echo for local-only fallback.
 */
export function useWorkspaceAiPipeline() {
  const client = useOptionalStudioClient();
  const workspaceId = useWorkspaceId();
  const sessionPortRef = useRef(new InMemoryWorkspaceSessionPort());
  const bindingRef = useRef<SessionBinding | null>(null);
  const runtimeRef = useRef(resolveRuntimePort());

  const recallOrchestrator = useMemo(() => {
    if (!client) return null;
    return new WorkspaceRecallOrchestrator(
      new WorkspaceRecallAdapter(client),
      sessionPortRef.current,
    );
  }, [client]);

  const pipeline = useMemo(() => {
    if (!recallOrchestrator) return null;
    return new WorkspaceAiInteractionPipeline(recallOrchestrator, runtimeRef.current);
  }, [recallOrchestrator]);

  const ensureSessionId = useCallback(() => {
    if (!recallOrchestrator) return null;
    const bound = bindingRef.current;
    if (bound && bound.workspaceId === workspaceId) {
      return bound.sessionId;
    }
    const session = recallOrchestrator.createWorkspaceSession(workspaceId);
    bindingRef.current = { workspaceId, sessionId: session.sessionId };
    return session.sessionId;
  }, [recallOrchestrator, workspaceId]);

  const runAiInteraction = useCallback(
    async (userPrompt: string, maxTokens = 2048): Promise<WorkspaceAiInteractionResult> => {
      if (!pipeline) {
        throw new Error('Workspace AI pipeline unavailable — Ratary client not connected');
      }
      const sessionId = ensureSessionId();
      if (!sessionId) {
        throw new Error('Workspace session could not be created');
      }
      return pipeline.run({
        sessionId,
        userPrompt,
        workspaceId,
        maxTokens,
      });
    },
    [ensureSessionId, pipeline, workspaceId],
  );

  return {
    ready: Boolean(pipeline),
    runAiInteraction,
  };
}
