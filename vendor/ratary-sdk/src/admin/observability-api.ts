import type { IApiClient } from '../ports/iapi-client.js';
import type { AdminJson } from '../types/admin.types.js';

export class ObservabilityApi {
  constructor(private readonly client: IApiClient) {}

  getStatus(): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/observability/status' });
  }

  listDashboards(): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/observability/dashboards' });
  }

  getDashboard(packId: string): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: `/observability/dashboards/${packId}` });
  }

  listSlos(): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/observability/slos' });
  }

  listAlerts(): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/observability/alerts' });
  }

  exportAlerts(): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/observability/alerts/export' });
  }
}
