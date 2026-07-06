import type { IApiClient } from '../ports/iapi-client.js';
import type { AdminJson } from '../types/admin.types.js';
export declare class ObservabilityApi {
    private readonly client;
    constructor(client: IApiClient);
    getStatus(): Promise<AdminJson>;
    listDashboards(): Promise<AdminJson>;
    getDashboard(packId: string): Promise<AdminJson>;
    listSlos(): Promise<AdminJson>;
    listAlerts(): Promise<AdminJson>;
    exportAlerts(): Promise<AdminJson>;
}
//# sourceMappingURL=observability-api.d.ts.map