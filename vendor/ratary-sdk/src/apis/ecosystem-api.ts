import type { IApiClient } from '../ports/iapi-client.js';
import type { EcosystemClientProfile } from '../types.js';

export class EcosystemApi {
  constructor(private readonly client: IApiClient) {}

  async listClients(): Promise<{ clients: EcosystemClientProfile[]; count: number }> {
    return this.client.request({ method: 'GET', path: '/ecosystem/clients', auth: false });
  }

  async getClient(type: string): Promise<EcosystemClientProfile> {
    return this.client.request({
      method: 'GET',
      path: `/ecosystem/clients/${encodeURIComponent(type)}`,
      auth: false,
    });
  }
}
