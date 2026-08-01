export type DecisionModelSummary = Readonly<{
  id: string;
  version: string;
  displayName: string;
  description?: string;
  stability: 'experimental' | 'stable' | 'deprecated';
  executionProfileName: string;
  capabilities: readonly string[];
}>;

export type DecisionModelSelection = Readonly<{
  id: string;
  version: string;
  displayName: string;
  executionProfileName: string;
}>;
