import type {
  WorkspaceContextPackage,
  WorkspaceContextRequest,
} from '../../domain/recall/workspace-context-package';

/** P1-D — sole application entry for recall consumption in Studio. */
export interface WorkspaceRecallPort {
  fetchContextPackage(request: WorkspaceContextRequest): Promise<WorkspaceContextPackage>;
}
