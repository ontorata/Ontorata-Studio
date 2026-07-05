/**
 * Ensures vendored @ratary/sdk has a built dist/ before npm links file:vendor/ratary-sdk.
 * Source lives in-repo (ratary is private — no git clone on Vercel).
 * Maintainers: run scripts/sync-ratary-sdk.mjs after SDK changes in ontorata/ratary.
 */
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vendorSdk = join(root, 'vendor', 'ratary-sdk');
const sdkDist = join(vendorSdk, 'dist', 'index.js');

function log(msg) {
  console.log(`[ensure-ratary-sdk] ${msg}`);
}

if (!existsSync(join(vendorSdk, 'package.json'))) {
  console.error('[ensure-ratary-sdk] Missing vendor/ratary-sdk — run scripts/sync-ratary-sdk.mjs');
  process.exit(1);
}

if (existsSync(sdkDist)) {
  log('vendor/ratary-sdk dist OK');
} else {
  log('Building vendored @ratary/sdk…');
  execSync('npm install --include=dev', { cwd: vendorSdk, stdio: 'inherit' });
  execSync('npm run build', { cwd: vendorSdk, stdio: 'inherit' });
  log('Built vendor/ratary-sdk/dist');
}
