export type DecisionBriefVerdict = 'pending' | 'accepted' | 'rejected';

export interface DecisionBriefArtifact {
  id: string;
  workspaceId: string;
  question: string;
  packageId?: string;
  memoryCount: number;
  sourceIds: readonly string[];
  sourceLabels: readonly string[];
  contextPreview: string;
  reasoningText?: string;
  verdict: DecisionBriefVerdict;
  rationale?: string;
  createdAt: string;
  decidedAt?: string;
}

const STORAGE_KEY = 'ontorata-studio:decision-brief-artifacts';

function readAll(): DecisionBriefArtifact[] {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as DecisionBriefArtifact[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(artifacts: DecisionBriefArtifact[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(artifacts));
}

export function listDecisionBriefArtifacts(workspaceId: string): DecisionBriefArtifact[] {
  return readAll()
    .filter((artifact) => artifact.workspaceId === workspaceId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveDecisionBriefArtifact(artifact: DecisionBriefArtifact): void {
  const all = readAll().filter((item) => item.id !== artifact.id);
  writeAll([artifact, ...all]);
}

export function createDecisionBriefId(): string {
  return `brief-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
