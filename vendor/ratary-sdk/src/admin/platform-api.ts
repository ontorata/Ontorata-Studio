import type { IApiClient } from '../ports/iapi-client.js';
import type { AdminJson } from '../types/admin.types.js';

export class PlatformApi {
  constructor(private readonly client: IApiClient) {}

  getStatus(): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/platform/status' });
  }

  getManifest(): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/platform/manifest' });
  }

  listWebhooks(): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/platform/webhooks' });
  }

  createWebhook(body: AdminJson): Promise<AdminJson> {
    return this.client.request({ method: 'POST', path: '/platform/webhooks', body });
  }

  deleteWebhook(id: string): Promise<void> {
    return this.client.request({ method: 'DELETE', path: `/platform/webhooks/${id}` });
  }
}
