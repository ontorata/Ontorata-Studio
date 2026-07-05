export class CapabilitiesApi {
    client;
    constructor(client) {
        this.client = client;
    }
    async get() {
        return this.client.request({ method: 'GET', path: '/capabilities', auth: false });
    }
    async negotiate(request = {}) {
        return this.client.request({
            method: 'POST',
            path: '/capabilities/negotiate',
            auth: false,
            body: request,
        });
    }
}
//# sourceMappingURL=capabilities-api.js.map