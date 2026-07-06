export type ConnectionMode = 'persistent' | 'temporary';

export interface RataryConnection {
  id: string;
  workspaceId: string;
  baseUrl: string;
  label?: string;
  description?: string;
  mode: ConnectionMode;
  createdAt: string;
  lastValidatedAt?: string;
}

export interface ConnectionDiagnostic {
  code: string;
  message: string;
  action?: string;
}

export interface ConnectionValidation {
  ok: boolean;
  health: boolean;
  apiCompatible: boolean;
  rataryVersion?: string;
  latencyMs?: number;
  features?: string[];
  errors: ConnectionDiagnostic[];
}
