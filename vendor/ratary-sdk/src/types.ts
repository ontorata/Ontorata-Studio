export interface MemoryRecord {
  id: string;
  title: string;
  content: string;
  summary?: string;
  project?: string;
  tags?: string[];
  favorite?: boolean;
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateMemoryInput {
  title: string;
  content: string;
  summary?: string;
  project?: string;
  tags?: string[];
  favorite?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateMemoryInput {
  title?: string;
  content?: string;
  summary?: string;
  tags?: string[];
  favorite?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ListMemoriesParams {
  project?: string;
  limit?: number;
  offset?: number;
}

export interface SearchMemoriesParams {
  q: string;
  limit?: number;
  project?: string;
}

export interface BuildContextInput {
  task: string;
  maxTokens?: number;
  project?: string;
}

export interface BuildContextResult {
  context: string;
  prompt?: string;
  memoryCount?: number;
  [key: string]: unknown;
}

export type CapabilityManifest = Record<string, unknown>;

export interface ClientCapabilityRequest {
  protocolVersion?: string;
  clientInfo?: { name: string; version: string };
  requiredCapabilities?: string[];
  preferredCapabilities?: string[];
  transports?: string[];
}

export interface CapabilityNegotiationResult {
  compatible: boolean;
  negotiatedProtocolVersion: string;
  serverProtocolVersion: string;
  supportedProtocolVersions: readonly string[];
  matched: {
    required: string[];
    preferred: string[];
    transports: string[];
  };
  missing: {
    required: string[];
    preferred: string[];
    transports: string[];
  };
  serverEnabledCapabilities: string[];
  capabilitiesUrl: string;
  negotiateUrl: string;
  clientInfo?: { name: string; version: string };
  timestamp: string;
}

export interface EcosystemClientProfile {
  clientType: string;
  displayName: string;
  primaryProtocol: string;
  supportedProtocols: string[];
  [key: string]: unknown;
}

export interface FederationPeer {
  nodeId: string;
  displayName?: string;
  [key: string]: unknown;
}
