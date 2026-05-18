#!/usr/bin/env node
/**
 * Bootstrap a new react-email-bridge project from an example template.
 *
 *   pnpm -w run new-project ../my-emails
 *   pnpm -w run new-project ../my-vtex --template vtex-store
 *   pnpm -w run new-project ~/projects/store-emails --skip-install
 *
 * Templates live under `examples/`. Pass `--template <name>` to pick
 * one (default: `generic-hbs`).
 *
 * See `docs/adr/0001-examples-as-starter-source.md` for the rationale
 * behind examples doubling as starter sources.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import url from 'node:url';
import * as p from '@clack/prompts';
import pc from 'picocolors';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const templatesRoot = path.join(repoRoot, 'examples');
const DEFAULT_TEMPLATE = 'generic-hbs';

// ── Generated-file templates (used by rewriteForStarter) ────────────

const NPMRC = `allow-build=esbuild
allow-build=sharp
allow-build=highlight.js
`;

const TSCONFIG = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["emails/**/*", "components/**/*", "react-email-bridge.config.ts"]
}
`;

const CONFIG_STUB = `import { defineConfig } from 'react-email-bridge';

export default defineConfig({
  // outputExtension: '.html',
  // strict: true,
  // previewHelpers: {
  //   myCustomHelper: (value) => String(value).toUpperCase(),
  // },
});
`;

function listAvailableTemplates() {
  if (!fs.existsSync(templatesRoot)) return [];
  return fs
    .readdirSync(templatesRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function getBridgeVersion() {
  const pkgPath = path.join(repoRoot, 'packages/react-email-bridge/package.json');
  return JSON.parse(fs.readFileSync(pkgPath, 'utf-8')).version;
}

function bail(msg) {
  p.cancel(msg);
  process.exit(1);
}

// ── Parse args ──────────────────────────────────────────────────────
const args = process.argv.slice(2);
const skipInstall = args.includes('--skip-install');

const templateIdx = args.findIndex((a) => a === '--template' || a === '-t');
let template = DEFAULT_TEMPLATE;
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
    pnpm -w run new-project ../my-vtex --template vtex-store
    pnpm -w run new-project ../tmp --skip-install

  ${pc.dim('Available templates:')}
${listAvailableTemplates()
  .map((s) => `    ${pc.green('·')} ${s}${s === DEFAULT_TEMPLATE ? pc.dim(' (default)') : ''}`)
  .join('\n')}
`);
  process.exit(1);
}

// ── Validate ────────────────────────────────────────────────────────
const sourceDir = path.join(templatesRoot, template);
if (!fs.existsSync(sourceDir)) {
  bail(`Unknown template ${pc.bold(template)}. Available: ${listAvailableTemplates().join(', ')}`);
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
const tilde =
  home && destination.startsWith(home) ? '~' + destination.slice(home.length) : destination;
const shown = [rel, tilde, destination].sort((a, b) => a.length - b.length)[0];

p.log.step(`Template: ${pc.cyan(template)}`);
p.log.step(`Destination: ${pc.cyan(shown)}`);

// Files that exist in the source example for monorepo-dev reasons but
// shouldn't appear in a scaffolded user project.
const EXAMPLE_ONLY_FILES = new Set(['CHANGELOG.md', 'PORTING.md', 'README.md']);

function copy(src, dst, isRoot = false) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    const base = path.basename(src);
    if (base === 'node_modules' || base === 'dist' || base === '.next') return;
    fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      if (isRoot && EXAMPLE_ONLY_FILES.has(entry)) continue;
      copy(path.join(src, entry), path.join(dst, entry), false);
    }
  } else {
    fs.copyFileSync(src, dst);
  }
}

const copySpinner = p.spinner();
copySpinner.start('Copying template');
try {
  copy(sourceDir, destination, true);
  copySpinner.stop('Files copied');
} catch (e) {
  copySpinner.stop(pc.red(`Copy failed: ${e.message}`), 1);
  process.exit(1);
}

