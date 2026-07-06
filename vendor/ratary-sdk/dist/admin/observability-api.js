export class ObservabilityApi {
    client;
    constructor(client) {
        this.client = client;
    }
    getStatus() {
        return this.client.request({ method: 'GET', path: '/observability/status' });
    }
    listDashboards() {
        return this.client.request({ method: 'GET', path: '/observability/dashboards' });
    }
    getDashboard(packId) {
        return this.client.request({ method: 'GET', path: `/observability/dashboards/${packId}` });
    }
    listSlos() {
        return this.client.request({ method: 'GET', path: '/observability/slos' });
    }
    listAlerts() {
        return this.client.request({ method: 'GET', path: '/observability/alerts' });
    }
    exportAlerts() {
        return this.client.request({ method: 'GET', path: '/observability/alerts/export' });
    }
}
//# sourceMappingURL=observability-api.js.map