import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'src');
const rataryAdapterDir = path.join(srcDir, 'infrastructure', 'ratary');

const forbiddenPatterns = [
  { name: 'recall-policy', regex: /recall-policy|RecallPolicy/i },
  { name: 'context-budget', regex: /context-budget|ContextBudget/i },
  { name: 'candidate-provider', regex: /candidate-provider|CandidateProvider/i },
  { name: 'ratary-recall-src', regex: /memory\/recall|context-package-assembler/i },
  { name: 'ratary-src-import', regex: /from\s+['"]ratary\/src/i },
];

const contextBuildPattern = /\.context\.build\s*\(|sdk\.context\.build\s*\(/;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function isUnderRataryAdapter(file) {
  const rel = path.relative(rataryAdapterDir, file);
  return !rel.startsWith('..') && !path.isAbsolute(rel);
}

const violations = [];

for (const file of walk(srcDir)) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file);

  for (const pattern of forbiddenPatterns) {
    if (pattern.regex.test(text)) {
      violations.push(`${rel}: forbidden recall-internal pattern (${pattern.name})`);
    }
  }

  if (contextBuildPattern.test(text) && !isUnderRataryAdapter(file)) {
    violations.push(
      `${rel}: context.build() must route through infrastructure/ratary adapters (WorkspaceRecallPort)`,
    );
  }
}

const portFile = path.join(srcDir, 'application', 'recall', 'workspace-recall.port.ts');
const adapterFile = path.join(rataryAdapterDir, 'workspace-recall-adapter.ts');
if (!fs.existsSync(portFile) || !fs.existsSync(adapterFile)) {
  violations.push('missing WorkspaceRecallPort or WorkspaceRecallAdapter files');
}

if (violations.length > 0) {
  console.error('\nRecall consumer boundary violation:\n');
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}

console.log('recall consumer boundary OK');
