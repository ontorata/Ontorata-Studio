import type { IApiClient } from '../ports/iapi-client.js';
import type {
  AdminJson,
  ConnectorDescriptor,
  ConnectorSyncEnqueueResult,
  FabricIngestMode,
  FabricIngestRun,
} from '../types/admin.types.js';
import type { ConnectorId } from '../types/connector.types.js';

export class KnowledgeFabricApi {
  constructor(private readonly client: IApiClient) {}

  getStatus(): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/knowledge-fabric/status' });
  }

  getManifest(): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/knowledge-fabric/manifest' });
  }

  listConnectors(): Promise<{ connectors: ConnectorDescriptor[]; count: number }> {
    return this.client.request({ method: 'GET', path: '/knowledge-fabric/connectors' });
  }

  listIngestRuns(limit?: number): Promise<{ runs: FabricIngestRun[]; count: number }> {
    return this.client.request({
      method: 'GET',
      path: '/knowledge-fabric/ingest/runs',
      query: limit !== undefined ? { limit } : undefined,
    });
  }

  getConnectorState(connectorId: ConnectorId): Promise<AdminJson> {
    return this.client.request({
      method: 'GET',
      path: `/knowledge-fabric/ingest/state/${connectorId}`,
    });
  }

  ingest(connectorId: ConnectorId, body: FabricIngestMode = {}): Promise<FabricIngestRun> {
    return this.client.request({
      method: 'POST',
      path: `/knowledge-fabric/ingest/${connectorId}`,
      body,
    });
  }

  /** Phase 29 — enqueue async sync (returns immediately when server accepts job). */
  sync(connectorId: ConnectorId, body: FabricIngestMode = {}): Promise<ConnectorSyncEnqueueResult> {
    return this.client.request({
      method: 'POST',
      path: `/knowledge-fabric/sync/${connectorId}`,
      body,
    });
  }

  getSyncJob(jobId: string): Promise<FabricIngestRun> {
    return this.client.request({ method: 'GET', path: `/knowledge-fabric/sync/jobs/${jobId}` });
  }
}
