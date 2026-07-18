export interface RequestOptions {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    auth?: boolean;
    /** Per-request headers merged after transport defaults (tenant headers can override). */
    headers?: Record<string, string>;
}
export interface IApiClient {
    request<T>(options: RequestOptions): Promise<T>;
}
export interface RestTransportConfig {
    baseUrl: string;
    apiKey?: string;
    /** OIDC access token (e.g. Zitadel) — sent as Bearer without X-API-Key. */
    accessToken?: string;
    organizationId?: string;
    workspaceId?: string;
    fetchImpl?: typeof fetch;
    defaultHeaders?: Record<string, string>;
}
//# sourceMappingURL=iapi-client.d.ts.map