/**
 * Text/code file types supported by the workspace editor.
 * Keep in sync with get-language-extension.ts highlighting map.
 */

/** File extensions (lowercase, without dot) openable in the editor. */
export const TEXT_FILE_EXTENSIONS = new Set([
  // Web
  'html',
  'htm',
  'xhtml',
  'css',
  'scss',
  'sass',
  'less',
  'js',
  'mjs',
  'cjs',
  'ts',
  'tsx',
  'jsx',
  'vue',
  'svelte',
  // Backend / systems
  'py',
  'pyw',
  'php',
  'java',
  'rb',
  'go',
  'cs',
  'cpp',
  'cc',
  'cxx',
  'c',
  'h',
  'hpp',
  'hh',
  'rs',
  'swift',
  'kt',
  'kts',
  'scala',
  'pl',
  'pm',
  'lua',
  'r',
  'dart',
  'ex',
  'exs',
  'erl',
  'hs',
  'clj',
  'cljs',
  'vb',
  'fs',
  'fsx',
  // Data & query
  'sql',
  'psql',
  'mysql',
  'json',
  'jsonc',
  'geojson',
  'topojson',
  'xml',
  'xsl',
  'xsd',
  'yaml',
  'yml',
  'csv',
  'tsv',
  'toml',
  // Config & project
  'ini',
  'cfg',
  'conf',
  'config',
  'env',
  'properties',
  'prop',
  'gitignore',
  'dockerfile',
  'htaccess',
  'editorconfig',
  'prettierrc',
  'eslintrc',
  'npmrc',
  'nvmrc',
  'tf',
  'tfvars',
  'gradle',
  'cmake',
  'make',
  'mk',
  // Shell / scripts
  'sh',
  'bash',
  'zsh',
  'fish',
  'ps1',
  'psm1',
  'bat',
  'cmd',
  // Docs & markup
  'md',
  'mdx',
  'markdown',
  'txt',
  'rtf',
  'rst',
  'adoc',
  'asciidoc',
  'tex',
  'log',
  // Other common text
  'svg',
  'graphql',
  'gql',
  'prisma',
  'proto',
  'wasm',
  'lock',
]);

/** Extensionless or special filenames treated as editable text. */
export const TEXT_FILE_BASENAMES = new Set([
  'dockerfile',
  'makefile',
  'gnumakefile',
  'gemfile',
  'rakefile',
  'procfile',
  'jenkinsfile',
  'vagrantfile',
  'brewfile',
  'readme',
  'license',
  'changelog',
  'authors',
  'contributing',
  'copying',
  'notice',
  '.gitignore',
  '.gitattributes',
  '.gitmodules',
  '.dockerignore',
  '.editorconfig',
  '.env',
  '.env.local',
  '.env.example',
  '.htaccess',
  '.prettierrc',
  '.eslintrc',
  '.npmrc',
  '.nvmrc',
  '.babelrc',
  '.browserslistrc',
]);

export function getFileBaseName(fileName: string): string {
  return (fileName.split(/[/\\]/).pop() ?? fileName).trim();
}

export function getFileExtension(fileName: string): string {
  const base = getFileBaseName(fileName);
  if (!base.includes('.')) return '';
  const ext = base.split('.').pop()?.toLowerCase() ?? '';
  return ext;
}

export function isLikelyTextFile(fileName: string): boolean {
  const base = getFileBaseName(fileName);
  if (!base) return false;

  const normalized = base.toLowerCase();
  if (TEXT_FILE_BASENAMES.has(normalized)) return true;

  const ext = getFileExtension(fileName);
  if (!ext) return true;
  return TEXT_FILE_EXTENSIONS.has(ext);
}
