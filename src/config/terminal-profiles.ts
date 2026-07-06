/** Terminal shell profiles — VS Code-style labels (simulated in browser). */

export type ShellProfileId = 'powershell' | 'git-bash' | 'cmd';

export interface ShellProfile {
  id: ShellProfileId;
  label: string;
  shortTitle: string;
  icon: string;
  defaultCwd: string;
  welcome: string;
  formatPrompt: (cwd: string) => string;
}

export const DEFAULT_TERMINAL_PROFILE: ShellProfileId = 'powershell';

export const TERMINAL_PROFILES: ShellProfile[] = [
  {
    id: 'powershell',
    label: 'PowerShell',
    shortTitle: 'powershell',
    icon: '>_',
    defaultCwd: 'D:\\Apps\\Ontorata-Studio',
    welcome: '',
    formatPrompt: (cwd) => `PS ${cwd}>`,
  },
  {
    id: 'git-bash',
    label: 'Git Bash',
    shortTitle: 'bash',
    icon: '$',
    defaultCwd: '/d/Apps/Ontorata-Studio',
    welcome: '',
    formatPrompt: (cwd) => `${cwd} $`,
  },
  {
    id: 'cmd',
    label: 'Command Prompt',
    shortTitle: 'cmd',
    icon: '>',
    defaultCwd: 'D:\\Apps\\Ontorata-Studio',
    welcome: '',
    formatPrompt: (cwd) => `${cwd}>`,
  },
];

export function getTerminalProfile(id: ShellProfileId): ShellProfile {
  return TERMINAL_PROFILES.find((p) => p.id === id) ?? TERMINAL_PROFILES[0];
}
