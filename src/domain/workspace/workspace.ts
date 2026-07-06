export type WorkspaceType = 'personal' | 'organization';

export interface WorkspaceRef {
  id: string;
  type: WorkspaceType;
  displayName: string;
  organizationId?: string;
}
