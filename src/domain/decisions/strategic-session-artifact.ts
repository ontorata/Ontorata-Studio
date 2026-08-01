import type { DecisionModelSelection } from './decision-model-types';

export type StrategicSessionArtifact = Readonly<{
  id: string;
  workspaceId: string;
  goal: string;
  packageId: string | null;
  outcome: string | null;
  decisionModel?: DecisionModelSelection;
  steps: ReadonlyArray<{ index: number; text: string; status: 'ok' | 'error' }>;
  recordedAt: string;
}>;

const STORAGE_KEY = 'ontorata-studio:strategic-session-artifacts';

function readAll(): StrategicSessionArtifact[] {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StrategicSessionArtifact[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(artifacts: StrategicSessionArtifact[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(artifacts));
}

export function createStrategicSessionArtifactId(): string {
  return `ss-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function listStrategicSessionArtifacts(workspaceId: string): StrategicSessionArtifact[] {
  return readAll()
    .filter((item) => item.workspaceId === workspaceId)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}

export function saveStrategicSessionArtifact(artifact: StrategicSessionArtifact): void {
  const next = [artifact, ...readAll()].slice(0, 20);
  writeAll(next);
}
