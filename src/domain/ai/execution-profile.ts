/**
 * Public execution intent — structural mirror of Ontory ExecutionProfile (ADR-2101).
 * Studio domain only; do not import @ontorata/ontory packages.
 */
export type ExecutionConstraints = Readonly<{
  latencyClass?: 'interactive' | 'batch';
  privacyClass?: 'standard' | 'enterprise' | 'local-only';
  maxCostTier?: number;
}>;

export type ExecutionProfile = Readonly<{
  name: string;
  constraints?: ExecutionConstraints;
}>;
