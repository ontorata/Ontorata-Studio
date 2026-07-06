import type { WorkspaceRef } from '../../domain/workspace/workspace';

/** Phase 06 — workspace shell. */
export interface WorkspacePort {
  getCurrent(): WorkspaceRef;
  list(): Promise<WorkspaceRef[]>;
}
