import type { ConnectionValidation, RataryConnection } from '../../domain/connection/connection';

/** Phase 05 — Connection Wizard implementation. */
export interface ConnectionPort {
  validate(connection: Pick<RataryConnection, 'baseUrl'> & { apiKey?: string; accessToken?: string }): Promise<ConnectionValidation>;
  list(): Promise<RataryConnection[]>;
  save(connection: RataryConnection): Promise<void>;
  revoke(connectionId: string): Promise<void>;
}
