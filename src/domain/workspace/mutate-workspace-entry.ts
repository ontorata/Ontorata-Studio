import { ensureReadWritePermission } from './file-system-permission';

function normalizeRelativePath(relativePath: string): string[] {
  return relativePath.replace(/\\/g, '/').split('/').filter(Boolean);
}

export function splitWorkspaceRelativePath(relativePath: string): {
  parentPath: string;
  entryName: string;
} {
  const segments = normalizeRelativePath(relativePath);
  if (segments.length === 0) {
    throw new Error('Invalid file path.');
  }
  const entryName = segments[segments.length - 1]!;
  const parentPath = segments.slice(0, -1).join('/');
  return { parentPath, entryName };
}

export async function resolveParentDirectory(
  root: FileSystemDirectoryHandle,
  relativePath: string,
): Promise<{ parent: FileSystemDirectoryHandle; entryName: string }> {
  const { parentPath, entryName } = splitWorkspaceRelativePath(relativePath);
  let parent: FileSystemDirectoryHandle = root;

  for (const segment of normalizeRelativePath(parentPath)) {
    parent = await parent.getDirectoryHandle(segment);
  }

  await ensureReadWritePermission(parent);
  return { parent, entryName };
}

type MovableHandle = FileSystemHandle & {
  move: (newName: string) => Promise<FileSystemHandle>;
};

export async function resolveDirectoryHandle(
  root: FileSystemDirectoryHandle,
  relativePath: string,
): Promise<FileSystemDirectoryHandle> {
  if (!relativePath.trim()) {
    await ensureReadWritePermission(root);
    return root;
  }

  let dir: FileSystemDirectoryHandle = root;
  for (const segment of normalizeRelativePath(relativePath)) {
    dir = await dir.getDirectoryHandle(segment);
  }

  await ensureReadWritePermission(dir);
  return dir;
}

export async function renameWorkspaceFolder(
  root: FileSystemDirectoryHandle,
  relativePath: string,
  newFolderName: string,
): Promise<string> {
  const trimmed = newFolderName.trim();
  if (!trimmed || trimmed.includes('/') || trimmed.includes('\\')) {
    throw new Error('Invalid folder name.');
  }

  const { parentPath, entryName } = splitWorkspaceRelativePath(relativePath);
  const { parent, entryName: currentName } = await resolveParentDirectory(root, relativePath);
  const handle = await parent.getDirectoryHandle(currentName);

  if (trimmed === entryName || trimmed === currentName) {
    return relativePath;
  }

  const movable = handle as unknown as MovableHandle;
  if (typeof movable.move === 'function') {
    await movable.move(trimmed);
    return parentPath ? `${parentPath}/${trimmed}` : trimmed;
  }

  // Empty-folder fallback when move() is unavailable (common for new folders).
  await parent.getDirectoryHandle(trimmed, { create: true });
  await parent.removeEntry(currentName, { recursive: true });
  return parentPath ? `${parentPath}/${trimmed}` : trimmed;
}

export async function deleteWorkspaceFolder(
  root: FileSystemDirectoryHandle,
  relativePath: string,
): Promise<void> {
  const { parent, entryName } = await resolveParentDirectory(root, relativePath);
  await parent.removeEntry(entryName, { recursive: true });
}

export async function renameWorkspaceFile(
  root: FileSystemDirectoryHandle,
  relativePath: string,
  newFileName: string,
): Promise<{ relativePath: string; handle: FileSystemFileHandle }> {
  const trimmed = newFileName.trim();
  if (!trimmed || trimmed.includes('/') || trimmed.includes('\\')) {
    throw new Error('Invalid file name.');
  }

  const { parentPath, entryName } = splitWorkspaceRelativePath(relativePath);
  const { parent, entryName: currentName } = await resolveParentDirectory(root, relativePath);
  const handle = await parent.getFileHandle(currentName);

  if (trimmed === entryName) {
    return { relativePath, handle };
  }

  const movable = handle as unknown as MovableHandle;
  if (typeof movable.move !== 'function') {
    throw new Error('Rename is not supported in this browser.');
  }

  const moved = (await movable.move(trimmed)) as FileSystemFileHandle;
  await ensureReadWritePermission(moved);
  return {
    relativePath: parentPath ? `${parentPath}/${trimmed}` : trimmed,
    handle: moved,
  };
}

export async function deleteWorkspaceFile(
  root: FileSystemDirectoryHandle,
  relativePath: string,
): Promise<void> {
  const { parent, entryName } = await resolveParentDirectory(root, relativePath);
  await parent.removeEntry(entryName);
}
