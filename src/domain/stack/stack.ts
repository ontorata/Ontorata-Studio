/** Phase 09 — AI Stacks (tool + model bundles). */
export interface AIStackRef {
  id: string;
  name: string;
  version: string;
  description?: string;
  tools?: string[];
  models?: string[];
}
