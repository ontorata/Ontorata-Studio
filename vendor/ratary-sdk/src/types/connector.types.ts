export const CONNECTOR_IDS = [
  'slack',
  'github',
  'gitlab',
  'jira',
  'confluence',
  'drive',
  'sharepoint',
  'email',
  'teams',
  'notion',
] as const;

export type ConnectorId = (typeof CONNECTOR_IDS)[number];
