import type { IApiClient } from '../ports/iapi-client.js';
import type { AdminJson } from '../types/admin.types.js';

export class CloudApi {
  constructor(private readonly client: IApiClient) {}

  getStatus(): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/cloud/status' });
  }

  listRegions(): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/cloud/regions' });
  }

  provisionWorkspace(body: AdminJson): Promise<AdminJson> {
    return this.client.request({ method: 'POST', path: '/cloud/workspaces/provision', body });
  }

  deprovisionWorkspace(body: AdminJson): Promise<AdminJson> {
    return this.client.request({ method: 'POST', path: '/cloud/workspaces/deprovision', body });
  }

  assignRegion(workspaceId: string, body: AdminJson): Promise<AdminJson> {
    return this.client.request({
      method: 'POST',
      path: `/cloud/workspaces/${workspaceId}/region`,
      body,
    });
  }

  getTopology(workspaceId: string): Promise<AdminJson> {
    return this.client.request({
      method: 'GET',
      path: `/cloud/workspaces/${workspaceId}/topology`,
    });
  }

  rotateApiKey(identityId: string, body?: AdminJson): Promise<AdminJson> {
    return this.client.request({
      method: 'POST',
      path: `/cloud/identities/${identityId}/rotate-key`,
      body,
    });
  }

  exportUsage(query?: Record<string, string | number | boolean | undefined>): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/cloud/usage/export', query });
  }

  aggregateUsage(
    query?: Record<string, string | number | boolean | undefined>,
  ): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/cloud/usage/aggregate', query });
  }

  scheduleDr(body: AdminJson): Promise<AdminJson> {
    return this.client.request({ method: 'POST', path: '/cloud/dr/schedule', body });
  }

  listDrSchedules(): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/cloud/dr/schedules' });
  }

  runDrBackup(scheduleId: string, body?: AdminJson): Promise<AdminJson> {
    return this.client.request({
      method: 'POST',
      path: `/cloud/dr/schedules/${scheduleId}/run`,
      body,
    });
  }

  verifyDr(body: AdminJson): Promise<AdminJson> {
    return this.client.request({ method: 'POST', path: '/cloud/dr/verify', body });
  }

  failover(body: AdminJson): Promise<AdminJson> {
    return this.client.request({ method: 'POST', path: '/cloud/dr/failover', body });
  }
}
