export function normalizeRelativePath(path: string): string {
  return path.replace(/\\/g, '/');
}

export function isDirtyFile(relativePath: string, dirtyFiles: readonly string[]): boolean {
  return dirtyFiles.includes(normalizeRelativePath(relativePath));
}

/** True when any open dirty file lives inside this folder (or workspace root when folderPath is empty). */
export function folderHasDirtyDescendants(
  folderPath: string,
  dirtyFiles: readonly string[],
): boolean {
  if (dirtyFiles.length === 0) return false;

  const normalizedFolder = normalizeRelativePath(folderPath);
  const prefix = normalizedFolder ? `${normalizedFolder}/` : '';

  for (const dirtyPath of dirtyFiles) {
    if (!prefix) return true;
    if (dirtyPath.startsWith(prefix)) return true;
  }

  return false;
}
