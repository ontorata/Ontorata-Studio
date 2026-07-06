import { useParams } from 'react-router-dom';
import { getDefaultWorkspaceId } from '../config/env';

export function useWorkspaceId(): string {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  return workspaceId ?? getDefaultWorkspaceId();
}

export function useWorkspaceBasePath(): string {
  const workspaceId = useWorkspaceId();
  return `/workspace/${workspaceId}`;
}
