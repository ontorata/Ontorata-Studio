const STORAGE_KEY = 'studio:recommendation-intents';

export type RecommendationIntentRecord = Readonly<{
  id: string;
  workspaceId: string;
  cardId: string;
  traceId: string;
  verdict: 'accepted' | 'rejected';
  recordedAt: string;
  title: string;
}>;

function readAll(): RecommendationIntentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecommendationIntentRecord[];
  } catch {
    return [];
  }
}

function writeAll(records: RecommendationIntentRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function listRecommendationIntents(workspaceId: string): RecommendationIntentRecord[] {
  return readAll()
    .filter((record) => record.workspaceId === workspaceId)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}

export function saveRecommendationIntent(record: RecommendationIntentRecord): void {
  const all = readAll().filter((item) => item.id !== record.id);
  all.unshift(record);
  writeAll(all);
}
