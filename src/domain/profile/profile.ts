/** Phase 08 — AI Profiles (persona + capability presets). */
export interface AIProfileRef {
  id: string;
  name: string;
  scope: 'personal' | 'organization' | 'official' | 'community';
  description?: string;
  capabilities?: string[];
}
