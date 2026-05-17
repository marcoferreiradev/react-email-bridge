#!/usr/bin/env node
/**
 * Bootstrap a new react-email-bridge project from a starter template.
 *
 *   pnpm -w run new-project ../my-emails
 *   pnpm -w run new-project ../my-vtex --template vtex-full
 *   pnpm -w run new-project ~/projects/store-emails --skip-install
 *
 * Available starters live in `starters/`. Pass `--template <name>` to
 * pick one (default `default`).
 *
 * Requires `pnpm pack-all` to have run first so each starter's vendor/
 * has the local tarballs.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const startersRoot = path.join(repoRoot, 'starters');

function bail(msg) {
  console.error(`\n  ✗ ${msg}\n`);
  process.exit(1);
}

function listAvailableStarters() {
  if (!fs.existsSync(startersRoot)) return [];
  return fs
    .readdirSync(startersRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

const args = process.argv.slice(2);
const skipInstall = args.includes('--skip-install');

// Find --template <name> and remove both from positional args
const templateIdx = args.findIndex((a) => a === '--template' || a === '-t');
let template = 'default';
const consumed = new Set();
if (templateIdx >= 0 && args[templateIdx + 1]) {
  template = args[templateIdx + 1];
  consumed.add(templateIdx);
  consumed.add(templateIdx + 1);
}

const target = args.find(
  (a, i) => !a.startsWith('--') && !consumed.has(i)
);

if (!target) {
  console.log(`
  Usage: pnpm -w run new-project <dir> [--template <name>] [--skip-install]

  Examples:
    pnpm -w run new-project ../my-emails
    pnpm -w run new-project ../my-vtex --template vtex-full
    pnpm -w run new-project ../tmp --skip-install

  Available templates:
${listAvailableStarters()
  .map((s) => `    - ${s}`)
  .join('\n')}
`);
  process.exit(1);
}

const starterDir = path.join(startersRoot, template);
if (!fs.existsSync(starterDir)) {
  bail(
    `Unknown template "${template}". Available: ${listAvailableStarters().join(', ')}`
  );
}

const vendorDir = path.join(starterDir, 'vendor');
const tarballs = fs.existsSync(vendorDir)
  ? fs.readdirSync(vendorDir).filter((f) => f.endsWith('.tgz'))
  : [];

if (tarballs.length < 2) {
  bail(
    `No tarballs in ${path.relative(repoRoot, vendorDir)}/. Run \`pnpm pack-all\` from ${repoRoot} first.`
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

console.log(`\n  ◇ Template: ${template}`);
console.log(`  ◇ Copying starter → ${destination}`);

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
  console.log(
    `\n  Skipping install. Run \`pnpm install && pnpm dev\` in ${target}.\n`
  );
  initGitRepo(destination);
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

initGitRepo(destination);

console.log(`
  ✓ Ready.

  Next:
    cd ${target}
    pnpm dev
`);

function initGitRepo(dir) {
  const inGit = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
    cwd: dir,
    stdio: 'ignore',
  });
  if (inGit.status === 0) {
    console.log(`  ◇ Inside an existing git repo — skipping git init`);
    return;
  }

  const init = spawnSync('git', ['init', '-q', '-b', 'main'], {
    cwd: dir,
    stdio: 'ignore',
  });
  if (init.status !== 0) {
    console.warn(`  ⚠ git init failed (git not available?). Skipping.`);
    return;
  }

  spawnSync('git', ['add', '.'], { cwd: dir, stdio: 'ignore' });
  const commit = spawnSync(
    'git',
    [
      'commit',
      '-q',
      '-m',
      'chore: bootstrap from react-email-bridge starter',
    ],
    { cwd: dir, stdio: 'ignore' }
  );

  if (commit.status === 0) {
    console.log(`  ✓ Initialised git repo (branch: main)`);
  } else {
    console.log(
      `  ✓ Initialised git repo (no initial commit — set user.name/email)`
    );
  }
}
