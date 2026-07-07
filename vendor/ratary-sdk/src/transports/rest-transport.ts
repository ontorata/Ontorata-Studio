import { AiBrainApiError } from '../errors.js';
import type { IApiClient, RequestOptions, RestTransportConfig } from '../ports/iapi-client.js';

function buildUrl(baseUrl: string, path: string, query?: RequestOptions['query']): string {
  const normalizedBase = baseUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${normalizedBase}${normalizedPath}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function defaultFetch(...args: Parameters<typeof fetch>): ReturnType<typeof fetch> {
  return fetch(...args);
}

export class RestTransport implements IApiClient {
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly config: RestTransportConfig) {
    this.fetchImpl = config.fetchImpl ?? defaultFetch;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const url = buildUrl(this.config.baseUrl, options.path, options.query);
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...this.config.defaultHeaders,
    };

    if (options.auth !== false) {
      if (this.config.accessToken) {
        headers.Authorization = `Bearer ${this.config.accessToken}`;
      } else if (this.config.apiKey) {
        headers.Authorization = `Bearer ${this.config.apiKey}`;
        headers['X-API-Key'] = this.config.apiKey;
      }
    }
    if (this.config.workspaceId) {
      headers['X-Workspace-Id'] = this.config.workspaceId;
    }

    let body: string | undefined;
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(options.body);
    }

    const response = await this.fetchImpl(url, {
      method: options.method,
      headers,
      body,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    const parsed = text ? (JSON.parse(text) as unknown) : undefined;

    if (!response.ok) {
      const message =
        typeof parsed === 'object' &&
        parsed !== null &&
        'message' in parsed &&
        typeof (parsed as { message: unknown }).message === 'string'
          ? (parsed as { message: string }).message
          : `HTTP ${response.status}`;
      throw new AiBrainApiError(message, response.status, parsed);
    }

    return parsed as T;
  }
}
