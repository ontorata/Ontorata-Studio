/**
 * P1-D W5 — smoke fixture for workspace AI pipeline evaluation.
 * Deterministic offline corpus — no live LLM / no live Ratary required.
 */
export type SmokeCandidate = {
  candidateId: string;
  title: string;
  content: string;
};

export type SmokeScenario = {
  id: string;
  focus:
    | 'empty-context'
    | 'single-context'
    | 'multi-source'
    | 'session-resume'
    | 'boundary';
  workspaceId: string;
  userPrompt: string;
  userId?: string;
  /** When false, recall returns an empty context package */
  injectCandidates: boolean;
  candidates: SmokeCandidate[];
  expectSourceCount: number;
  expectSnapshotCountAfter: number;
  /** When set, reuse prior session for resume scenarios */
  resumeFromScenarioId?: string;
};

export const WORKSPACE_AI_SMOKE_FIXTURE = {
  fixtureVersion: 'p1d-workspace-ai-smoke-v1',
  description: 'Offline smoke coverage for Workspace → AIExecutionRequest → RuntimePort',
  scenarios: [
    {
      id: 's1-empty-context',
      focus: 'empty-context',
      workspaceId: 'ws-new',
      userPrompt: 'What do we know about this greenfield workspace?',
      userId: 'user-smoke',
      injectCandidates: false,
      candidates: [],
      expectSourceCount: 0,
      expectSnapshotCountAfter: 1,
    },
    {
      id: 's2-single-context',
      focus: 'single-context',
      workspaceId: 'ws-memory',
      userPrompt: 'Summarize the migration decision',
      userId: 'user-smoke',
      injectCandidates: true,
      candidates: [
        {
          candidateId: 'cand-adr-0001',
          title: 'ADR-001',
          content: 'Adopt staged mangrove migration with rollback gates.',
        },
      ],
      expectSourceCount: 1,
      expectSnapshotCountAfter: 1,
    },
    {
      id: 's3-multi-source',
      focus: 'multi-source',
      workspaceId: 'ws-memory',
      userPrompt: 'List sources for the mangrove migration',
      userId: 'user-smoke',
      injectCandidates: true,
      candidates: [
        {
          candidateId: 'cand-adr-0001',
          title: 'ADR-001',
          content: 'Adopt staged mangrove migration with rollback gates.',
        },
        {
          candidateId: 'cand-migration-policy',
          title: 'Migration Policy',
          content: 'Require dual-write verification before cutover.',
        },
        {
          candidateId: 'cand-meeting-notes',
          title: 'Meeting Notes',
          content: 'Owners agreed on Q3 freeze window.',
        },
      ],
      expectSourceCount: 3,
      expectSnapshotCountAfter: 1,
    },
    {
      id: 's4-session-resume',
      focus: 'session-resume',
      workspaceId: 'ws-memory',
      userPrompt: 'Continue: what remained after the freeze window?',
      userId: 'user-smoke',
      injectCandidates: true,
      candidates: [
        {
          candidateId: 'cand-followup',
          title: 'Follow-up',
          content: 'Post-freeze validation checklist.',
        },
      ],
      expectSourceCount: 1,
      expectSnapshotCountAfter: 2,
      resumeFromScenarioId: 's2-single-context',
    },
    {
      id: 's5-boundary',
      focus: 'boundary',
      workspaceId: 'ws-boundary',
      userPrompt: 'Ensure runtime never receives recall decision internals',
      userId: 'user-smoke',
      injectCandidates: true,
      candidates: [
        {
          candidateId: 'cand-boundary',
          title: 'Boundary Proof',
          content: 'Pipeline must pass AIExecutionRequest only.',
        },
      ],
      expectSourceCount: 1,
      expectSnapshotCountAfter: 1,
    },
  ] as SmokeScenario[],
} as const;
