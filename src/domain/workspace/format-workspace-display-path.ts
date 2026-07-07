/** Normalize workspace file path for header display (always forward slashes). */
export function formatWorkspaceDisplayPath(workspaceName: string | undefined, relativePath: string): string {
  const normalizedRelative = relativePath.replace(/\\/g, '/');
  if (!workspaceName) return normalizedRelative;
  return `${workspaceName}/${normalizedRelative}`;
}
