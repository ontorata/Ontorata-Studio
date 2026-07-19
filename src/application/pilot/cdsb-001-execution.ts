import { createAIExecutionRequest } from '../../domain/ai/ai-execution-request';
import type { Cdsb001FormInput } from '../../domain/pilot/cdsb-001-prompt';
import { assembleCdsb001Prompt } from '../../domain/pilot/cdsb-001-prompt';
import type {
  WorkspaceAiCompletion,
  WorkspaceAiRuntimePort,
} from '../ai/workspace-ai-runtime.port';

export type Cdsb001ExecutionInput = Cdsb001FormInput &
  Readonly<{
    workspaceId: string;
  }>;

/**
 * PILOT-001 CDSB-001 — direct Ontory REST execution without recall orchestration.
 */
export async function executeCdsb001Brief(
  runtime: WorkspaceAiRuntimePort,
  input: Cdsb001ExecutionInput,
): Promise<WorkspaceAiCompletion> {
  const prompt = assembleCdsb001Prompt(input);
  const request = createAIExecutionRequest({
    prompt,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    tools: [],
    metadata: Object.freeze({
      pilotId: 'CDSB-001',
      workload: 'client-delivery-status-brief',
      projectId: input.projectId,
      weekRange: input.weekRange,
    }),
  });
  return runtime.complete(request);
}
