import type { IApiClient } from '../ports/iapi-client.js';
import type {
  CreateMemoryInput,
  ListMemoriesParams,
  MemoryRecord,
  SearchMemoriesParams,
  UpdateMemoryInput,
} from '../types.js';

export class MemoryApi {
  constructor(private readonly client: IApiClient) {}

  async list(params: ListMemoriesParams = {}): Promise<{ memories: MemoryRecord[]; total?: number }> {
    return this.client.request({
      method: 'GET',
      path: '/memory',
      query: params,
    });
  }

  async get(id: string): Promise<MemoryRecord> {
    return this.client.request({ method: 'GET', path: `/memory/${id}` });
  }

  async create(input: CreateMemoryInput): Promise<MemoryRecord> {
    return this.client.request({ method: 'POST', path: '/memory', body: input });
  }

  async update(id: string, input: UpdateMemoryInput): Promise<MemoryRecord> {
    return this.client.request({ method: 'PUT', path: `/memory/${id}`, body: input });
  }

  async delete(id: string): Promise<void> {
    await this.client.request({ method: 'DELETE', path: `/memory/${id}` });
  }

  async search(params: SearchMemoriesParams): Promise<{ results: MemoryRecord[]; total?: number }> {
    return this.client.request({
      method: 'GET',
      path: '/search',
      query: params,
    });
  }
}
