import type { ConnectionValidation, RataryConnection } from '../../domain/connection/connection';

/** Phase 05 — Connection Wizard implementation. */
export interface ConnectionPort {
  validate(connection: Pick<RataryConnection, 'baseUrl'> & { apiKey: string }): Promise<ConnectionValidation>;
  list(): Promise<RataryConnection[]>;
  save(connection: RataryConnection): Promise<void>;
  revoke(connectionId: string): Promise<void>;
}
