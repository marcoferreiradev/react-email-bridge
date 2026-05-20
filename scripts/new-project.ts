#!/usr/bin/env tsx
/**
 * Author shortcut for scaffolding a new react-email-bridge project from
 * a local example, without going through `npx`. Thin shim over the
 * package's `init` command — same logic, same templates, same rewrites.
 *
 *   pnpm -w run new-project ../my-emails
 *   pnpm -w run new-project ../my-vtex --template vtex-store
 *   pnpm -w run new-project ~/projects/store-emails --skip-install
 *
 * Imports `init` directly to skip the CLI's vm-modules re-exec, which
 * is only needed at `dev` time (sandboxed loading of user emails).
 *
 * See ADR-0001 for the examples-as-starter rationale and ADR-0003 for
 * the init-as-create-new-project shape.
 */

import { init } from '../packages/react-email-bridge/src/cli/commands/init';

const args = process.argv.slice(2);

interface Opts {
  template?: string;
  skipInstall?: boolean;
  skipGit?: boolean;
}

const opts: Opts = {};
const positional: string[] = [];

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--skip-install') {
    opts.skipInstall = true;
  } else if (a === '--skip-git') {
    opts.skipGit = true;
  } else if (a === '-t' || a === '--template') {
    opts.template = args[++i];
  } else if (a?.startsWith('--template=')) {
    opts.template = a.split('=', 2)[1];
  } else if (a && !a.startsWith('-')) {
    positional.push(a);
  }
}

const dir = positional[0];

if (!dir) {
  console.error(
    `Usage: pnpm -w run new-project <dir> [--template <name>] [--skip-install] [--skip-git]`
  );
  process.exit(1);
}

await init(dir, opts);
