import { AdminClient } from './admin/index.js';
import { CapabilitiesApi } from './apis/capabilities-api.js';
import { ContextApi } from './apis/context-api.js';
import { EcosystemApi } from './apis/ecosystem-api.js';
import { FederationApi } from './apis/federation-api.js';
import { MemoryApi } from './apis/memory-api.js';
import { RestTransport } from './transports/rest-transport.js';
export class AiBrainClient {
    memory;
    context;
    capabilities;
    ecosystem;
    /** Phase 28 — admin REST surfaces (cloud, observability, infrastructure, platform, fabric, federation). */
    admin;
    /** @deprecated Use admin.federation */
    federation;
    transport;
    constructor(options) {
        const baseUrl = options.baseUrl.endsWith('/api/v1')
            ? options.baseUrl
            : `${options.baseUrl.replace(/\/$/, '')}/api/v1`;
        this.transport = new RestTransport({ ...options, baseUrl });
        this.memory = new MemoryApi(this.transport);
        this.context = new ContextApi(this.transport);
        this.capabilities = new CapabilitiesApi(this.transport);
        this.ecosystem = new EcosystemApi(this.transport);
        this.admin = new AdminClient(this.transport);
        if (options.federation) {
            this.federation = new FederationApi(this.transport);
        }
    }
}
export { AdminClient } from './admin/index.js';
export { AiBrainApiError, AiBrainApiError as RataryApiError } from './errors.js';
export { RestTransport } from './transports/rest-transport.js';
export * from './types.js';
export * from './types/admin.types.js';
export * from './types/connector.types.js';
/** @deprecated Use RataryClient — alias kept for SDK migration. */
export { AiBrainClient as RataryClient };
//# sourceMappingURL=index.js.map