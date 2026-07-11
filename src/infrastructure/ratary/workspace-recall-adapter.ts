import type { WorkspaceRecallPort } from '../../application/recall/workspace-recall.port';
import type {
  WorkspaceContextPackage,
  WorkspaceContextRequest,
} from '../../domain/recall/workspace-context-package';
import { mapSdkContextResult } from './map-sdk-context-result';
import type { StudioRataryClient } from './studio-ratary-client';

/** SDK-only recall consumer adapter — no Ratary recall internals. */
export class WorkspaceRecallAdapter implements WorkspaceRecallPort {
  constructor(private readonly client: StudioRataryClient) {}

  async fetchContextPackage(request: WorkspaceContextRequest): Promise<WorkspaceContextPackage> {
    const sdkResult = await this.client.buildContext({
      task: request.query,
      maxTokens: request.maxTokens,
      project: request.project,
    });
    return mapSdkContextResult(request, sdkResult, crypto.randomUUID());
  }
}