const rewriteSpinner = p.spinner();
rewriteSpinner.start('Customising for standalone project');
try {
  rewriteForStarter(destination, template, path.basename(destination));
  rewriteSpinner.stop('Project shape applied');
} catch (e) {
  rewriteSpinner.stop(pc.red(`Rewrite failed: ${e.message}`), 1);
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

// ── Rewrite logic (examples-as-starter, per ADR-0001) ───────────────

function rewriteForStarter(dest, templateName, projectName) {
  rewritePackageJson(dest, templateName, projectName);
  writeFile(path.join(dest, '.npmrc'), NPMRC);
  writeFile(path.join(dest, 'tsconfig.json'), TSCONFIG);
  ensureConfig(dest);
  writeFile(path.join(dest, 'README.md'), readmeFor(templateName, projectName));
}

function rewritePackageJson(dest, templateName, projectName) {
  const pkgPath = path.join(dest, 'package.json');
  const original = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const bridgeVersion = getBridgeVersion();

  const rewritten = {
    name: projectName,
    version: '0.0.1',
    private: true,
    type: 'module',
    scripts: {
      dev: 'react-email-bridge dev',
      export: 'react-email-bridge export --all',
    },
    dependencies: {
      react: '^19.0.0',
      'react-dom': '^19.0.0',
      'react-email': original.dependencies?.['react-email'] ?? '^6.1.4',
      'react-email-bridge': `^${bridgeVersion}`,
    },
    devDependencies: {
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
      typescript: '^5.6.0',
    },
  };

  // Preserve template-specific extras (e.g. tailwindcss in vtex-store).
  if (original.devDependencies?.tailwindcss) {
    rewritten.devDependencies.tailwindcss = original.devDependencies.tailwindcss;
  }

  fs.writeFileSync(pkgPath, JSON.stringify(rewritten, null, 2) + '\n');
}

function ensureConfig(dest) {
  const configPath = path.join(dest, 'react-email-bridge.config.ts');
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, CONFIG_STUB);
  }
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}

function readmeFor(templateName, projectName) {
  const isVtex = templateName === 'vtex-store';
  const target = isVtex
    ? 'Paste the output into VTEX Message Center → HTML field.'
    : 'Paste the output into Mandrill, Mailchimp, or any platform that interprets `{{variable}}` markers.';

  return `# ${projectName}

Email templates built with [\`react-email-bridge\`](https://npmjs.com/package/react-email-bridge).${
    isVtex ? ' Pre-populated with 13 VTEX transactional templates and shared partials.' : ''
  }

## Setup

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

Opens the preview server at http://localhost:3737 with live reload on every
\`emails/*.tsx\` or \`emails/*.json\` change.

## Authoring

- \`emails/<name>.tsx\` — your template (React Email components + Handlebars
  markers preserved via \`react-email-bridge\` sugar components).
- \`emails/<name>.json\` — fixture used by the preview renderer. Not
  shipped to production.

The sidebar auto-discovers new files. If a \`.json\` fixture is missing,
the preview shows a banner with a one-click "Create empty fixture" button.

## Export

\`\`\`bash
pnpm export
\`\`\`

Writes \`dist/*.hbs\` (or whatever extension you set in
\`react-email-bridge.config.ts\`). ${target}

## Customisation

Add custom helpers (so previews render with realistic values) in
\`react-email-bridge.config.ts\`:

\`\`\`ts
import { defineConfig } from 'react-email-bridge';

export default defineConfig({
  previewHelpers: {
    formatCurrency: (n) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
        .format(Number(n) / 100),
  },
});
\`\`\`

Preview-time only — the exported \`.hbs\` is identical regardless. The
target platform (VTEX, Mandrill, etc.) supplies the real implementation
at send time.
`;
}

// ── Process helpers ─────────────────────────────────────────────────

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
    ['commit', '-q', '-m', 'chore: bootstrap from react-email-bridge template'],
    { cwd: dir, stdio: 'ignore' }
  );

  if (commit.status === 0) {
    p.log.step(`Initialised git repo ${pc.dim('(branch: main)')}`);
  } else {
    p.log.step(`Initialised git repo ${pc.dim('(set user.name/email for initial commit)')}`);
  }
}
