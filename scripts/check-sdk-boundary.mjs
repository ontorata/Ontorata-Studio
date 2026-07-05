import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'src');
const allowed = new Set([path.join(srcDir, 'api', 'ratary-client.ts')]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const violations = [];
for (const file of walk(srcDir)) {
  if (allowed.has(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (/\bfetch\s*\(/.test(text)) {
    violations.push(path.relative(root, file));
  }
}

if (violations.length > 0) {
  console.error('SDK boundary violation — fetch() only allowed in src/api/ratary-client.ts:');
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}

console.log('SDK boundary OK');
