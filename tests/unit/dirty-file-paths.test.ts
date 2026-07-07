import { describe, expect, it } from 'vitest';
import { folderHasDirtyDescendants, isDirtyFile } from '../../src/domain/workspace/dirty-file-paths';

describe('dirty-file-paths', () => {
  const dirty = ['_backups/chat/git-log.txt', 'readme.md'];

  it('marks individual files as dirty', () => {
    expect(isDirtyFile('_backups/chat/git-log.txt', dirty)).toBe(true);
    expect(isDirtyFile('other.txt', dirty)).toBe(false);
  });

  it('marks ancestor folders when descendants are dirty', () => {
    expect(folderHasDirtyDescendants('_backups', dirty)).toBe(true);
    expect(folderHasDirtyDescendants('_backups/chat', dirty)).toBe(true);
    expect(folderHasDirtyDescendants('src', dirty)).toBe(false);
    expect(folderHasDirtyDescendants('', dirty)).toBe(true);
  });
});
