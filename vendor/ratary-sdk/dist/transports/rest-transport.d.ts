import type { IApiClient, RequestOptions, RestTransportConfig } from '../ports/iapi-client.js';
export declare class RestTransport implements IApiClient {
    private readonly config;
    private readonly fetchImpl;
    constructor(config: RestTransportConfig);
    request<T>(options: RequestOptions): Promise<T>;
}
//# sourceMappingURL=rest-transport.d.ts.map