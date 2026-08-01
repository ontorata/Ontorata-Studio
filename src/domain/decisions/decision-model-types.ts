export type DecisionModelComputedPluginSummary = Readonly<{
  kind: 'worker';
  artifactDigestPrefix: string;
}>;

export type SandboxOutcome = 'ok' | 'timeout' | 'error' | 'denied' | 'disabled';

export type DecisionModelSummary = Readonly<{
  id: string;
  version: string;
  displayName: string;
  description?: string;
  stability: 'experimental' | 'stable' | 'deprecated';
  executionProfileName: string;
  capabilities: readonly string[];
  computedPlugin?: DecisionModelComputedPluginSummary;
}>;

export type DecisionModelSelection = Readonly<{
  id: string;
  version: string;
  displayName: string;
  executionProfileName: string;
  computedPlugin?: DecisionModelComputedPluginSummary;
  sandboxOutcome?: SandboxOutcome;
  pluginDigestPrefix?: string;
}>;
