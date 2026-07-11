import type { AIExecutionCapability } from './ai-execution-request';
import type { ExecutionProfile } from './execution-profile';

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
