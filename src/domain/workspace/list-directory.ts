export interface FsDirectoryEntry {
  name: string;
  kind: 'file' | 'directory';
  handle: FileSystemFileHandle | FileSystemDirectoryHandle;
}

type DirectoryHandleWithEntries = FileSystemDirectoryHandle & {
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
};

/** List and sort entries in a directory handle (directories first, then name). */
export async function listDirectoryEntries(
  dirHandle: FileSystemDirectoryHandle,
): Promise<FsDirectoryEntry[]> {
  const entries: FsDirectoryEntry[] = [];
  const iterable = (dirHandle as DirectoryHandleWithEntries).entries();

  for await (const [name, handle] of iterable) {
    if (handle.kind !== 'file' && handle.kind !== 'directory') continue;
    entries.push({
      name,
      kind: handle.kind,
      handle: handle as FileSystemFileHandle | FileSystemDirectoryHandle,
    });
  }

  entries.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

  return entries;
}
