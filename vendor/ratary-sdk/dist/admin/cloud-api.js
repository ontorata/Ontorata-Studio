export class CloudApi {
    client;
    constructor(client) {
        this.client = client;
    }
    getStatus() {
        return this.client.request({ method: 'GET', path: '/cloud/status' });
    }
    listRegions() {
        return this.client.request({ method: 'GET', path: '/cloud/regions' });
    }
    provisionWorkspace(body) {
        return this.client.request({ method: 'POST', path: '/cloud/workspaces/provision', body });
    }
    deprovisionWorkspace(body) {
        return this.client.request({ method: 'POST', path: '/cloud/workspaces/deprovision', body });
    }
    assignRegion(workspaceId, body) {
        return this.client.request({
            method: 'POST',
            path: `/cloud/workspaces/${workspaceId}/region`,
            body,
        });
    }
    getTopology(workspaceId) {
        return this.client.request({
            method: 'GET',
            path: `/cloud/workspaces/${workspaceId}/topology`,
        });
    }
    rotateApiKey(identityId, body) {
        return this.client.request({
            method: 'POST',
            path: `/cloud/identities/${identityId}/rotate-key`,
            body,
        });
    }
    exportUsage(query) {
        return this.client.request({ method: 'GET', path: '/cloud/usage/export', query });
    }
    aggregateUsage(query) {
        return this.client.request({ method: 'GET', path: '/cloud/usage/aggregate', query });
    }
    scheduleDr(body) {
        return this.client.request({ method: 'POST', path: '/cloud/dr/schedule', body });
    }
    listDrSchedules() {
        return this.client.request({ method: 'GET', path: '/cloud/dr/schedules' });
    }
    runDrBackup(scheduleId, body) {
        return this.client.request({
            method: 'POST',
            path: `/cloud/dr/schedules/${scheduleId}/run`,
            body,
        });
    }
    verifyDr(body) {
        return this.client.request({ method: 'POST', path: '/cloud/dr/verify', body });
    }
    failover(body) {
        return this.client.request({ method: 'POST', path: '/cloud/dr/failover', body });
    }
}
//# sourceMappingURL=cloud-api.js.map