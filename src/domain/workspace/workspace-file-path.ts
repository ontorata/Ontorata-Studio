export const WORKSPACE_FILE_PREFIX = 'file:';

export function isWorkspaceFilePath(path: string | null | undefined): boolean {
  return Boolean(path?.startsWith(WORKSPACE_FILE_PREFIX));
}

export function toWorkspaceFilePath(relativePath: string): string {
  return `${WORKSPACE_FILE_PREFIX}${relativePath}`;
}

export function fromWorkspaceFilePath(path: string): string {
  return path.slice(WORKSPACE_FILE_PREFIX.length);
}
