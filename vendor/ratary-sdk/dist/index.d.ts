import { CapabilitiesApi } from './apis/capabilities-api.js';
import { ContextApi } from './apis/context-api.js';
import { EcosystemApi } from './apis/ecosystem-api.js';
import { FederationApi } from './apis/federation-api.js';
import { MemoryApi } from './apis/memory-api.js';
import type { RestTransportConfig } from './ports/iapi-client.js';
import { RestTransport } from './transports/rest-transport.js';
export interface AiBrainClientOptions extends RestTransportConfig {
    /** When true, includes federation helpers (requires FEDERATION_ENABLED on server). */
    federation?: boolean;
}
export declare class AiBrainClient {
    readonly memory: MemoryApi;
    readonly context: ContextApi;
    readonly capabilities: CapabilitiesApi;
    readonly ecosystem: EcosystemApi;
    readonly federation?: FederationApi;
    readonly transport: RestTransport;
    constructor(options: AiBrainClientOptions);
}
export { AiBrainApiError, AiBrainApiError as RataryApiError } from './errors.js';
export type { IApiClient, RestTransportConfig } from './ports/iapi-client.js';
export { RestTransport } from './transports/rest-transport.js';
export * from './types.js';
/** @deprecated Use RataryClient — alias kept for SDK migration. */
export { AiBrainClient as RataryClient };
export type { AiBrainClientOptions as RataryClientOptions };
//# sourceMappingURL=index.d.ts.map