import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { tsImport } from 'tsx/esm/api';
import type { ReactElement } from 'react';
import { render } from '../../core/render.js';
import { loadConfig } from '../utils/load-config.js';

interface Args {
  dir: string;
  outDir: string;
  all?: boolean;
}

export async function exportCmd(
  templateArg: string | undefined,
  { dir: emailsDirArg, outDir, all }: Args
) {
  const cwd = process.cwd();
  const emailsDir = path.resolve(cwd, emailsDirArg);
  const outDirAbs = path.resolve(cwd, outDir);

  if (!fs.existsSync(emailsDir)) {
    console.error(`✗ Emails directory not found: ${emailsDirArg}`);
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
    console.error('✗ Provide a template name or pass --all');
    process.exit(1);
  }

  if (!fs.existsSync(outDirAbs)) {
    fs.mkdirSync(outDirAbs, { recursive: true });
  }

  // tsx's tsImport bundles + executes .tsx with esbuild — same toolchain as
  // the vendored UI uses for sandboxed email loading. Output stays consistent.
  const parentURL = url.pathToFileURL(path.join(emailsDir, 'index.ts')).href;

  let succeeded = 0;
  let failed = 0;

  for (const name of targets) {
    const candidates = ['.tsx', '.jsx', '.ts', '.js']
      .map((ext) => path.join(emailsDir, `${name}${ext}`))
      .filter((p) => fs.existsSync(p));

    if (candidates.length === 0) {
      console.error(`  ✗ ${name}: file not found`);
      failed++;
      continue;
    }

    try {
      const mod = (await tsImport(
        url.pathToFileURL(candidates[0]!).href,
        { parentURL }
      )) as { default?: () => ReactElement };
      const Component = mod.default;
      if (typeof Component !== 'function') {
        console.error(`  ✗ ${name}: no default export`);
        failed++;
        continue;
      }
      const element = (Component as () => ReactElement)();
      const html = await render(element);
      const outPath = path.join(outDirAbs, `${name}${extension}`);
      fs.writeFileSync(outPath, html, 'utf-8');
      console.log(
        `  ✓ ${name} → ${path.relative(cwd, outPath)} (${html.length} bytes)`
      );
      succeeded++;
    } catch (e) {
      console.error(`  ✗ ${name}: ${(e as Error).message}`);
      failed++;
    }
  }

  console.log(
    `\n  ${succeeded} succeeded, ${failed} failed (output → ${path.relative(cwd, outDirAbs)}/)`
  );
  if (failed > 0) process.exit(1);
}
