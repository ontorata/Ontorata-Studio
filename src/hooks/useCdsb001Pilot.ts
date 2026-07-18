import { useCallback, useRef } from 'react';
import { executeCdsb001Brief } from '../application/pilot/cdsb-001-execution';
import type { Cdsb001FormInput } from '../domain/pilot/cdsb-001-prompt';
import { getDefaultOntoryBaseUrl } from '../config/env';
import { EchoWorkspaceAiRuntime } from '../infrastructure/ai/echo-workspace-ai-runtime';
import { OntoryRestWorkspaceAiRuntime } from '../infrastructure/ai/ontory-rest-workspace-ai-runtime';
import type { WorkspaceAiRuntimePort } from '../application/ai/workspace-ai-runtime.port';
import { useWorkspaceId } from './useWorkspacePath';

function resolveRuntimePort(): WorkspaceAiRuntimePort {
  const mode = import.meta.env.VITE_ONTORY_RUNTIME?.trim().toLowerCase();
  if (mode === 'echo') {
    return new EchoWorkspaceAiRuntime();
  }
  return new OntoryRestWorkspaceAiRuntime({ baseUrl: getDefaultOntoryBaseUrl() });
}

export function useCdsb001Pilot() {
  const workspaceId = useWorkspaceId();
  const runtimeRef = useRef(resolveRuntimePort());

  const executeBrief = useCallback(
    async (form: Cdsb001FormInput) => {
      if (!workspaceId) {
        throw new Error('Workspace ID required for CDSB-001');
      }
      return executeCdsb001Brief(runtimeRef.current, { ...form, workspaceId });
    },
    [workspaceId],
  );

  return {
    ready: Boolean(workspaceId),
    executeBrief,
  };
}
