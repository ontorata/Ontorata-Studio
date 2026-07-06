import { useLocation } from 'react-router-dom';
import { useWorkspaceBasePath } from './useWorkspacePath';

export function useIsLauncherHome(): boolean {
  const { pathname } = useLocation();
  const base = useWorkspaceBasePath();
  return pathname === base || pathname === `${base}/`;
}
