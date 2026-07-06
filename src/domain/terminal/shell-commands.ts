import { formatPowerShellShortcutsHelp } from '../../config/powershell-shortcuts';
import type { ShellProfileId } from '../../config/terminal-profiles';
import { formatPathNotFoundError } from './powershell-errors';

export type ShellCommandResult =
  | { kind: 'handled'; failed?: boolean }
  | { kind: 'unknown' };

interface ShellContext {
  profileId: ShellProfileId;
  cwd: string;
  appendOutput: (text: string) => void;
  appendError: (text: string) => void;
  setCwd: (cwd: string) => void;
  clearLines: () => void;
}

const WIN_VFS: Record<string, string[]> = {
  'D:\\': ['Apps'],
  'D:\\Apps': ['Ontorata-Studio', 'ai-brain', 'ontorata', 'auth-ontorata'],
  'D:\\Apps\\Ontorata-Studio': [
    'node_modules',
    'src',
    'docs',
    'dist',
    'package.json',
    'vite.config.ts',
    'tsconfig.json',
  ],
  'D:\\Apps\\Ontorata-Studio\\src': ['components', 'pages', 'hooks', 'styles', 'config'],
};

const UNIX_VFS: Record<string, string[]> = {
  '/d': ['Apps'],
  '/d/Apps': ['Ontorata-Studio', 'ai-brain', 'ontorata', 'auth-ontorata'],
  '/d/Apps/Ontorata-Studio': [
    'node_modules',
    'src',
    'docs',
    'dist',
    'package.json',
    'vite.config.ts',
  ],
  '/d/Apps/Ontorata-Studio/src': ['components', 'pages', 'hooks', 'styles', 'config'],
};

function isUnixCwd(cwd: string): boolean {
  return cwd.startsWith('/');
}

function normalizeWinPath(path: string): string {
  let p = path.replace(/\//g, '\\').trim();
  if (/^[A-Za-z]:[^\\]/.test(p)) {
    p = p.slice(0, 2) + '\\' + p.slice(2);
  }
  if (/^[A-Za-z]:$/.test(p)) return `${p}\\`;
  if (/^[A-Za-z]:\\$/.test(p)) return p;
  if (/^[A-Za-z]:\\/.test(p)) return p.replace(/\\+$/, '');
  return p;
}

function normalizeUnixPath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts.length ? `/${parts.join('/')}` : '/';
}

function winParent(path: string): string | null {
  const normalized = normalizeWinPath(path);
  const match = normalized.match(/^([A-Za-z]:\\)(.*)$/);
  if (!match) return null;
  const [, drive, rest] = match;
  const parts = rest.split('\\').filter(Boolean);
  if (parts.length === 0) return drive.slice(0, 2);
  parts.pop();
  return parts.length ? `${drive}${parts.join('\\')}` : drive;
}

function unixParent(path: string): string | null {
  const normalized = normalizeUnixPath(path);
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length === 0) return '/';
  parts.pop();
  return parts.length ? `/${parts.join('/')}` : '/';
}

function resolveWinCd(cwd: string, target: string): string | null {
  const trimmed = target.trim().replace(/^["']|["']$/g, '');
  if (!trimmed || trimmed === '.') return normalizeWinPath(cwd);
  if (trimmed === '..') return winParent(cwd);
  if (/^[A-Za-z]:/.test(trimmed)) return normalizeWinPath(trimmed);
  const base = normalizeWinPath(cwd);
  const joined = `${base}\\${trimmed.replace(/\//g, '\\')}`;
  return normalizeWinPath(joined);
}

function resolveUnixCd(cwd: string, target: string): string | null {
  const trimmed = target.trim().replace(/^["']|["']$/g, '');
  if (!trimmed || trimmed === '.') return normalizeUnixPath(cwd);
  if (trimmed === '..') return unixParent(cwd);
  if (trimmed.startsWith('/')) return normalizeUnixPath(trimmed);
  const base = normalizeUnixPath(cwd);
  return normalizeUnixPath(`${base}/${trimmed}`);
}

function resolveCd(cwd: string, target: string, unix: boolean): string | null {
  return unix ? resolveUnixCd(cwd, target) : resolveWinCd(cwd, target);
}

function listDir(cwd: string, unix: boolean): string {
  const vfs = unix ? UNIX_VFS : WIN_VFS;
  const key = unix ? normalizeUnixPath(cwd) : normalizeWinPath(cwd);
  const entries = vfs[key];
  if (!entries) return '';
  return entries
    .map((name) => (name.includes('.') ? name : `${name}${unix ? '/' : '\\'}`))
    .join('\n');
}

export function listPathEntries(cwd: string, unix: boolean): string[] {
  const vfs = unix ? UNIX_VFS : WIN_VFS;
  const key = unix ? normalizeUnixPath(cwd) : normalizeWinPath(cwd);
  return vfs[key] ?? [];
}

export function tryRunShellCommand(raw: string, ctx: ShellContext): ShellCommandResult {
  const trimmed = raw.trim();
  if (!trimmed) return { kind: 'handled' };

  const unix = isUnixCwd(ctx.cwd);
  const [name, ...rest] = trimmed.split(/\s+/);
  const cmd = name.toLowerCase();
  const args = rest.join(' ');

  if (cmd === 'cls' || cmd === 'clear') {
    ctx.clearLines();
    return { kind: 'handled' };
  }

  if (cmd === 'cd' || cmd === 'chdir' || cmd === 'set-location') {
    const target = args || (unix ? '~' : '');
    if (!target && !unix) {
      ctx.appendOutput(ctx.cwd);
      return { kind: 'handled' };
    }
    const resolved =
      target === '~' || target === '$HOME'
        ? unix
          ? '/d/Apps/Ontorata-Studio'
          : 'D:\\Apps\\Ontorata-Studio'
        : resolveCd(ctx.cwd, target, unix);
    if (!resolved) {
      ctx.appendError(formatPathNotFoundError('cd', target, ctx.profileId));
      return { kind: 'handled', failed: true };
    }
    ctx.setCwd(resolved);
    return { kind: 'handled' };
  }

  if (cmd === 'pwd' || cmd === 'get-location') {
    ctx.appendOutput(
      unix
        ? ctx.cwd
        : ['\n', 'Path', '----', ctx.cwd].join('\n'),
    );
    return { kind: 'handled' };
  }

  if (cmd === 'ls' || cmd === 'dir' || cmd === 'get-childitem') {
    const target = args ? (resolveCd(ctx.cwd, args, unix) ?? ctx.cwd) : ctx.cwd;
    const listing = listDir(target, unix);
    ctx.appendOutput(listing || `Cannot find path '${target}' because it does not exist.`);
    if (!listing) return { kind: 'handled', failed: true };
    return { kind: 'handled' };
  }

  if (cmd === 'echo' || cmd === 'write-output') {
    ctx.appendOutput(args || '');
    return { kind: 'handled' };
  }

  if (cmd === 'help' || cmd === 'get-help') {
    ctx.appendOutput(
      [
        'TOPIC',
        '    Studio terminal help',
        '',
        'SHELL COMMANDS',
        '    cd, pwd, dir, ls, echo, cls, clear',
        '',
        'STUDIO COMMANDS',
        '    status, health, memories, output, problems, shortcuts',
      ].join('\n'),
    );
    return { kind: 'handled' };
  }

  if (cmd === 'shortcuts') {
    ctx.appendOutput(formatPowerShellShortcutsHelp());
    return { kind: 'handled' };
  }

  return { kind: 'unknown' };
}
