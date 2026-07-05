export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  auth?: boolean;
}

export interface IApiClient {
  request<T>(options: RequestOptions): Promise<T>;
}

export interface RestTransportConfig {
  baseUrl: string;
  apiKey?: string;
  workspaceId?: string;
  fetchImpl?: typeof fetch;
  defaultHeaders?: Record<string, string>;
}
