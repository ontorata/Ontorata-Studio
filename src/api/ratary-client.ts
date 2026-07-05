import { RataryClient, RestTransport } from '@ratary/sdk';
import type { MemoryRecord, SearchMemoriesParams } from '@ratary/sdk';

export interface StudioClientOptions {
  baseUrl: string;
  apiKey?: string;
  workspaceId?: string;
}

export interface HealthStatus {
  status: string;
  service?: string;
  checks?: Record<string, string>;
}

export interface CapabilityFlags {
  supportsKnowledgeGraph?: boolean;
  supportsWorkspace?: boolean;
  supportsPrecisionSearch?: boolean;
  supportsHybridRetrieval?: boolean;
  supportsOrganization?: boolean;
  [key: string]: unknown;
}

export interface CapabilityManifestView {
  protocolVersion?: string;
  capabilities?: CapabilityFlags;
  deployment?: { sqlProvider?: string };
  mcp?: { toolCount?: number };
}

export interface GraphTraverseInput {
  memoryId?: string;
  depth?: number;
  seed?: { memoryId?: string; slug?: string; sourcePath?: string };
}

export interface GraphTraverseResult {
  nodes?: Array<{ id: string; title?: string; depth?: number }>;
  edges?: Array<{ from: string; to: string; type?: string }>;
  [key: string]: unknown;
}

export interface WorkspaceRecord {
  id: string;
  name: string;
  slug?: string;
  [key: string]: unknown;
}

export interface AgentRecord {
  id: string;
  name: string;
  clientType?: string;
  [key: string]: unknown;
}

/** Thin SDK adapter — the only module allowed to call transport / health. */
export class StudioRataryClient {
  readonly sdk: RataryClient;
  private readonly rootTransport: RestTransport;

  constructor(options: StudioClientOptions) {
    const serverUrl = options.baseUrl.replace(/\/$/, '').replace(/\/api\/v1$/, '');
    this.sdk = new RataryClient({
      baseUrl: serverUrl,
      apiKey: options.apiKey,
      workspaceId: options.workspaceId,
    });
    this.rootTransport = new RestTransport({
      baseUrl: serverUrl,
      apiKey: options.apiKey,
      workspaceId: options.workspaceId,
    });
  }

  getHealth(): Promise<HealthStatus> {
    return this.rootTransport.request({ method: 'GET', path: '/health', auth: false });
  }

  getCapabilities(): Promise<CapabilityManifestView> {
    return this.sdk.capabilities.get() as Promise<CapabilityManifestView>;
  }

  listMemories(params?: { project?: string; limit?: number; offset?: number }) {
    return this.sdk.memory.list(params);
  }

  getMemory(id: string): Promise<MemoryRecord> {
    return this.sdk.memory.get(id);
  }

  createMemory(input: Parameters<RataryClient['memory']['create']>[0]) {
    return this.sdk.memory.create(input);
  }

  updateMemory(id: string, input: Parameters<RataryClient['memory']['update']>[1]) {
    return this.sdk.memory.update(id, input);
  }

  deleteMemory(id: string) {
    return this.sdk.memory.delete(id);
  }

  searchMemories(params: SearchMemoriesParams) {
    return this.sdk.memory.search(params);
  }

  traverseGraph(body: GraphTraverseInput): Promise<GraphTraverseResult> {
    return this.sdk.transport.request({
      method: 'POST',
      path: '/graph/traverse',
      body,
    });
  }

  getGraphCapabilities(): Promise<Record<string, unknown>> {
    return this.sdk.transport.request({ method: 'GET', path: '/graph/capabilities' });
  }

  listWorkspaces(): Promise<{ workspaces: WorkspaceRecord[] }> {
    return this.sdk.transport.request({ method: 'GET', path: '/workspaces' });
  }

  listAgents(workspaceId: string): Promise<{ agents: AgentRecord[] }> {
    return this.sdk.transport.request({
      method: 'GET',
      path: `/workspaces/${workspaceId}/agents`,
    });
  }
}

export function createStudioClientFromEnv(): StudioRataryClient {
  const baseUrl = import.meta.env.VITE_RATARY_BASE_URL ?? 'http://localhost:3000';
  const apiKey = import.meta.env.VITE_RATARY_API_KEY || undefined;
  const workspaceId = import.meta.env.VITE_RATARY_WORKSPACE_ID || undefined;
  return new StudioRataryClient({ baseUrl, apiKey, workspaceId });
}
