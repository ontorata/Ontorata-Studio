import { describe, expect, it } from 'vitest';
import { mapSdkContextResult } from '../../src/infrastructure/ratary/map-sdk-context-result';

describe('mapSdkContextResult', () => {
  it('maps structured SDK items without reordering', () => {
    const pkg = mapSdkContextResult(
      { query: 'project mangrove' },
      {
        context: 'a\nb',
        memoryCount: 2,
        items: [
          { content: 'a', candidateId: 'cand-a' },
          { content: 'b', candidateId: 'cand-b' },
        ],
      },
      'pkg-test',
    );
    expect(pkg.items.map((item) => item.candidateId)).toEqual(['cand-a', 'cand-b']);
    expect(pkg.items.map((item) => item.ordinal)).toEqual([0, 1]);
  });

  it('falls back to context string when items are absent', () => {
    const pkg = mapSdkContextResult(
      { query: 'q' },
      { context: 'only-context', memoryCount: 1 },
      'pkg-fallback',
    );
    expect(pkg.items).toHaveLength(1);
    expect(pkg.items[0]?.content).toBe('only-context');
  });
});
