import type { IApiClient } from '../ports/iapi-client.js';
import type { AdminJson } from '../types/admin.types.js';
export declare class InfrastructureApi {
    private readonly client;
    constructor(client: IApiClient);
    getStatus(): Promise<AdminJson>;
    getManifest(): Promise<AdminJson>;
    listMarketplace(): Promise<AdminJson>;
    getMarketplaceEntry(pluginId: string): Promise<AdminJson>;
    listPlugins(): Promise<AdminJson>;
    registerPlugin(body: AdminJson): Promise<AdminJson>;
    enablePlugin(pluginId: string, body?: AdminJson): Promise<AdminJson>;
    disablePlugin(pluginId: string, body?: AdminJson): Promise<AdminJson>;
}
//# sourceMappingURL=infrastructure-api.d.ts.map