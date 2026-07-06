/**
 * Copy @ratary/sdk from a sibling Ratary clone into vendor/ratary-sdk (maintainer sync).
 */
import { cpSync, existsSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dest = join(root, 'vendor', 'ratary-sdk');

const sources = ['../ai-brain/packages/sdk', '../ratary/packages/sdk'].map((p) =>
  resolve(root, p),
);

const source = sources.find((p) => existsSync(join(p, 'package.json')));
if (!source) {
  console.error('No sibling Ratary SDK found. Clone ontorata/ratary next to Ontorata-Studio.');
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
cpSync(source, dest, { recursive: true });
rmSync(join(dest, 'node_modules'), { recursive: true, force: true });
rmSync(join(dest, 'dist'), { recursive: true, force: true });

// Keep standalone tsconfig (Ratary monorepo extends ../../tsconfig.json).
const tsconfig = join(dest, 'tsconfig.json');
if (existsSync(tsconfig)) {
  const { readFileSync, writeFileSync } = await import('node:fs');
  const raw = readFileSync(tsconfig, 'utf8');
  if (raw.includes('../../tsconfig.json')) {
    writeFileSync(
      tsconfig,
      JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2022',
            module: 'NodeNext',
            moduleResolution: 'NodeNext',
            lib: ['ES2022', 'DOM'],
            rootDir: 'src',
            outDir: 'dist',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            resolveJsonModule: true,
            declaration: true,
            declarationMap: true,
            sourceMap: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noFallthroughCasesInSwitch: true,
            noEmit: false,
          },
          include: ['src/**/*'],
        },
        null,
        2,
      ) + '\n',
    );
  }
}

execSync('npm install --include=dev', { cwd: dest, stdio: 'inherit' });
execSync('npm run build', { cwd: dest, stdio: 'inherit' });
console.log(`Synced ${source} → vendor/ratary-sdk`);
