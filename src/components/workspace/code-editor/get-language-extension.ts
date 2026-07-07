import { cpp } from '@codemirror/lang-cpp';
import { css } from '@codemirror/lang-css';
import { go } from '@codemirror/lang-go';
import { html } from '@codemirror/lang-html';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { php } from '@codemirror/lang-php';
import { python } from '@codemirror/lang-python';
import { rust } from '@codemirror/lang-rust';
import { sql, StandardSQL } from '@codemirror/lang-sql';
import { vue } from '@codemirror/lang-vue';
import { xml } from '@codemirror/lang-xml';
import { yaml } from '@codemirror/lang-yaml';
import type { Extension } from '@codemirror/state';
import { getFileBaseName, getFileExtension } from '../../../domain/workspace/text-file-types';

function extOf(fileName: string): string {
  const base = getFileBaseName(fileName).toLowerCase();
  if (base === 'dockerfile' || base.endsWith('.dockerfile')) return 'dockerfile';
  if (base === '.htaccess' || base === 'htaccess') return 'htaccess';
  if (base === '.gitignore' || base === 'gitignore') return 'gitignore';
  return getFileExtension(fileName);
}

export function getLanguageExtension(fileName: string): Extension[] {
  const ext = extOf(fileName);

  switch (ext) {
    case 'json':
    case 'jsonc':
    case 'geojson':
    case 'topojson':
      return [json()];
    case 'js':
    case 'mjs':
    case 'cjs':
      return [javascript()];
    case 'jsx':
      return [javascript({ jsx: true })];
    case 'ts':
      return [javascript({ typescript: true })];
    case 'tsx':
      return [javascript({ jsx: true, typescript: true })];
    case 'vue':
      return [vue()];
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return [css()];
    case 'html':
    case 'htm':
    case 'xhtml':
      return [html()];
    case 'md':
    case 'mdx':
    case 'markdown':
      return [markdown()];
    case 'xml':
    case 'xsl':
    case 'xsd':
    case 'svg':
      return [xml()];
    case 'yaml':
    case 'yml':
      return [yaml()];
    case 'py':
    case 'pyw':
      return [python()];
    case 'php':
      return [php()];
    case 'java':
    case 'kt':
    case 'kts':
    case 'scala':
      return [java()];
    case 'go':
      return [go()];
    case 'rs':
      return [rust()];
    case 'cpp':
    case 'cc':
    case 'cxx':
    case 'c':
    case 'h':
    case 'hpp':
    case 'hh':
      return [cpp()];
    case 'sql':
    case 'psql':
    case 'mysql':
      return [sql({ dialect: StandardSQL })];
    case 'cs':
    case 'vb':
    case 'rb':
    case 'pl':
    case 'pm':
    case 'lua':
    case 'r':
    case 'dart':
    case 'swift':
    case 'sh':
    case 'bash':
    case 'zsh':
    case 'fish':
    case 'ps1':
    case 'psm1':
    case 'bat':
    case 'cmd':
    case 'dockerfile':
    case 'htaccess':
    case 'gitignore':
    case 'ini':
    case 'cfg':
    case 'conf':
    case 'config':
    case 'env':
    case 'properties':
    case 'prop':
    case 'toml':
    case 'csv':
    case 'tsv':
    case 'txt':
    case 'rtf':
    case 'rst':
    case 'log':
      return [];
    default:
      return [];
  }
}
