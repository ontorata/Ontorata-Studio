import { ensureReadWritePermission } from './file-system-permission';

function normalizeRelativePath(relativePath: string): string[] {
  return relativePath.replace(/\\/g, '/').split('/').filter(Boolean);
}

/** Resolve a file handle through a read-write workspace root (inherits directory permission). */
export async function resolveFileHandle(
  root: FileSystemDirectoryHandle,
  relativePath: string,
  options?: { requestWrite?: boolean },
): Promise<FileSystemFileHandle> {
  const segments = normalizeRelativePath(relativePath);
  if (segments.length === 0) {
    throw new Error('Invalid file path.');
  }

  let dir: FileSystemDirectoryHandle = root;
  for (let i = 0; i < segments.length - 1; i++) {
    dir = await dir.getDirectoryHandle(segments[i]!);
  }

  const file = await dir.getFileHandle(segments[segments.length - 1]!);
  if (options?.requestWrite !== false) {
    await ensureReadWritePermission(file);
  }
  return file;
}
