export declare class AiBrainApiError extends Error {
    readonly status: number;
    readonly body?: unknown | undefined;
    constructor(message: string, status: number, body?: unknown | undefined);
}
//# sourceMappingURL=errors.d.ts.map