import type { IApiClient } from '../ports/iapi-client.js';
import type { FederationPeer } from '../types.js';

export class FederationApi {
  constructor(private readonly client: IApiClient) {}

  async listPeers(): Promise<{ peers: FederationPeer[] }> {
    return this.client.request({ method: 'GET', path: '/federation/peers' });
  }
}
