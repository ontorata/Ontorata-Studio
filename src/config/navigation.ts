/** Grouped navigation — enterprise IA for Studio shell. */
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: NavIconName;
  capabilityFlag?: string;
  externalUrl?: string;
}

export type NavIconName =
  | 'home'
  | 'memory'
  | 'search'
  | 'graph'
  | 'knowledge'
  | 'chat'
  | 'agents'
  | 'mcp'
  | 'profiles'
  | 'stacks'
  | 'composer'
  | 'models'
  | 'code'
  | 'workspaces'
  | 'organization'
  | 'security'
  | 'health'
  | 'deployment';

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'intelligence',
    label: 'Intelligence',
    items: [
      { id: 'memories', label: 'Memory Bank', path: 'memories', icon: 'memory' },
      { id: 'search', label: 'Search', path: 'search', icon: 'search' },
      { id: 'graph', label: 'Knowledge Graph', path: 'graph', icon: 'graph', capabilityFlag: 'supportsKnowledgeGraph' },
      { id: 'knowledge', label: 'Knowledge Layer', path: 'knowledge', icon: 'knowledge' },
    ],
  },
  {
    id: 'pilots',
    label: 'Pilots',
    items: [
      {
        id: 'cdsb-001',
        label: 'CDSB-001 Brief',
        path: 'pilots/cdsb-001',
        icon: 'composer',
      },
    ],
  },
  {
    id: 'assist',
    label: 'Assist',
    items: [{ id: 'chat', label: 'Ontory', path: 'ontory/chat', icon: 'chat' }],
  },
  {
    id: 'automation',
    label: 'Automation',
    items: [
      { id: 'agents', label: 'Agents', path: 'agents', icon: 'agents' },
      { id: 'mcp', label: 'Tool Protocol', path: 'mcp', icon: 'mcp' },
      { id: 'profiles', label: 'Role Profiles', path: 'profiles', icon: 'profiles' },
      { id: 'stacks', label: 'Capability Bundles', path: 'stacks', icon: 'stacks' },
      { id: 'composer', label: 'Agent Composer', path: 'stack-builder', icon: 'composer' },
    ],
  },
  {
    id: 'platform',
    label: 'Platform',
    items: [
      { id: 'models', label: 'Model Policy', path: 'models', icon: 'models' },
      { id: 'coding', label: 'Development', path: 'coding', icon: 'code' },
      { id: 'workspaces', label: 'Workspaces', path: 'workspaces', icon: 'workspaces', capabilityFlag: 'supportsWorkspace' },
    ],
  },
  {
    id: 'governance',
    label: 'Governance',
    items: [
      { id: 'organization', label: 'Organization', path: 'organization', icon: 'organization' },
      { id: 'security', label: 'Security', path: 'security', icon: 'security' },
      { id: 'health', label: 'System Health', path: 'observability', icon: 'health' },
      { id: 'deployment', label: 'Deployment', path: 'enterprise', icon: 'deployment' },
    ],
  },
];

export function resolveNavTitle(pathSuffix: string): string {
  for (const group of NAV_GROUPS) {
    const item = group.items.find(
      (i) => i.path === pathSuffix || pathSuffix.startsWith(`${i.path}/`),
    );
    if (item) return item.label;
  }
  if (pathSuffix.startsWith('memories/')) return 'Memory detail';
  return 'Studio';
}
