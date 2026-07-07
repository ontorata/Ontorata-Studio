import type { IApiClient } from '../ports/iapi-client.js';
import type { AdminJson } from '../types/admin.types.js';
export declare class CloudApi {
    private readonly client;
    constructor(client: IApiClient);
    getStatus(): Promise<AdminJson>;
    listRegions(): Promise<AdminJson>;
    provisionWorkspace(body: AdminJson): Promise<AdminJson>;
    deprovisionWorkspace(body: AdminJson): Promise<AdminJson>;
    assignRegion(workspaceId: string, body: AdminJson): Promise<AdminJson>;
    getTopology(workspaceId: string): Promise<AdminJson>;
    rotateApiKey(identityId: string, body?: AdminJson): Promise<AdminJson>;
    exportUsage(query?: Record<string, string | number | boolean | undefined>): Promise<AdminJson>;
    aggregateUsage(query?: Record<string, string | number | boolean | undefined>): Promise<AdminJson>;
    scheduleDr(body: AdminJson): Promise<AdminJson>;
    listDrSchedules(): Promise<AdminJson>;
    runDrBackup(scheduleId: string, body?: AdminJson): Promise<AdminJson>;
    verifyDr(body: AdminJson): Promise<AdminJson>;
    failover(body: AdminJson): Promise<AdminJson>;
}
//# sourceMappingURL=cloud-api.d.ts.map