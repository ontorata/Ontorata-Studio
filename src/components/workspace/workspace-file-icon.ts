import { getFileExtension } from '../../domain/workspace/text-file-types';

export type WorkspaceFileIconKind =
  | 'typescript'
  | 'javascript'
  | 'json'
  | 'markdown'
  | 'stylesheet'
  | 'html'
  | 'python'
  | 'php'
  | 'java'
  | 'go'
  | 'rust'
  | 'sql'
  | 'vue'
  | 'yaml'
  | 'toml'
  | 'xml'
  | 'shell'
  | 'config'
  | 'image'
  | 'pdf'
  | 'text'
  | 'default';

export function getWorkspaceFileIconKind(fileName: string): WorkspaceFileIconKind {
  const ext = getFileExtension(fileName);
  const base = fileName.split(/[/\\]/).pop()?.toLowerCase() ?? '';

  switch (ext) {
    case 'ts':
    case 'mts':
    case 'cts':
      return 'typescript';
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return 'javascript';
    case 'json':
    case 'jsonc':
    case 'geojson':
    case 'topojson':
      return 'json';
    case 'md':
    case 'mdx':
    case 'markdown':
      return 'markdown';
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return 'stylesheet';
    case 'html':
    case 'htm':
    case 'xhtml':
      return 'html';
    case 'py':
    case 'pyw':
      return 'python';
    case 'php':
      return 'php';
    case 'java':
    case 'kt':
    case 'kts':
      return 'java';
    case 'go':
      return 'go';
    case 'rs':
      return 'rust';
    case 'sql':
    case 'psql':
    case 'mysql':
      return 'sql';
    case 'vue':
    case 'svelte':
      return 'vue';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'toml':
      return 'toml';
    case 'xml':
    case 'xsl':
    case 'xsd':
    case 'svg':
      return 'xml';
    case 'sh':
    case 'bash':
    case 'zsh':
    case 'fish':
    case 'ps1':
    case 'bat':
    case 'cmd':
      return 'shell';
    case 'dockerfile':
    case 'gitignore':
    case 'htaccess':
    case 'ini':
    case 'cfg':
    case 'conf':
    case 'config':
    case 'env':
    case 'properties':
      return 'config';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
    case 'ico':
    case 'bmp':
      return 'image';
    case 'pdf':
      return 'pdf';
    case 'txt':
    case 'log':
    case 'csv':
    case 'tsv':
      return 'text';
    default:
      if (base === 'dockerfile' || base === 'makefile' || base === '.gitignore') {
        return 'config';
      }
      return 'default';
  }
}
