export class MemoryApi {
    client;
    constructor(client) {
        this.client = client;
    }
    async list(params = {}) {
        return this.client.request({
            method: 'GET',
            path: '/memory',
            query: params,
        });
    }
    async get(id) {
        return this.client.request({ method: 'GET', path: `/memory/${id}` });
    }
    async create(input) {
        return this.client.request({ method: 'POST', path: '/memory', body: input });
    }
    async update(id, input) {
        return this.client.request({ method: 'PUT', path: `/memory/${id}`, body: input });
    }
    async delete(id) {
        await this.client.request({ method: 'DELETE', path: `/memory/${id}` });
    }
    async search(params) {
        return this.client.request({
            method: 'GET',
            path: '/search',
            query: params,
        });
    }
}
//# sourceMappingURL=memory-api.js.map