import type { ConnectorId } from './connector.types.js';

export type AdminJson = Record<string, unknown>;

export interface FabricIngestMode {
  mode?: 'full' | 'incremental';
  dryRun?: boolean;
  limit?: number;
}

export interface FabricIngestRun {
  id: string;
  connectorId: ConnectorId;
  mode: 'full' | 'incremental';
  status: string;
  stats?: AdminJson;
  startedAt?: string;
  finishedAt?: string;
  errorMessage?: string;
  [key: string]: unknown;
}

export interface ConnectorDescriptor {
  id: ConnectorId;
  displayName: string;
  configured: boolean;
}

export interface FederationPullInput {
  peerId: string;
  sourceNodeId: string;
  sourceOwnerId: string;
  sourceWorkspaceId?: string;
  targetWorkspaceId?: string;
  memoryIds?: string[];
  cursor?: string;
  limit?: number;
}

export interface FederationPushInput {
  peerId: string;
  memoryIds: string[];
}

export interface ConnectorSyncEnqueueResult {
  jobId: string;
  status: 'queued' | 'running';
}
