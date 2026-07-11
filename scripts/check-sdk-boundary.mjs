import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'src');
const allowedFetch = new Set([
  path.join(srcDir, 'infrastructure', 'ratary', 'studio-ratary-client.ts'),
  path.join(srcDir, 'api', 'ratary-client.ts'),
  path.join(srcDir, 'infrastructure', 'ai', 'ontory-rest-workspace-ai-runtime.ts'),
  // Auth Gateway HTTP client (pre-existing infrastructure adapter).
  path.join(srcDir, 'infrastructure', 'auth', 'ratary-native-auth-adapter.ts'),
]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

const violations = [];
for (const file of walk(srcDir)) {
  if (allowedFetch.has(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (/\bfetch\s*\(/.test(text)) {
    violations.push(`${path.relative(root, file)}: fetch() outside allowed infrastructure adapters`);
  }
}

// P2-A: Studio must not import Ontory packages or run Dispatcher in-process.
for (const file of walk(srcDir)) {
  const code = stripComments(fs.readFileSync(file, 'utf8'));
  const rel = path.relative(root, file);
  if (/from\s+['"]@ontorata\/ontory(?:\/[^'"]*)?['"]|from\s+['"][^'"]*\/ontory\/src\//.test(code)) {
    violations.push(`${rel}: must not import Ontory packages — use REST RuntimePort only`);
  }
  if (/new\s+RuntimeDispatcher\b|new\s+StubRuntimeProvider\b/.test(code)) {
    violations.push(`${rel}: in-process Ontory Dispatcher is forbidden — use HTTP RuntimePort`);
  }
}

if (violations.length > 0) {
  console.error(
    'SDK / Ontory boundary violation — fetch() only in allowlisted adapters; no in-process Ontory:',
  );
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}

console.log('SDK boundary OK');
