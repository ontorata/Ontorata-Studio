import type { IApiClient } from '../ports/iapi-client.js';
import type {
  CapabilityManifest,
  CapabilityNegotiationResult,
  ClientCapabilityRequest,
} from '../types.js';

export class CapabilitiesApi {
  constructor(private readonly client: IApiClient) {}

  async get(): Promise<CapabilityManifest> {
    return this.client.request({ method: 'GET', path: '/capabilities', auth: false });
  }

  async negotiate(request: ClientCapabilityRequest = {}): Promise<CapabilityNegotiationResult> {
    return this.client.request({
      method: 'POST',
      path: '/capabilities/negotiate',
      auth: false,
      body: request,
    });
  }
}
