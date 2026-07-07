/** Built-in PowerShell aliases simulated in Studio terminal. */

export const DEFAULT_POWERSHELL_ALIASES: Record<string, string> = {
  ls: 'Get-ChildItem',
  dir: 'Get-ChildItem',
  gci: 'Get-ChildItem',
  cd: 'Set-Location',
  chdir: 'Set-Location',
  cls: 'Clear-Host',
  clear: 'Clear-Host',
  pwd: 'Get-Location',
  echo: 'Write-Output',
  help: 'Get-Help',
};

export function cloneDefaultPowerShellAliases(): Record<string, string> {
  return { ...DEFAULT_POWERSHELL_ALIASES };
}

export function resolvePowerShellAlias(
  command: string,
  aliases: Record<string, string>,
): string {
  const [name, ...rest] = command.trim().split(/\s+/);
  const key = name.toLowerCase();
  const target = aliases[key];
  if (!target) return command;
  const args = rest.join(' ');
  return args ? `${target} ${args}` : target;
}

export function formatGetChildItemListing(entries: string[]): string {
  if (entries.length === 0) return '';
  const lines = entries.map((name) => {
    const isDir = !name.includes('.');
    return isDir ? `${name}\\` : name;
  });
  return lines.join('\n');
}
