#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { program } from 'commander';
import { dev } from './commands/dev';
import { exportCmd } from './commands/export';
import { init } from './commands/init';

const PACKAGE_NAME = 'react-email-bridge';

// The vendored UI uses Node's vm.SourceTextModule (sandboxed module loading
// for user email .tsx). It requires --experimental-vm-modules. If not set,
// respawn ourselves with the flag.
const requiredFlags = ['--experimental-vm-modules', '--disable-warning=ExperimentalWarning'];

const hasRequiredFlags = requiredFlags.every((flag) => process.execArgv.includes(flag));

if (!hasRequiredFlags) {
  const child = spawn(
    process.execPath,
    [...requiredFlags, ...process.execArgv, process.argv[1] ?? '', ...process.argv.slice(2)],
    { stdio: 'inherit' }
  );
  child.on('exit', (code) => process.exit(code ?? 0));
} else {
  program
    .name(PACKAGE_NAME)
    .description(
      'Write transactional emails in React Email, export to HTML+template-markers (Handlebars, Liquid, Mailchimp). Preview live with the real engine.'
    )
    .version('0.0.1');

  program
    .command('init')
    .description('Scaffold a new react-email-bridge project in <dir>')
    .argument('<dir>', 'Directory to create the new project in (must be empty or not exist)')
    .option(
      '-t, --template <name>',
      'Template to use (e.g. generic-hbs, vtex-store)',
      'generic-hbs'
    )
    .option('--skip-install', 'Do not run package manager install', false)
    .option('--skip-git', 'Do not initialise a git repository', false)
    .action((dir, opts) => init(dir, opts));

  program
    .command('dev')
    .description('Start the live preview server')
    .option('-d, --dir <path>', 'Directory with your email templates', './emails')
    .option('-p, --port <port>', 'Port to run dev server on', '3737')
    .action(dev);

  program
    .command('export')
    .description('Export templates to .hbs / .html files')
    .argument('[template]', 'Template name (omit + --all for batch)')
    .option('-d, --dir <path>', 'Directory with your email templates', './emails')
    .option('-o, --outDir <path>', 'Output directory', './dist')
    .option('--all', 'Export every template', false)
    .action(exportCmd);

  program.parse();
}
