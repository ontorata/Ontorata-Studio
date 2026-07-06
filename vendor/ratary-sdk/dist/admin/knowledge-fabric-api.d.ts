import type { IApiClient } from '../ports/iapi-client.js';
import type { AdminJson, ConnectorDescriptor, ConnectorSyncEnqueueResult, FabricIngestMode, FabricIngestRun } from '../types/admin.types.js';
import type { ConnectorId } from '../types/connector.types.js';
export declare class KnowledgeFabricApi {
    private readonly client;
    constructor(client: IApiClient);
    getStatus(): Promise<AdminJson>;
    getManifest(): Promise<AdminJson>;
    listConnectors(): Promise<{
        connectors: ConnectorDescriptor[];
        count: number;
    }>;
    listIngestRuns(limit?: number): Promise<{
        runs: FabricIngestRun[];
        count: number;
    }>;
    getConnectorState(connectorId: ConnectorId): Promise<AdminJson>;
    ingest(connectorId: ConnectorId, body?: FabricIngestMode): Promise<FabricIngestRun>;
    /** Phase 29 — enqueue async sync (returns immediately when server accepts job). */
    sync(connectorId: ConnectorId, body?: FabricIngestMode): Promise<ConnectorSyncEnqueueResult>;
    getSyncJob(jobId: string): Promise<FabricIngestRun>;
}
//# sourceMappingURL=knowledge-fabric-api.d.ts.map