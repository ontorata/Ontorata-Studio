export type RecommendationCardView = Readonly<{
  cardId: string;
  title: string;
  advisory: true;
  memoryId?: string;
  sourceReference: string;
  confidence?: number;
  evidenceRefs: string[];
  reason: string;
}>;

export type PolicyDenialEventView = Readonly<{
  denialId: string;
  point: 'write' | 'recall' | 'stewardship';
  reasonCode: string;
  occurredAt: string;
  resource?: string;
}>;

export type PolicyDenialSummaryView = Readonly<{
  since: string;
  byPoint: Record<'write' | 'recall' | 'stewardship', number>;
  total: number;
}>;
