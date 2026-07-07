export class InfrastructureApi {
    client;
    constructor(client) {
        this.client = client;
    }
    getStatus() {
        return this.client.request({ method: 'GET', path: '/infrastructure/status' });
    }
    getManifest() {
        return this.client.request({ method: 'GET', path: '/infrastructure/manifest' });
    }
    listMarketplace() {
        return this.client.request({ method: 'GET', path: '/infrastructure/marketplace' });
    }
    getMarketplaceEntry(pluginId) {
        return this.client.request({ method: 'GET', path: `/infrastructure/marketplace/${pluginId}` });
    }
    listPlugins() {
        return this.client.request({ method: 'GET', path: '/infrastructure/plugins' });
    }
    registerPlugin(body) {
        return this.client.request({ method: 'POST', path: '/infrastructure/plugins/register', body });
    }
    enablePlugin(pluginId, body) {
        return this.client.request({
            method: 'POST',
            path: `/infrastructure/plugins/${pluginId}/enable`,
            body,
        });
    }
    disablePlugin(pluginId, body) {
        return this.client.request({
            method: 'POST',
            path: `/infrastructure/plugins/${pluginId}/disable`,
            body,
        });
    }
}
//# sourceMappingURL=infrastructure-api.js.map