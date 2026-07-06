export class PlatformApi {
    client;
    constructor(client) {
        this.client = client;
    }
    getStatus() {
        return this.client.request({ method: 'GET', path: '/platform/status' });
    }
    getManifest() {
        return this.client.request({ method: 'GET', path: '/platform/manifest' });
    }
    listWebhooks() {
        return this.client.request({ method: 'GET', path: '/platform/webhooks' });
    }
    createWebhook(body) {
        return this.client.request({ method: 'POST', path: '/platform/webhooks', body });
    }
    deleteWebhook(id) {
        return this.client.request({ method: 'DELETE', path: `/platform/webhooks/${id}` });
    }
}
//# sourceMappingURL=platform-api.js.map