import type { ConnectionPort } from '../../application/connection/connection-port';
import type { ConnectionValidation, RataryConnection } from '../../domain/connection/connection';
import { DEFAULT_WORKSPACE_ID } from '../../config/env';
import { StudioRataryClient } from '../ratary/studio-ratary-client';
import {
  getConnectionSecret,
  listStoredConnections,
  removeStoredConnection,
  saveConnectionSecret,
  saveStoredConnection,
} from '../storage/connection-store';

function newConnectionId(): string {
  return crypto.randomUUID();
}

/** Phase 05 — browser-local connection registry with obfuscated AIC storage. */
export class LocalConnectionPort implements ConnectionPort {
  async validate(
    input: Pick<RataryConnection, 'baseUrl'> & { apiKey: string },
  ): Promise<ConnectionValidation> {
    const started = Date.now();
    const client = new StudioRataryClient({
      baseUrl: input.baseUrl,
      apiKey: input.apiKey,
    });

    try {
      const health = await client.getHealth();
      const caps = await client.getCapabilities();
      const healthy = health.status === 'ok' || health.status === 'degraded';
      const features = Object.entries(caps.capabilities ?? {})
        .filter(([, enabled]) => enabled === true)
        .map(([name]) => name);

      return {
        ok: healthy,
        health: healthy,
        apiCompatible: true,
        rataryVersion: caps.protocolVersion,
        latencyMs: Date.now() - started,
        features,
        errors: healthy
          ? []
          : [
              {
                code: 'health_degraded',
                message: `Server health: ${health.status}`,
                action: 'Check Ratary logs or try another instance.',
              },
            ],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      return {
        ok: false,
        health: false,
        apiCompatible: false,
        latencyMs: Date.now() - started,
        errors: [
          {
            code: 'connection_failed',
            message,
            action: 'Verify base URL and API key (aic_...).',
          },
        ],
      };
    }
  }

  async list(): Promise<RataryConnection[]> {
    return listStoredConnections();
  }

  async save(
    connection: RataryConnection & { apiKey: string },
  ): Promise<void> {
    const { apiKey, ...meta } = connection;
    saveStoredConnection(meta);
    saveConnectionSecret(meta.id, apiKey, meta.mode);
  }

  async createFromWizard(input: {
    baseUrl: string;
    apiKey: string;
    label?: string;
    description?: string;
    mode: RataryConnection['mode'];
    workspaceId?: string;
  }): Promise<RataryConnection> {
    const connection: RataryConnection & { apiKey: string } = {
      id: newConnectionId(),
      workspaceId: input.workspaceId ?? DEFAULT_WORKSPACE_ID,
      baseUrl: input.baseUrl.replace(/\/$/, '').replace(/\/api\/v1$/, ''),
      label: input.label,
      description: input.description,
      mode: input.mode,
      createdAt: new Date().toISOString(),
      lastValidatedAt: new Date().toISOString(),
      apiKey: input.apiKey,
    };
    await this.save(connection);
    return connection;
  }

  getApiKey(connectionId: string): string | null {
    return getConnectionSecret(connectionId);
  }

  async revoke(connectionId: string): Promise<void> {
    removeStoredConnection(connectionId);
  }
}

export function createLocalConnectionPort(): LocalConnectionPort {
  return new LocalConnectionPort();
}
