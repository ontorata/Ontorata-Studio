import type { IApiClient } from '../ports/iapi-client.js';
import type { CreateMemoryInput, ListMemoriesParams, MemoryRecord, SearchMemoriesParams, UpdateMemoryInput } from '../types.js';
export declare class MemoryApi {
    private readonly client;
    constructor(client: IApiClient);
    list(params?: ListMemoriesParams): Promise<{
        memories: MemoryRecord[];
        total?: number;
    }>;
    get(id: string): Promise<MemoryRecord>;
    create(input: CreateMemoryInput): Promise<MemoryRecord>;
    update(id: string, input: UpdateMemoryInput): Promise<MemoryRecord>;
    delete(id: string): Promise<void>;
    search(params: SearchMemoriesParams): Promise<{
        results: MemoryRecord[];
        total?: number;
    }>;
}
//# sourceMappingURL=memory-api.d.ts.map