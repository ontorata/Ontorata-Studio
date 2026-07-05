export class ContextApi {
    client;
    constructor(client) {
        this.client = client;
    }
    async build(input) {
        return this.client.request({ method: 'POST', path: '/context', body: input });
    }
}
//# sourceMappingURL=context-api.js.map