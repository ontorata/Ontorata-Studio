import type { IApiClient } from '../ports/iapi-client.js';
import type { CapabilityManifest, CapabilityNegotiationResult, ClientCapabilityRequest } from '../types.js';
export declare class CapabilitiesApi {
    private readonly client;
    constructor(client: IApiClient);
    get(): Promise<CapabilityManifest>;
    negotiate(request?: ClientCapabilityRequest): Promise<CapabilityNegotiationResult>;
}
//# sourceMappingURL=capabilities-api.d.ts.map