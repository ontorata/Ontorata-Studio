import type { ConnectionPort } from '../../application/connection/connection-port';
import type { ConnectionValidation, RataryConnection } from '../../domain/connection/connection';

/** Phase 05 — no-op stub. */
export class StubConnectionPort implements ConnectionPort {
  async validate(): Promise<ConnectionValidation> {
    return {
      ok: false,
      health: false,
      apiCompatible: false,
      errors: [{ code: 'NOT_IMPLEMENTED', message: 'Connection wizard ships in Phase 05' }],
    };
  }

  async list(): Promise<RataryConnection[]> {
    return [];
  }

  async save(): Promise<void> {
    /* Phase 05 */
  }

  async revoke(): Promise<void> {
    /* Phase 05 */
  }
}
