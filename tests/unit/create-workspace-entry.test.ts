import { describe, expect, it } from 'vitest';
import { generateUniqueFileName, generateUniqueFolderName } from '../../src/domain/workspace/create-workspace-entry';
import type { FsDirectoryEntry } from '../../src/domain/workspace/list-directory';

function mockDirectory(entries: FsDirectoryEntry[]): FileSystemDirectoryHandle {
  return {
    kind: 'directory',
    name: 'mock',
    entries: async function* () {
      for (const entry of entries) {
        yield [entry.name, entry.handle] as [string, FileSystemHandle];
      }
    },
  } as unknown as FileSystemDirectoryHandle;
}

describe('create-workspace-entry names', () => {
  it('generates untitled file names without collisions', async () => {
    const dir = mockDirectory([
      { name: 'untitled.txt', kind: 'file', handle: { kind: 'file' } as FileSystemFileHandle },
      { name: 'untitled-1.txt', kind: 'file', handle: { kind: 'file' } as FileSystemFileHandle },
    ]);

    await expect(generateUniqueFileName(dir)).resolves.toBe('untitled-2.txt');
  });

  it('generates unique folder names without collisions', async () => {
    const dir = mockDirectory([
      { name: 'New Folder', kind: 'directory', handle: { kind: 'directory' } as FileSystemDirectoryHandle },
      { name: 'New Folder 1', kind: 'directory', handle: { kind: 'directory' } as FileSystemDirectoryHandle },
    ]);

    await expect(generateUniqueFolderName(dir)).resolves.toBe('New Folder 2');
  });
});
