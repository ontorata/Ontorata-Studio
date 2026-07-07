import type { IApiClient } from '../ports/iapi-client.js';
import type { AdminJson, FederationPullInput, FederationPushInput } from '../types/admin.types.js';
import type { FederationPeer } from '../types.js';
export declare class AdminFederationApi {
    private readonly client;
    constructor(client: IApiClient);
    listPeers(): Promise<{
        peers: FederationPeer[];
    }>;
    getStatus(): Promise<AdminJson>;
    pull(body: FederationPullInput): Promise<AdminJson>;
    push(body: FederationPushInput): Promise<AdminJson>;
}
//# sourceMappingURL=federation-api.d.ts.map