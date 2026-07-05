import type { IApiClient } from '../ports/iapi-client.js';
import type { EcosystemClientProfile } from '../types.js';
export declare class EcosystemApi {
    private readonly client;
    constructor(client: IApiClient);
    listClients(): Promise<{
        clients: EcosystemClientProfile[];
        count: number;
    }>;
    getClient(type: string): Promise<EcosystemClientProfile>;
}
//# sourceMappingURL=ecosystem-api.d.ts.map