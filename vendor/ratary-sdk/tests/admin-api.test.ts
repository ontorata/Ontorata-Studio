import { describe, expect, it, vi } from 'vitest';
import { AdminClient } from '../src/admin/index.js';
import { AiBrainClient } from '../src/index.js';
import type { IApiClient, RequestOptions } from '../src/ports/iapi-client.js';

class MockTransport implements IApiClient {
  readonly calls: RequestOptions[] = [];

  async request<T>(options: RequestOptions): Promise<T> {
    this.calls.push(options);
    return { ok: true, path: options.path } as T;
  }
}

describe('@ratary/sdk admin modules', () => {
  it('CloudApi covers cloud admin routes', async () => {
    const transport = new MockTransport();
    const admin = new AdminClient(transport);
    await admin.cloud.getStatus();
    await admin.cloud.listRegions();
    await admin.cloud.provisionWorkspace({ orgId: 'o1' });
    expect(transport.calls.map((c) => c.path)).toEqual([
      '/cloud/status',
      '/cloud/regions',
      '/cloud/workspaces/provision',
    ]);
  });

  it('KnowledgeFabricApi covers ingest and sync routes', async () => {
    const transport = new MockTransport();
    const admin = new AdminClient(transport);
    await admin.knowledgeFabric.listConnectors();
    await admin.knowledgeFabric.ingest('notion', { mode: 'full' });
    await admin.knowledgeFabric.sync('notion', { mode: 'incremental' });
    expect(transport.calls.map((c) => `${c.method} ${c.path}`)).toEqual([
      'GET /knowledge-fabric/connectors',
      'POST /knowledge-fabric/ingest/notion',
      'POST /knowledge-fabric/sync/notion',
    ]);
  });

  it('AdminFederationApi covers federation exchange routes', async () => {
    const transport = new MockTransport();
    const admin = new AdminClient(transport);
    await admin.federation.listPeers();
    await admin.federation.pull({
      peerId: 'p1',
      sourceNodeId: 'n1',
      sourceOwnerId: 'owner',
    });
    expect(transport.calls.at(-1)?.path).toBe('/federation/exchange/pull');
  });
});

describe('AiBrainClient', () => {
  it('exposes admin namespace on construct', () => {
    const client = new AiBrainClient({
      baseUrl: 'http://localhost:3000',
      apiKey: 'aic_test',
      fetchImpl: vi.fn(),
    });
    expect(client.admin).toBeDefined();
    expect(client.admin.cloud).toBeDefined();
    expect(client.admin.knowledgeFabric).toBeDefined();
  });
});
