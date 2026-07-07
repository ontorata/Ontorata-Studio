import { AdminClient } from './admin/index.js';
import { CapabilitiesApi } from './apis/capabilities-api.js';
import { ContextApi } from './apis/context-api.js';
import { EcosystemApi } from './apis/ecosystem-api.js';
import { FederationApi } from './apis/federation-api.js';
import { MemoryApi } from './apis/memory-api.js';
import type { RestTransportConfig } from './ports/iapi-client.js';
import { RestTransport } from './transports/rest-transport.js';
export interface AiBrainClientOptions extends RestTransportConfig {
    /** @deprecated Prefer client.admin.federation — kept for CLI compat. */
    federation?: boolean;
}
export declare class AiBrainClient {
    readonly memory: MemoryApi;
    readonly context: ContextApi;
    readonly capabilities: CapabilitiesApi;
    readonly ecosystem: EcosystemApi;
    /** Phase 28 — admin REST surfaces (cloud, observability, infrastructure, platform, fabric, federation). */
    readonly admin: AdminClient;
    /** @deprecated Use admin.federation */
    readonly federation?: FederationApi;
    readonly transport: RestTransport;
    constructor(options: AiBrainClientOptions);
}
export { AdminClient } from './admin/index.js';
export { AiBrainApiError, AiBrainApiError as RataryApiError } from './errors.js';
export type { IApiClient, RestTransportConfig } from './ports/iapi-client.js';
export { RestTransport } from './transports/rest-transport.js';
export * from './types.js';
export * from './types/admin.types.js';
export * from './types/connector.types.js';
/** @deprecated Use RataryClient — alias kept for SDK migration. */
export { AiBrainClient as RataryClient };
export type { AiBrainClientOptions as RataryClientOptions };
//# sourceMappingURL=index.d.ts.map