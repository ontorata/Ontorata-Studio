import { listDirectoryEntries } from './list-directory';
import { ensureReadWritePermission } from './file-system-permission';

export async function createFileInDirectory(
  dir: FileSystemDirectoryHandle,
  fileName: string,
): Promise<FileSystemFileHandle> {
  await ensureReadWritePermission(dir);
  return dir.getFileHandle(fileName, { create: true });
}

export async function createFolderInDirectory(
  dir: FileSystemDirectoryHandle,
  folderName: string,
): Promise<FileSystemDirectoryHandle> {
  await ensureReadWritePermission(dir);
  return dir.getDirectoryHandle(folderName, { create: true });
}

async function existingEntryNames(dir: FileSystemDirectoryHandle): Promise<Set<string>> {
  const entries = await listDirectoryEntries(dir);
  return new Set(entries.map((entry) => entry.name));
}

export async function generateUniqueFileName(dir: FileSystemDirectoryHandle): Promise<string> {
  const taken = await existingEntryNames(dir);
  const base = 'untitled';
  let candidate = `${base}.txt`;
  let index = 1;
  while (taken.has(candidate)) {
    candidate = `${base}-${index}.txt`;
    index += 1;
  }
  return candidate;
}

export async function generateUniqueFolderName(dir: FileSystemDirectoryHandle): Promise<string> {
  const taken = await existingEntryNames(dir);
  let candidate = 'New Folder';
  let index = 1;
  while (taken.has(candidate)) {
    candidate = `New Folder ${index}`;
    index += 1;
  }
  return candidate;
}
