export class KnowledgeFabricApi {
    client;
    constructor(client) {
        this.client = client;
    }
    getStatus() {
        return this.client.request({ method: 'GET', path: '/knowledge-fabric/status' });
    }
    getManifest() {
        return this.client.request({ method: 'GET', path: '/knowledge-fabric/manifest' });
    }
    listConnectors() {
        return this.client.request({ method: 'GET', path: '/knowledge-fabric/connectors' });
    }
    listIngestRuns(limit) {
        return this.client.request({
            method: 'GET',
            path: '/knowledge-fabric/ingest/runs',
            query: limit !== undefined ? { limit } : undefined,
        });
    }
    getConnectorState(connectorId) {
        return this.client.request({
            method: 'GET',
            path: `/knowledge-fabric/ingest/state/${connectorId}`,
        });
    }
    ingest(connectorId, body = {}) {
        return this.client.request({
            method: 'POST',
            path: `/knowledge-fabric/ingest/${connectorId}`,
            body,
        });
    }
    /** Phase 29 — enqueue async sync (returns immediately when server accepts job). */
    sync(connectorId, body = {}) {
        return this.client.request({
            method: 'POST',
            path: `/knowledge-fabric/sync/${connectorId}`,
            body,
        });
    }
    getSyncJob(jobId) {
        return this.client.request({ method: 'GET', path: `/knowledge-fabric/sync/jobs/${jobId}` });
    }
}
//# sourceMappingURL=knowledge-fabric-api.js.map