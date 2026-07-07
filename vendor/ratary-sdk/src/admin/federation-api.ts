import type { IApiClient } from '../ports/iapi-client.js';
import type { AdminJson, FederationPullInput, FederationPushInput } from '../types/admin.types.js';
import type { FederationPeer } from '../types.js';

export class AdminFederationApi {
  constructor(private readonly client: IApiClient) {}

  listPeers(): Promise<{ peers: FederationPeer[] }> {
    return this.client.request({ method: 'GET', path: '/federation/peers' });
  }

  getStatus(): Promise<AdminJson> {
    return this.client.request({ method: 'GET', path: '/federation/status' });
  }

  pull(body: FederationPullInput): Promise<AdminJson> {
    return this.client.request({ method: 'POST', path: '/federation/exchange/pull', body });
  }

  push(body: FederationPushInput): Promise<AdminJson> {
    return this.client.request({ method: 'POST', path: '/federation/exchange/push', body });
  }
}
