import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { detectPackageManager } from '../utils/package-manager';
import { type ScaffoldLogger, ScaffoldError, scaffold } from '../utils/scaffold';
import { resolveTemplateSource } from '../utils/template-source';

interface Args {
  template?: string;
  skipInstall?: boolean;
  skipGit?: boolean;
}

const DEFAULT_TEMPLATE = 'generic-hbs';

export async function init(dir: string | undefined, opts: Args) {
  p.intro(pc.bgCyan(pc.black(' react-email-bridge init ')));

  if (!dir) {
    p.cancel('Missing required argument: <dir>. See `react-email-bridge init --help`.');
    process.exit(1);
  }

  const dest = path.resolve(process.cwd(), dir);
  const templateName = opts.template ?? DEFAULT_TEMPLATE;
  const projectName = path.basename(dest);

  if (fs.existsSync(dest)) {
    const entries = fs.readdirSync(dest);
    if (entries.length > 0) {
      p.cancel(
        `Destination not empty: ${pc.cyan(dest)}\n  Pick a different directory or empty it first.`
      );
      process.exit(1);
    }
  }

  const cliVersion = readCliVersion();
  const source = resolveTemplateSource(templateName, cliVersion);
  const packageManager = detectPackageManager();

  p.log.step(`Template:    ${pc.cyan(templateName)}`);
  p.log.step(`Destination: ${pc.cyan(displayPath(dest))}`);
  p.log.step(
    `Source:      ${
      source.kind === 'local'
        ? pc.dim(`local (${displayPath(source.path)})`)
        : pc.dim(`giget (${source.specifier})`)
    }`
  );

  type Spinner = ReturnType<typeof p.spinner>;
  const spinnerRef: { current: Spinner | null } = { current: null };
  const logger: ScaffoldLogger = {
    step: (msg) => p.log.step(msg),
    warn: (msg) => p.log.warn(msg),
    start: (msg) => {
      const s = p.spinner();
      spinnerRef.current = s;
      s.start(msg);
    },
    stop: (msg, ok) => {
      const s = spinnerRef.current;
      if (!s) return;
      if (ok) s.stop(msg);
      else s.error(pc.red(msg));
      spinnerRef.current = null;
    },
  };

  const t0 = Date.now();
  try {
    const result = await scaffold({
      source,
      dest,
      projectName,
      templateName,
      cliVersion,
      install: !opts.skipInstall,
      git: !opts.skipGit,
      packageManager,
      logger,
    });

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

    const nextCmd = result.installRan
      ? `${packageManager} run dev`
      : `${packageManager} install && ${packageManager} run dev`;

    p.outro(
      `${pc.green('✓ Ready')} ${pc.dim(`in ${elapsed}s`)}

  ${pc.dim('Next:')}
    ${pc.cyan(`cd ${displayPath(dest)}`)}
    ${pc.cyan(nextCmd)}
`
    );
  } catch (err) {
    spinnerRef.current?.error(pc.red('failed'));
    if (err instanceof ScaffoldError) {
      p.cancel(err.message);
    } else {
      p.cancel(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
    }
    process.exit(1);
  }
}

function readCliVersion(): string {
  try {
    const here = path.dirname(url.fileURLToPath(import.meta.url));
    let dir = here;
    const root = path.parse(dir).root;
    while (dir !== root) {
      const pkgPath = path.join(dir, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as {
          name?: string;
          version?: string;
        };
        if (pkg.name === 'react-email-bridge' && pkg.version) {
          return pkg.version;
        }
      }
      dir = path.dirname(dir);
    }
  } catch {
    // fall through
  }
  return '0.0.0';
}

function displayPath(abs: string): string {
  const home = process.env.HOME ?? process.env.USERPROFILE ?? '';
  const rel = path.relative(process.cwd(), abs);
  const tilde = home && abs.startsWith(home) ? `~${abs.slice(home.length)}` : abs;
  return [rel, tilde, abs].sort((a, b) => a.length - b.length)[0] ?? abs;
}
