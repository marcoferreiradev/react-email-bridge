import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { downloadTemplate } from 'giget';
import type { PackageManager } from './package-manager';
import type { TemplateSource } from './template-source';

export interface ScaffoldOptions {
  source: TemplateSource;
  dest: string;
  projectName: string;
  templateName: string;
  cliVersion: string;
  install: boolean;
  git: boolean;
  packageManager: PackageManager;
  silent?: boolean;
  logger?: ScaffoldLogger;
}

export interface ScaffoldLogger {
  step?: (msg: string) => void;
  warn?: (msg: string) => void;
  start?: (msg: string) => void;
  stop?: (msg: string, ok: boolean) => void;
}

export interface ScaffoldResult {
  packageManager: PackageManager;
  warnings: string[];
  installRan: boolean;
  gitInitialized: boolean;
  sourceUsed: 'local' | 'giget-pinned' | 'giget-fallback';
}

const EXAMPLE_ONLY_FILES = new Set(['CHANGELOG.md', 'PORTING.md', 'README.md']);
const SKIP_DIRS = new Set(['node_modules', 'dist', '.next']);

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

export async function scaffold(opts: ScaffoldOptions): Promise<ScaffoldResult> {
  const warnings: string[] = [];
  const logger = opts.logger ?? {};

  fs.mkdirSync(opts.dest, { recursive: true });

  let sourceUsed: ScaffoldResult['sourceUsed'];

  if (opts.source.kind === 'local') {
    logger.start?.(`Copying template from ${opts.source.path}`);
    copyTree(opts.source.path, opts.dest, true);
    logger.stop?.('Template copied', true);
    sourceUsed = 'local';
  } else {
    const { specifier, fallbackSpecifier } = opts.source;
    logger.start?.(`Fetching template (${specifier})`);
    try {
      await downloadTemplate(specifier, {
        dir: opts.dest,
        force: true,
        silent: true,
        install: false,
      });
      logger.stop?.('Template fetched', true);
      sourceUsed = 'giget-pinned';
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (isOfflineError(err)) {
        logger.stop?.('Template fetch failed (network)', false);
        throw new ScaffoldError(
          `Cannot fetch template — check your network connection.\n  Tried: ${specifier}\n  Cause: ${message}`
        );
      }
      logger.stop?.('Pinned tag unavailable, falling back to main', false);
      const fallbackWarn = `Tag for CLI version ${opts.cliVersion} not yet available on GitHub. Falling back to \`main\` — your scaffold may not match the installed CLI version.`;
      warnings.push(fallbackWarn);
      logger.warn?.(fallbackWarn);

      try {
        await downloadTemplate(fallbackSpecifier, {
          dir: opts.dest,
          force: true,
          silent: true,
          install: false,
        });
        sourceUsed = 'giget-fallback';
      } catch (err2) {
        const message2 = err2 instanceof Error ? err2.message : String(err2);
        throw new ScaffoldError(
          `Cannot fetch template — both pinned tag and main failed.\n  Tried: ${specifier}\n  Then:  ${fallbackSpecifier}\n  Cause: ${message2}`
        );
      }
    }
    pruneExampleOnlyFiles(opts.dest);
  }

  logger.start?.('Customising for standalone project');
  rewriteForStarter(opts.dest, opts.templateName, opts.projectName, opts.cliVersion);
  logger.stop?.('Project shape applied', true);

  let installRan = false;
  if (opts.install) {
    logger.start?.(`Installing dependencies (${opts.packageManager})`);
    const ok = await runInstall(opts.packageManager, opts.dest);
    logger.stop?.(ok ? 'Dependencies installed' : 'Install failed', ok);
    if (!ok) {
      warnings.push(
        `Dependency install failed. Run \`${opts.packageManager} install\` in ${opts.dest} manually.`
      );
    }
    installRan = ok;
  }

  let gitInitialized = false;
  if (opts.git) {
    gitInitialized = initGitRepo(opts.dest, logger);
  }

  return {
    packageManager: opts.packageManager,
    warnings,
    installRan,
    gitInitialized,
    sourceUsed,
  };
}

