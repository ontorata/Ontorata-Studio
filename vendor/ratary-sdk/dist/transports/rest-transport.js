import { AiBrainApiError } from '../errors.js';
function buildUrl(baseUrl, path, query) {
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
export class RestTransport {
    config;
    fetchImpl;
    constructor(config) {
        this.config = config;
        this.fetchImpl = config.fetchImpl ?? fetch;
    }
    async request(options) {
        const url = buildUrl(this.config.baseUrl, options.path, options.query);
        const headers = {
            Accept: 'application/json',
            ...this.config.defaultHeaders,
        };
        if (options.auth !== false && this.config.apiKey) {
            headers.Authorization = `Bearer ${this.config.apiKey}`;
            headers['X-API-Key'] = this.config.apiKey;
        }
        if (this.config.workspaceId) {
            headers['X-Workspace-Id'] = this.config.workspaceId;
        }
        let body;
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
            return undefined;
        }
        const text = await response.text();
        const parsed = text ? JSON.parse(text) : undefined;
        if (!response.ok) {
            const message = typeof parsed === 'object' &&
                parsed !== null &&
                'message' in parsed &&
                typeof parsed.message === 'string'
                ? parsed.message
                : `HTTP ${response.status}`;
            throw new AiBrainApiError(message, response.status, parsed);
        }
        return parsed;
    }
}
//# sourceMappingURL=rest-transport.js.map