import { describe, expect, it, vi } from 'vitest';
import { WorkspaceRecallAdapter } from '../../src/infrastructure/ratary/workspace-recall-adapter';
import { StudioRataryClient } from '../../src/infrastructure/ratary/studio-ratary-client';

const tenant = {
  identityId: 'identity-1',
  organizationId: 'org-1',
  workspaceId: 'ws-1',
};

describe('WorkspaceRecallAdapter', () => {
  it('fetches context via StudioRataryClient SDK path only', async () => {
    const client = new StudioRataryClient({ baseUrl: 'http://localhost:9876' });
    const spy = vi.spyOn(client, 'buildContext').mockResolvedValue({
      context: 'ADR-001 content',
      memoryCount: 1,
      items: [{ content: 'ADR-001 content', candidateId: 'cand-adr-0001' }],
    });

    const adapter = new WorkspaceRecallAdapter(client, tenant);
    const result = await adapter.fetchContextPackage({ query: 'migration decision' });

    expect(spy).toHaveBeenCalledWith(
      {
        task: 'migration decision',
        maxTokens: undefined,
        project: undefined,
      },
      tenant,
    );
    expect(result.contextText).toBe('ADR-001 content');
    expect(result.items[0]?.candidateId).toBe('cand-adr-0001');
    expect(result.consumedVia).toBe('sdk-context-api');
  });
});
