export class AiBrainApiError extends Error {
    status;
    body;
    constructor(message, status, body) {
        super(message);
        this.status = status;
        this.body = body;
        this.name = 'AiBrainApiError';
    }
}
//# sourceMappingURL=errors.js.map