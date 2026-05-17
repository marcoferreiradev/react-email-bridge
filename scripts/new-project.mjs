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
import { spawn, spawnSync } from 'node:child_process';
import url from 'node:url';
import * as p from '@clack/prompts';
import pc from 'picocolors';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const startersRoot = path.join(repoRoot, 'starters');

function listAvailableStarters() {
  if (!fs.existsSync(startersRoot)) return [];
  return fs
    .readdirSync(startersRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function bail(msg) {
  p.cancel(msg);
  process.exit(1);
}

// ── Parse args ──────────────────────────────────────────────────────
const args = process.argv.slice(2);
const skipInstall = args.includes('--skip-install');

const templateIdx = args.findIndex((a) => a === '--template' || a === '-t');
let template = 'default';
const consumed = new Set();
if (templateIdx >= 0 && args[templateIdx + 1]) {
  template = args[templateIdx + 1];
  consumed.add(templateIdx);
  consumed.add(templateIdx + 1);
}

const target = args.find((a, i) => !a.startsWith('--') && !consumed.has(i));

if (!target) {
  console.log(`
${pc.bold('react-email-bridge')} ${pc.dim('· new-project')}

  ${pc.dim('Usage:')}
    pnpm -w run new-project ${pc.cyan('<dir>')} [--template ${pc.cyan('<name>')}] [--skip-install]

  ${pc.dim('Examples:')}
    pnpm -w run new-project ../my-emails
    pnpm -w run new-project ../my-vtex --template vtex-full
    pnpm -w run new-project ../tmp --skip-install

  ${pc.dim('Available templates:')}
${listAvailableStarters()
  .map((s) => `    ${pc.green('·')} ${s}`)
  .join('\n')}
`);
  process.exit(1);
}

// ── Validate ────────────────────────────────────────────────────────
const starterDir = path.join(startersRoot, template);
if (!fs.existsSync(starterDir)) {
  bail(
    `Unknown template ${pc.bold(template)}. Available: ${listAvailableStarters().join(', ')}`
  );
}

const vendorDir = path.join(starterDir, 'vendor');
const tarballs = fs.existsSync(vendorDir)
  ? fs.readdirSync(vendorDir).filter((f) => f.endsWith('.tgz'))
  : [];
if (tarballs.length < 2) {
  bail(
    `No tarballs in ${pc.cyan(path.relative(repoRoot, vendorDir) + '/')}. Run ${pc.bold('pnpm pack-all')} from the repo root first.`
  );
}

const destination = path.resolve(process.cwd(), target);
if (fs.existsSync(destination)) {
  bail(`Destination already exists: ${pc.cyan(destination)}`);
}

const parent = path.dirname(destination);
if (!fs.existsSync(parent)) {
  bail(`Parent directory does not exist: ${pc.cyan(parent)}`);
}

// ── Run ─────────────────────────────────────────────────────────────
const t0 = Date.now();
p.intro(pc.bgCyan(pc.black(' react-email-bridge ')));

// Show shortest of: relative path, abs path, ~/...
const home = process.env.HOME || process.env.USERPROFILE || '';
const rel = path.relative(process.cwd(), destination);
const tilde = home && destination.startsWith(home) ? '~' + destination.slice(home.length) : destination;
const shown = [rel, tilde, destination].sort((a, b) => a.length - b.length)[0];

p.log.step(`Template: ${pc.cyan(template)}`);
p.log.step(`Destination: ${pc.cyan(shown)}`);

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

const copySpinner = p.spinner();
copySpinner.start('Copying starter');
try {
  copy(starterDir, destination);
  copySpinner.stop(
    `Files copied ${pc.dim(`(${tarballs.length} tarballs in vendor/)`)}`
  );
} catch (e) {
  copySpinner.stop(pc.red(`Copy failed: ${e.message}`), 1);
  process.exit(1);
}

if (!skipInstall) {
  await runWithSpinner('Installing dependencies', 'pnpm', ['install'], destination);
}

await initGitRepo(destination);

const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

p.outro(
  `${pc.green('✓ Ready')} ${pc.dim(`in ${elapsed}s`)}

  ${pc.dim('Next:')}
    ${pc.cyan(`cd ${shown}`)}
    ${pc.cyan(skipInstall ? 'pnpm install && pnpm dev' : 'pnpm dev')}
`
);

// ── Helpers ─────────────────────────────────────────────────────────

async function runWithSpinner(label, cmd, cmdArgs, cwd) {
  const sp = p.spinner();
  sp.start(label);

  let stdoutBuf = '';
  let stderrBuf = '';

  await new Promise((resolve) => {
    const child = spawn(cmd, cmdArgs, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', (d) => (stdoutBuf += d.toString()));
    child.stderr.on('data', (d) => (stderrBuf += d.toString()));
    child.on('close', (code) => {
      if (code === 0) {
        sp.stop(label);
        resolve();
      } else {
        sp.stop(pc.red(`${label} failed`), 1);
        if (stderrBuf) console.error(stderrBuf);
        if (stdoutBuf) console.error(stdoutBuf);
        process.exit(code ?? 1);
      }
    });
    child.on('error', (err) => {
      sp.stop(pc.red(`${label} failed: ${err.message}`), 1);
      process.exit(1);
    });
  });
}

async function initGitRepo(dir) {
  const inGit = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
    cwd: dir,
    stdio: 'ignore',
  });
  if (inGit.status === 0) {
    p.log.step(pc.dim('Already inside a git repo — skipping git init'));
    return;
  }

  const init = spawnSync('git', ['init', '-q', '-b', 'main'], {
    cwd: dir,
    stdio: 'ignore',
  });
  if (init.status !== 0) {
    p.log.warn(pc.yellow('git not available — skipping git init'));
    return;
  }

  spawnSync('git', ['add', '.'], { cwd: dir, stdio: 'ignore' });
  const commit = spawnSync(
    'git',
    ['commit', '-q', '-m', 'chore: bootstrap from react-email-bridge starter'],
    { cwd: dir, stdio: 'ignore' }
  );

  if (commit.status === 0) {
    p.log.step(`Initialised git repo ${pc.dim('(branch: main)')}`);
  } else {
    p.log.step(
      `Initialised git repo ${pc.dim('(set user.name/email for initial commit)')}`
    );
  }
}
