import type { IApiClient } from '../ports/iapi-client.js';
import type { AdminJson } from '../types/admin.types.js';

export class InfrastructureApi {
  constructor(private readonly client: IApiClient) {}

  getStatus(): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/infrastructure/status' });
  }

  getManifest(): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/infrastructure/manifest' });
  }

  listMarketplace(): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/infrastructure/marketplace' });
  }

  getMarketplaceEntry(pluginId: string): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: `/infrastructure/marketplace/${pluginId}` });
  }

  listPlugins(): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/infrastructure/plugins' });
  }

  registerPlugin(body: AdminJson): Promise<AdminJson> {
    return this.client.request({ method: 'POST', path: '/infrastructure/plugins/register', body });
  }

  enablePlugin(pluginId: string, body?: AdminJson): Promise<AdminJson> {
    return this.client.request({
      method: 'POST',
      path: `/infrastructure/plugins/${pluginId}/enable`,
      body,
    });
  }

  disablePlugin(pluginId: string, body?: AdminJson): Promise<AdminJson> {
    return this.client.request({
      method: 'POST',
      path: `/infrastructure/plugins/${pluginId}/disable`,
      body,
    });
  }
}
