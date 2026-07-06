/** Android-style launcher tiles — paths relative to `/workspace/:id`. */
export interface LauncherApp {
  id: string;
  label: string;
  path: string;
  icon: string;
  tint: string;
  capabilityFlag?: string;
  externalUrl?: string;
}

export const LAUNCHER_APPS: LauncherApp[] = [
  { id: 'memories', label: 'Memories', path: 'memories', icon: 'M', tint: '#16c47f' },
  { id: 'search', label: 'Search', path: 'search', icon: 'S', tint: '#0ea5e9' },
  { id: 'graph', label: 'Graph', path: 'graph', icon: 'G', tint: '#8b5cf6', capabilityFlag: 'supportsKnowledgeGraph' },
  { id: 'chat', label: 'Ontory', path: 'ontory/chat', icon: 'O', tint: '#16c47f' },
  { id: 'knowledge', label: 'Knowledge', path: 'knowledge', icon: 'K', tint: '#14b8a6' },
  { id: 'workspaces', label: 'Workspaces', path: 'workspaces', icon: 'W', tint: '#6366f1', capabilityFlag: 'supportsWorkspace' },
  { id: 'agents', label: 'Agents', path: 'agents', icon: 'A', tint: '#f59e0b' },
  { id: 'mcp', label: 'MCP', path: 'mcp', icon: '⚡', tint: '#ec4899' },
  { id: 'profiles', label: 'Profiles', path: 'profiles', icon: 'P', tint: '#22c55e' },
  { id: 'stacks', label: 'Stacks', path: 'stacks', icon: 'Σ', tint: '#06b6d4' },
  { id: 'builder', label: 'Builder', path: 'stack-builder', icon: 'B', tint: '#a855f7' },
  { id: 'models', label: 'Models', path: 'models', icon: '◇', tint: '#64748b' },
  { id: 'coding', label: 'Code', path: 'coding', icon: '</>', tint: '#16c47f' },
  { id: 'organization', label: 'Org', path: 'organization', icon: '◎', tint: '#3b82f6' },
  { id: 'observability', label: 'Status', path: 'observability', icon: '◉', tint: '#10b981' },
  { id: 'enterprise', label: 'Enterprise', path: 'enterprise', icon: 'E', tint: '#78716c' },
  { id: 'security', label: 'Security', path: 'security', icon: '🔒', tint: '#ef4444' },
];

export const LAUNCHER_ROUTE_TITLES: Record<string, string> = Object.fromEntries(
  LAUNCHER_APPS.map((a) => [a.path.replace(/\//g, '-'), a.label]),
);
