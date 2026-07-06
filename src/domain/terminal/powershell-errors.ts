import type { ShellProfileId } from '../../config/terminal-profiles';

function cmdletName(command: string): string {
  return command.trim().split(/\s+/)[0] ?? command;
}

function underlineCommand(command: string): string {
  const name = cmdletName(command);
  return '+ ' + '~'.repeat(Math.max(name.length, 1));
}

/** PowerShell-style CommandNotFoundException block (Cursor / VS Code terminal). */
export function formatCommandNotFoundError(command: string): string {
  const name = cmdletName(command);
  return [
    `${name} : The term '${name}' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.`,
    'At line:1 char:1',
    `+ ${name}`,
    underlineCommand(command),
    '    + CategoryInfo          : ObjectNotFound: (' + name + ':String) [], CommandNotFoundException',
    '    + FullyQualifiedErrorId : CommandNotFoundException',
  ].join('\n');
}

export function formatPathNotFoundError(
  cmdlet: string,
  path: string,
  profileId: ShellProfileId,
): string {
  if (profileId === 'git-bash') {
    return `bash: cd: ${path}: No such file or directory`;
  }
  if (profileId === 'cmd') {
    return `The system cannot find the path specified.`;
  }
  return `${cmdlet} : Cannot find path '${path}' because it does not exist.`;
}

export function formatGenericError(message: string, command: string): string {
  const name = cmdletName(command);
  return [
    message,
    'At line:1 char:1',
    `+ ${name}`,
    underlineCommand(command),
    '    + CategoryInfo          : NotSpecified: (:) [], RemoteException',
    '    + FullyQualifiedErrorId : NativeCommandError',
  ].join('\n');
}
