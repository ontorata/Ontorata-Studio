import type { IApiClient } from '../ports/iapi-client.js';
import type { BuildContextInput, BuildContextResult } from '../types.js';
export declare class ContextApi {
    private readonly client;
    constructor(client: IApiClient);
    build(input: BuildContextInput): Promise<BuildContextResult>;
}
//# sourceMappingURL=context-api.d.ts.map