import type { IApiClient } from '../ports/iapi-client.js';
import type { FederationPeer } from '../types.js';
export declare class FederationApi {
    private readonly client;
    constructor(client: IApiClient);
    listPeers(): Promise<{
        peers: FederationPeer[];
    }>;
}
//# sourceMappingURL=federation-api.d.ts.map