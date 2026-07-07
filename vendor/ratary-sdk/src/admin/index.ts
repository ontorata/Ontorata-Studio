export { CloudApi } from './cloud-api.js';
export { ObservabilityApi } from './observability-api.js';
export { InfrastructureApi } from './infrastructure-api.js';
export { PlatformApi } from './platform-api.js';
export { KnowledgeFabricApi } from './knowledge-fabric-api.js';
export { AdminFederationApi } from './federation-api.js';

import { CloudApi } from './cloud-api.js';
import { AdminFederationApi } from './federation-api.js';
import { InfrastructureApi } from './infrastructure-api.js';
import { KnowledgeFabricApi } from './knowledge-fabric-api.js';
import { ObservabilityApi } from './observability-api.js';
import { PlatformApi } from './platform-api.js';
import type { IApiClient } from '../ports/iapi-client.js';

/** Admin REST surfaces (Phases 18–25) — thin transport only. */
export class AdminClient {
  readonly cloud: CloudApi;
  readonly observability: ObservabilityApi;
  readonly infrastructure: InfrastructureApi;
  readonly platform: PlatformApi;
  readonly knowledgeFabric: KnowledgeFabricApi;
  readonly federation: AdminFederationApi;

  constructor(client: IApiClient) {
    this.cloud = new CloudApi(client);
    this.observability = new ObservabilityApi(client);
    this.infrastructure = new InfrastructureApi(client);
    this.platform = new PlatformApi(client);
    this.knowledgeFabric = new KnowledgeFabricApi(client);
    this.federation = new AdminFederationApi(client);
  }
}