// ── Public re-exports of error type ──────────────────────────────────

export class ScaffoldError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScaffoldError';
  }
}

// ── Copy logic ───────────────────────────────────────────────────────

function copyTree(src: string, dst: string, isRoot = false): void {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    const base = path.basename(src);
    if (SKIP_DIRS.has(base)) return;
    fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      if (isRoot && EXAMPLE_ONLY_FILES.has(entry)) continue;
      copyTree(path.join(src, entry), path.join(dst, entry), false);
    }
  } else {
    fs.copyFileSync(src, dst);
  }
}

function pruneExampleOnlyFiles(dest: string): void {
  for (const name of EXAMPLE_ONLY_FILES) {
    const p = path.join(dest, name);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      fs.unlinkSync(p);
    }
  }
}

// ── Rewrite logic (per ADR-0001) ─────────────────────────────────────

function rewriteForStarter(
  dest: string,
  templateName: string,
  projectName: string,
  bridgeVersion: string
): void {
  rewritePackageJson(dest, projectName, bridgeVersion);
  writeFile(path.join(dest, '.npmrc'), NPMRC);
  writeFile(path.join(dest, 'tsconfig.json'), TSCONFIG);
  ensureConfig(dest);
  writeFile(path.join(dest, 'README.md'), readmeFor(templateName, projectName));
}

function rewritePackageJson(dest: string, projectName: string, bridgeVersion: string): void {
  const pkgPath = path.join(dest, 'package.json');
  const original = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) : {};

  const rewritten: Record<string, unknown> = {
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

  if (original.devDependencies?.tailwindcss) {
    (rewritten.devDependencies as Record<string, string>).tailwindcss =
      original.devDependencies.tailwindcss;
  }

  fs.writeFileSync(pkgPath, `${JSON.stringify(rewritten, null, 2)}\n`);
}

function ensureConfig(dest: string): void {
  const configPath = path.join(dest, 'react-email-bridge.config.ts');
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, CONFIG_STUB);
  }
}

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}

function readmeFor(templateName: string, projectName: string): string {
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

// ── Install + git init ────────────────────────────────────────────────

async function runInstall(pm: PackageManager, cwd: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(pm, ['install'], { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr?.on('data', (d) => {
      stderr += d.toString();
    });
    child.on('close', (code) => {
      if (code !== 0 && stderr) {
        process.stderr.write(stderr);
      }
      resolve(code === 0);
    });
    child.on('error', () => resolve(false));
  });
}

function initGitRepo(dir: string, logger: ScaffoldLogger): boolean {
  const inGit = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
    cwd: dir,
    stdio: 'ignore',
  });
  if (inGit.status === 0) {
    logger.step?.('Already inside a git repo — skipping git init');
    return false;
  }

  const init = spawnSync('git', ['init', '-q', '-b', 'main'], {
    cwd: dir,
    stdio: 'ignore',
  });
  if (init.status !== 0) {
    logger.warn?.('git not available — skipping git init');
    return false;
  }

  spawnSync('git', ['add', '.'], { cwd: dir, stdio: 'ignore' });
  const commit = spawnSync(
    'git',
    ['commit', '-q', '-m', 'chore: bootstrap from react-email-bridge template'],
    { cwd: dir, stdio: 'ignore' }
  );

  if (commit.status === 0) {
    logger.step?.('Initialised git repo (branch: main)');
  } else {
    logger.step?.('Initialised git repo (set user.name/email for initial commit)');
  }
  return true;
}

function isOfflineError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const code = (err as { code?: string }).code;
  if (
    code === 'ENOTFOUND' ||
    code === 'ECONNREFUSED' ||
    code === 'EAI_AGAIN' ||
    code === 'ETIMEDOUT'
  ) {
    return true;
  }
  return /ENOTFOUND|ECONNREFUSED|EAI_AGAIN|ETIMEDOUT|network|offline/i.test(err.message);
}
