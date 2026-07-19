import type { ExecutionProfile } from './execution-profile';

/** @deprecated PI#002 — capability removed from public contract; mapper retained for legacy tests only. */
export type AIExecutionCapability = 'chat' | 'summarize' | 'tool-assist';

/**
 * Legacy capability → execution profile name (ADR-2101 migration).
 * Structural mirror of Ontory legacyCapabilityToProfileName — no Ontory imports.
 */
const CAPABILITY_TO_PROFILE_NAME: Readonly<Record<AIExecutionCapability, string>> = {
  chat: 'conversation',
  summarize: 'summarize',
  'tool-assist': 'tool-assist',
};

/**
 * Maps legacy Studio capability to public execution profile intent.
 * Pure domain transform — no env, config, registry, or REST concerns.
 */
export function mapCapabilityToExecutionProfile(
  capability: AIExecutionCapability,
): ExecutionProfile {
  return Object.freeze({ name: CAPABILITY_TO_PROFILE_NAME[capability] });
}
