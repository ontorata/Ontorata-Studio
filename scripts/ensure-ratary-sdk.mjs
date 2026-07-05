/**
 * Ensures @ratary/sdk is available at .vendor/ratary/packages/sdk before npm install.
 * Local dev: reuses ../ai-brain or ../ratary when present. CI/Vercel: shallow-clones ontorata/ratary.
 */
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vendorRoot = join(root, '.vendor', 'ratary');
const vendorSdk = join(vendorRoot, 'packages', 'sdk');
const sdkDist = join(vendorSdk, 'dist', 'index.js');
const rataryRepo = process.env.RATARY_SDK_REPO ?? 'https://github.com/ontorata/ratary.git';
const rataryRef = process.env.RATARY_SDK_REF ?? 'main';

function log(msg) {
  console.log(`[ensure-ratary-sdk] ${msg}`);
}

function run(cmd, cwd) {
  execSync(cmd, { cwd, stdio: 'inherit', env: process.env });
}

function findSiblingRatary() {
  for (const name of ['ai-brain', 'ratary']) {
    const candidate = resolve(root, '..', name);
    if (existsSync(join(candidate, 'packages', 'sdk', 'package.json'))) {
      return candidate;
    }
  }
  return null;
}

function copyRataryTree(source) {
  rmSync(vendorRoot, { recursive: true, force: true });
  mkdirSync(dirname(vendorRoot), { recursive: true });
  cpSync(source, vendorRoot, {
    recursive: true,
    filter: (src) => {
      const rel = src.slice(source.length + 1);
      if (!rel) return true;
      if (rel === 'node_modules' || rel.startsWith('node_modules' + sep())) return false;
      if (rel === '.git' || rel.startsWith('.git' + sep())) return false;
      return true;
    },
  });
}

function sep() {
  return process.platform === 'win32' ? '\\' : '/';
}

function ensureVendorTree() {
  if (existsSync(join(vendorSdk, 'package.json'))) {
    return;
  }

  const sibling = findSiblingRatary();
  if (sibling) {
    log(`Using sibling Ratary repo: ${sibling}`);
    copyRataryTree(sibling);
    return;
  }

  log(`Cloning ${rataryRepo} (${rataryRef}) into .vendor/ratary`);
  rmSync(vendorRoot, { recursive: true, force: true });
  mkdirSync(dirname(vendorRoot), { recursive: true });
  run(`git clone --depth 1 --branch ${rataryRef} ${rataryRepo} ${vendorRoot}`, root);
}

function buildSdk() {
  if (existsSync(sdkDist)) {
    log('@ratary/sdk dist already present');
    return;
  }
  log('Building @ratary/sdk…');
  run('npm install --include=dev', vendorSdk);
  run('npm run build', vendorSdk);
}

ensureVendorTree();
buildSdk();
log('Ready: .vendor/ratary/packages/sdk');
