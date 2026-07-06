import type { WorkspacePort } from '../../application/workspace/workspace-port';
import type { WorkspaceRef } from '../../domain/workspace/workspace';

const DEFAULT_WORKSPACE: WorkspaceRef = {
  id: 'personal-default',
  type: 'personal',
  displayName: 'Personal',
};

/** Phase 06 — single default personal workspace. */
export class DefaultWorkspacePort implements WorkspacePort {
  getCurrent(): WorkspaceRef {
    return DEFAULT_WORKSPACE;
  }

  async list(): Promise<WorkspaceRef[]> {
    return [DEFAULT_WORKSPACE];
  }
}
