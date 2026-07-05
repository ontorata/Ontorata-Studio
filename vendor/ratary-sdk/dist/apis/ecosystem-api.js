export class EcosystemApi {
    client;
    constructor(client) {
        this.client = client;
    }
    async listClients() {
        return this.client.request({ method: 'GET', path: '/ecosystem/clients', auth: false });
    }
    async getClient(type) {
        return this.client.request({
            method: 'GET',
            path: `/ecosystem/clients/${encodeURIComponent(type)}`,
            auth: false,
        });
    }
}
//# sourceMappingURL=ecosystem-api.js.map