import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { build } from 'esbuild';
import type { ReactElement } from 'react';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { render } from '../../core/render';
import { loadConfig } from '../utils/load-config';

interface Args {
  dir: string;
  outDir: string;
  all?: boolean;
}

/**
 * Bundles a single .tsx email into a transient ESM file via esbuild, then
 * dynamic-imports it. Avoids tsx loader registration quirks (which fail to
 * pick up the user's tsconfig.json across a programmatic boundary). The
 * bundle resolves bare specifiers from the user's project node_modules.
 */
async function loadEmailComponent(filePath: string, cwd: string): Promise<() => ReactElement> {
  // Temp file goes inside the user's project so Node's ESM resolver can find
  // node_modules (react, @react-email/components, react-email-bridge, etc).
  // os.tmpdir() doesn't work — it's outside any node_modules tree.
  const tmpDir = path.join(cwd, '.react-email-bridge-tmp');
  fs.mkdirSync(tmpDir, { recursive: true });
  const outFile = path.join(
    tmpDir,
    `${Date.now()}-${path.basename(filePath, path.extname(filePath))}.mjs`
  );

  await build({
    entryPoints: [filePath],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    outfile: outFile,
    jsx: 'automatic',
    loader: { '.js': 'jsx' },
    absWorkingDir: cwd,
    // Externalize everything from node_modules — Node resolves React,
    // @react-email/components, react-email-bridge at import time.
    packages: 'external',
    logLevel: 'silent',
  });

  try {
    const mod = (await import(url.pathToFileURL(outFile).href)) as {
      default?: () => ReactElement;
    };
    if (typeof mod.default !== 'function') {
      throw new Error('No default export (expected a React component function)');
    }
    return mod.default;
  } finally {
    try {
      fs.unlinkSync(outFile);
      // Best-effort cleanup of the temp dir if empty
      const dir = path.dirname(outFile);
      if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
      }
    } catch {
      // ignore cleanup failures
    }
  }
}

export async function exportCmd(
  templateArg: string | undefined,
  { dir: emailsDirArg, outDir, all }: Args
) {
  const cwd = process.cwd();
  const emailsDir = path.resolve(cwd, emailsDirArg);
  const outDirAbs = path.resolve(cwd, outDir);

  p.intro(pc.bgCyan(pc.black(' react-email-bridge export ')));

  if (!fs.existsSync(emailsDir)) {
    p.cancel(`Emails directory not found: ${pc.cyan(emailsDirArg)}`);
    process.exit(1);
  }

  const config = await loadConfig(cwd);
  const extension = config.outputExtension ?? '.hbs';

  const targets = all
    ? fs
        .readdirSync(emailsDir)
        .filter((f) => /\.(tsx|jsx|ts|js)$/.test(f))
        .map((f) => f.replace(/\.(tsx|jsx|ts|js)$/, ''))
    : templateArg
      ? [templateArg.replace(/\.(tsx|jsx|ts|js)$/, '')]
      : null;

  if (!targets) {
    p.cancel('Provide a template name or pass --all');
    process.exit(1);
  }

  if (!fs.existsSync(outDirAbs)) {
    fs.mkdirSync(outDirAbs, { recursive: true });
  }

  let succeeded = 0;
  let failed = 0;
  const lines: string[] = [];

  for (const name of targets) {
    const candidates = ['.tsx', '.jsx', '.ts', '.js']
      .map((ext) => path.join(emailsDir, `${name}${ext}`))
      .filter((p) => fs.existsSync(p));

    if (candidates.length === 0) {
      lines.push(`  ${pc.red('✗')} ${name} ${pc.dim('— file not found')}`);
      failed++;
      continue;
    }

    try {
      const Component = await loadEmailComponent(candidates[0]!, cwd);
      const element = Component();
      const html = await render(element);
      const outPath = path.join(outDirAbs, `${name}${extension}`);
      fs.writeFileSync(outPath, html, 'utf-8');
      const sizeKb = (html.length / 1024).toFixed(1);
      lines.push(
        `  ${pc.green('✓')} ${name} ${pc.dim('→')} ${pc.cyan(path.relative(cwd, outPath))} ${pc.dim(`(${sizeKb} kB)`)}`
      );
      succeeded++;
    } catch (e) {
      lines.push(`  ${pc.red('✗')} ${name} ${pc.dim('—')} ${pc.red((e as Error).message)}`);
      failed++;
    }
  }

  p.log.step(lines.join('\n'));

  const summary =
    failed === 0
      ? `${pc.green(`✓ ${succeeded} template${succeeded === 1 ? '' : 's'} exported`)} ${pc.dim(`→ ${path.relative(cwd, outDirAbs)}/`)}`
      : `${pc.green(`${succeeded} succeeded`)} ${pc.dim('·')} ${pc.red(`${failed} failed`)} ${pc.dim(`→ ${path.relative(cwd, outDirAbs)}/`)}`;

  p.outro(summary);

  if (failed > 0) process.exit(1);
}
