/** @deprecated Use AdminFederationApi via client.admin.federation */
export class FederationApi {
    client;
    constructor(client) {
        this.client = client;
    }
    async listPeers() {
        return this.client.request({ method: 'GET', path: '/federation/peers' });
    }
    getStatus() {
        return this.client.request({ method: 'GET', path: '/federation/status' });
    }
    pull(body) {
        return this.client.request({ method: 'POST', path: '/federation/exchange/pull', body });
    }
    push(body) {
        return this.client.request({ method: 'POST', path: '/federation/exchange/push', body });
    }
}
//# sourceMappingURL=federation-api.js.map