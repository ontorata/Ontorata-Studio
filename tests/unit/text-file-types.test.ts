import { describe, expect, it } from 'vitest';
import { getFileExtension, isLikelyTextFile } from '../../src/domain/workspace/text-file-types';

describe('isLikelyTextFile', () => {
  it('accepts programming, config, and document types from the editor catalog', () => {
    expect(isLikelyTextFile('app.vue')).toBe(true);
    expect(isLikelyTextFile('main.py')).toBe(true);
    expect(isLikelyTextFile('Program.cs')).toBe(true);
    expect(isLikelyTextFile('query.sql')).toBe(true);
    expect(isLikelyTextFile('batas.geojson')).toBe(true);
    expect(isLikelyTextFile('config.toml')).toBe(true);
    expect(isLikelyTextFile('.gitignore')).toBe(true);
    expect(isLikelyTextFile('Dockerfile')).toBe(true);
    expect(isLikelyTextFile('notes.md')).toBe(true);
    expect(isLikelyTextFile('.env')).toBe(true);
  });

  it('rejects common binary assets', () => {
    expect(isLikelyTextFile('photo.png')).toBe(false);
    expect(isLikelyTextFile('archive.zip')).toBe(false);
    expect(isLikelyTextFile('binary.exe')).toBe(false);
  });

  it('parses dotted config filenames', () => {
    expect(getFileExtension('.gitignore')).toBe('gitignore');
    expect(getFileExtension('.htaccess')).toBe('htaccess');
    expect(getFileExtension('Dockerfile')).toBe('');
  });
});
