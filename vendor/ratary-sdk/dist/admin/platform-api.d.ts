import type { IApiClient } from '../ports/iapi-client.js';
import type { AdminJson } from '../types/admin.types.js';
export declare class PlatformApi {
    private readonly client;
    constructor(client: IApiClient);
    getStatus(): Promise<AdminJson>;
    getManifest(): Promise<AdminJson>;
    listWebhooks(): Promise<AdminJson>;
    createWebhook(body: AdminJson): Promise<AdminJson>;
    deleteWebhook(id: string): Promise<void>;
}
//# sourceMappingURL=platform-api.d.ts.map