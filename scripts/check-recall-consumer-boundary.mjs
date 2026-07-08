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
  { name: 'sdk-deep-import', regex: /from\s+['"]@ratary\/sdk\// },
];

const contextBuildPattern = /\.context\.build\s*\(|sdk\.context\.build\s*\(/;
const clientBuildContextPattern = /\.buildContext\s*\(/;
const recallPortFile = path.join(srcDir, 'application', 'recall', 'workspace-recall.port.ts');

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

  if (clientBuildContextPattern.test(text) && !isUnderRataryAdapter(file)) {
    violations.push(
      `${rel}: buildContext() is forbidden outside infrastructure/ratary — use WorkspaceRecallOrchestrator`,
    );
  }

  // W3: AI presentation surfaces must not import @ratary/sdk.
  // Memory CRUD pages may still import SDK type aliases until a separate port migrates them.
  const isAiPresentationSurface =
    /[\\/](WorkspaceAiPanel|OntoryChatPage)\.(tsx?|jsx?)$/.test(file);
  if (isAiPresentationSurface && /from\s+['"]@ratary\/sdk['"]/.test(text)) {
    violations.push(
      `${rel}: AI presentation must not import @ratary/sdk — consume WorkspaceContextPackage via orchestrator`,
    );
  }

  if (file === recallPortFile) {
    const methodCount = (text.match(/fetchContextPackage/g) ?? []).length;
    if (!text.includes('fetchContextPackage') || methodCount < 1) {
      violations.push(`${rel}: WorkspaceRecallPort must stay minimal (fetchContextPackage only)`);
    }
    if (/\b(rank|retrieve|searchCandidates)\b/.test(text)) {
      violations.push(`${rel}: recall mechanism methods are forbidden on WorkspaceRecallPort`);
    }
  }
}

const portFile = path.join(srcDir, 'application', 'recall', 'workspace-recall.port.ts');
const adapterFile = path.join(rataryAdapterDir, 'workspace-recall-adapter.ts');
if (!fs.existsSync(portFile) || !fs.existsSync(adapterFile)) {
  violations.push('missing WorkspaceRecallPort or WorkspaceRecallAdapter files');
}

const packageJsonPath = path.join(root, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const dependencyEntries = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};
for (const [name, version] of Object.entries(dependencyEntries)) {
  if (typeof version !== 'string') continue;
  if (/ai-brain|ratary\/src|file:.*\.\.(\\|\/)ai-brain/.test(version)) {
    violations.push(`package.json: dependency ${name} may leak Ratary internal packages`);
  }
}

if (violations.length > 0) {
  console.error('\nRecall consumer boundary violation:\n');
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}

console.log('recall consumer boundary OK');
