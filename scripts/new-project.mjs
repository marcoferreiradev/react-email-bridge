#!/usr/bin/env node
/**
 * Bootstrap a new react-email-bridge project from the starter.
 *
 *   pnpm new-project ../my-emails
 *   pnpm new-project ~/projects/store-emails --skip-install
 *
 * Requires `pnpm pack-all` to have run first so the tarballs exist in
 * starter/vendor/.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function bail(msg) {
  console.error(`\n  ✗ ${msg}\n`);
  process.exit(1);
}

const args = process.argv.slice(2);
const skipInstall = args.includes('--skip-install');
const target = args.find((a) => !a.startsWith('--'));

if (!target) {
  console.log(`
  Usage: pnpm new-project <dir> [--skip-install]

  Example: pnpm new-project ../my-emails
`);
  process.exit(1);
}

const starterDir = path.join(repoRoot, 'starter');
const vendorDir = path.join(starterDir, 'vendor');
const tarballs = fs.existsSync(vendorDir)
  ? fs.readdirSync(vendorDir).filter((f) => f.endsWith('.tgz'))
  : [];

if (tarballs.length < 2) {
  bail(
    `No tarballs in starter/vendor/. Run \`pnpm pack-all\` from ${repoRoot} first.`
  );
}

const destination = path.resolve(process.cwd(), target);
if (fs.existsSync(destination)) {
  bail(`Destination already exists: ${destination}`);
}

const parent = path.dirname(destination);
if (!fs.existsSync(parent)) {
  bail(`Parent directory does not exist: ${parent}`);
}

console.log(`\n  ◇ Copying starter → ${destination}`);

// Recursive copy that skips node_modules and dist if they happen to exist.
function copy(src, dst) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    const base = path.basename(src);
    if (base === 'node_modules' || base === 'dist' || base === '.next') return;
    fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copy(path.join(src, entry), path.join(dst, entry));
    }
  } else {
    fs.copyFileSync(src, dst);
  }
}
copy(starterDir, destination);

console.log(`  ✓ Files copied (${tarballs.length} tarballs in vendor/)`);

if (skipInstall) {
  console.log(`\n  Skipping install. Run \`pnpm install && pnpm dev\` in ${target}.\n`);
  process.exit(0);
}

console.log(`  ◇ Running pnpm install in ${target}...\n`);
const install = spawnSync('pnpm', ['install'], {
  cwd: destination,
  stdio: 'inherit',
});

if (install.status !== 0) {
  bail(`pnpm install failed in ${destination}`);
}

console.log(`
  ✓ Ready.

  Next:
    cd ${target}
    pnpm dev
`);
