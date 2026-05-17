#!/usr/bin/env node
/**
 * After `pnpm pack` produces tarballs in dist-tarballs/, copy them into
 * every starter's vendor/ folder so the starters are ready for
 * `pnpm install` / `pnpm -w run new-project`.
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tarballsDir = path.join(repoRoot, 'dist-tarballs');
const startersRoot = path.join(repoRoot, 'starters');

if (!fs.existsSync(tarballsDir)) {
  console.error('  ✗ No dist-tarballs/ — run pnpm pack first.');
  process.exit(1);
}

const tarballs = fs.readdirSync(tarballsDir).filter((f) => f.endsWith('.tgz'));

if (tarballs.length === 0) {
  console.error('  ✗ No .tgz files in dist-tarballs/.');
  process.exit(1);
}

if (!fs.existsSync(startersRoot)) {
  console.warn('  ⚠ No starters/ folder. Nothing to distribute to.');
  process.exit(0);
}

const starters = fs
  .readdirSync(startersRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

for (const starter of starters) {
  const vendorDir = path.join(startersRoot, starter, 'vendor');
  fs.mkdirSync(vendorDir, { recursive: true });

  // Wipe stale tarballs so we don't accumulate old versions.
  for (const old of fs.readdirSync(vendorDir)) {
    if (old.endsWith('.tgz')) {
      fs.unlinkSync(path.join(vendorDir, old));
    }
  }

  for (const tgz of tarballs) {
    fs.copyFileSync(path.join(tarballsDir, tgz), path.join(vendorDir, tgz));
  }
  console.log(`  ✓ starters/${starter}/vendor/ — ${tarballs.length} tarballs`);
}
