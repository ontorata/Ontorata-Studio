export class FederationApi {
    client;
    constructor(client) {
        this.client = client;
    }
    async listPeers() {
        return this.client.request({ method: 'GET', path: '/federation/peers' });
    }
}
//# sourceMappingURL=federation-api.js.map