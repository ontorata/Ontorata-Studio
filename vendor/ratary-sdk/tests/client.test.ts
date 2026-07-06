import { describe, it, expect, vi } from 'vitest';
import { AiBrainClient, AiBrainApiError } from '../src/index.js';

describe('RestTransport', () => {
  it('sends Bearer and X-API-Key headers on authenticated requests', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({ id: '00000000-0000-4000-8000-000000000001' }, { status: 200 }),
    );

    const client = new AiBrainClient({
      baseUrl: 'http://localhost:3000',
      apiKey: 'aic_test_key',
      fetchImpl,
    });

    await client.memory.get('00000000-0000-4000-8000-000000000001');

    expect(fetchImpl).toHaveBeenCalledOnce();
    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer aic_test_key',
      'X-API-Key': 'aic_test_key',
    });
  });

  it('skips auth for public capabilities endpoint', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({ protocolVersion: '1.0.0' }, { status: 200 }),
    );

    const client = new AiBrainClient({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImpl,
    });

    const manifest = await client.capabilities.get();
    expect(manifest.protocolVersion).toBe('1.0.0');

    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(init.headers).not.toHaveProperty('Authorization');
  });

  it('negotiates capabilities over public POST endpoint', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json(
        {
          compatible: true,
          negotiatedProtocolVersion: '1.0.0',
          matched: { required: ['supportsMemoryCRUD'], preferred: [], transports: ['rest'] },
        },
        { status: 200 },
      ),
    );

    const client = new AiBrainClient({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImpl,
    });

    const result = await client.capabilities.negotiate({
      protocolVersion: '1.0.0',
      requiredCapabilities: ['supportsMemoryCRUD'],
      transports: ['rest'],
    });

    expect(result.compatible).toBe(true);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:3000/api/v1/capabilities/negotiate');
    expect(init.method).toBe('POST');
    expect(init.headers).not.toHaveProperty('Authorization');
  });

  it('throws AiBrainApiError on HTTP error', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({ message: 'Not found' }, { status: 404 }),
    );

    const client = new AiBrainClient({
      baseUrl: 'http://localhost:3000',
      apiKey: 'aic_test',
      fetchImpl,
    });

    await expect(client.memory.get('00000000-0000-4000-8000-000000000099')).rejects.toBeInstanceOf(
      AiBrainApiError,
    );
  });

  it('memory CRUD paths use /api/v1 prefix', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({ id: '00000000-0000-4000-8000-000000000001', title: 't' }, { status: 201 }),
    );

    const client = new AiBrainClient({
      baseUrl: 'http://localhost:3000',
      apiKey: 'aic_test',
      fetchImpl,
    });

    await client.memory.create({ title: 'Test', content: 'Body' });

    const [url] = fetchImpl.mock.calls[0] as [string];
    expect(url).toBe('http://localhost:3000/api/v1/memory');
  });
});
