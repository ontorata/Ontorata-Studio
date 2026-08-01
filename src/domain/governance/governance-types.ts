export type MemoryGovernanceEvaluationPoint = 'write' | 'recall' | 'stewardship';

export type MemoryGovernanceEnforcementClass = 'hard' | 'soft';

export interface MemoryGovernanceModuleRef {
  id: string;
  point: MemoryGovernanceEvaluationPoint;
  enforcement: MemoryGovernanceEnforcementClass;
  modulePath: string;
  notes: string;
}

export interface MemoryGovernanceManifest {
  model: string;
  shape: 'G';
  owner: 'ratary';
  updateMechanism: string;
  modules: readonly MemoryGovernanceModuleRef[];
  nonGoals: readonly string[];
}

export interface StewardshipRunReportView {
  runId: string;
  ownerId: string;
  projectId?: string;
  dryRun: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  tasks: Array<{
    taskId: string;
    stage: string;
    status: string;
    scanned: number;
    changed: number;
    findings: string[];
    error?: string;
  }>;
  totalScanned: number;
  totalChanged: number;
  hadErrors: boolean;
}
