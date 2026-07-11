import { describe, expect, it } from 'vitest';
import { mapCapabilityToExecutionProfile } from '../../src/domain/ai/execution-profile-mapper';

describe('mapCapabilityToExecutionProfile', () => {
  it('maps chat to conversation profile', () => {
    expect(mapCapabilityToExecutionProfile('chat')).toEqual({ name: 'conversation' });
  });

  it('maps summarize to summarize profile', () => {
    expect(mapCapabilityToExecutionProfile('summarize')).toEqual({ name: 'summarize' });
  });

  it('maps tool-assist to tool-assist profile', () => {
    expect(mapCapabilityToExecutionProfile('tool-assist')).toEqual({ name: 'tool-assist' });
  });

  it('returns a frozen profile', () => {
    expect(Object.isFrozen(mapCapabilityToExecutionProfile('chat'))).toBe(true);
  });
});
