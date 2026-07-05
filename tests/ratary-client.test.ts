import { describe, expect, it, vi } from 'vitest';
import { StudioRataryClient } from '../src/api/ratary-client';

describe('StudioRataryClient', () => {
  it('constructs SDK client from server base URL', () => {
    const client = new StudioRataryClient({
      baseUrl: 'http://localhost:3000/api/v1',
      apiKey: 'test-key',
    });
    expect(client.sdk.memory).toBeDefined();
  });

  it('delegates memory list to SDK', async () => {
    const client = new StudioRataryClient({ baseUrl: 'http://localhost:3000' });
    const spy = vi.spyOn(client.sdk.memory, 'list').mockResolvedValue({ memories: [] });
    await client.listMemories({ limit: 5 });
    expect(spy).toHaveBeenCalledWith({ limit: 5 });
  });

  it('routes graph traverse through SDK transport', async () => {
    const client = new StudioRataryClient({ baseUrl: 'http://localhost:3000' });
    const spy = vi.spyOn(client.sdk.transport, 'request').mockResolvedValue({ nodes: [] });
    await client.traverseGraph({ memoryId: '00000000-0000-4000-8000-000000000001', depth: 2 });
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'POST', path: '/graph/traverse' }),
    );
  });
});
