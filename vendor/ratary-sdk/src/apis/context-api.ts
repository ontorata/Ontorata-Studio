import type { IApiClient } from '../ports/iapi-client.js';
import type { BuildContextInput, BuildContextResult } from '../types.js';

export class ContextApi {
  constructor(private readonly client: IApiClient) {}

  async build(input: BuildContextInput): Promise<BuildContextResult> {
    return this.client.request({ method: 'POST', path: '/context', body: input });
  }
}
