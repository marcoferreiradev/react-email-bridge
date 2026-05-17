import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { createJiti } from 'jiti';
import { addDevDependency } from 'nypm';
import prompts from 'prompts';

interface Args {
  dir: string;
  port: string;
}

/**
 * Resolve the location of `react-email-bridge-ui` from the user's project. If
 * not installed, prompt to install it (matches react-email's pattern — keeps
 * the heavy Next.js preview UI off the default install).
 */
async function resolveUiLocation(): Promise<string> {
  const usersProject = createJiti(process.cwd());
  try {
    const resolved = usersProject.esmResolve('react-email-bridge-ui');
    return path.dirname(url.fileURLToPath(resolved));
  } catch {
    const response = await prompts({
      type: 'confirm',
      name: 'install',
      message:
        'The preview server requires "react-email-bridge-ui". Install it now?',
      initial: true,
    });
    if (!response.install) {
      process.exit(0);
    }
    await addDevDependency('react-email-bridge-ui');
    const resolved = usersProject.esmResolve('react-email-bridge-ui');
    return path.dirname(url.fileURLToPath(resolved));
  }
}

export async function dev({ dir: emailsDirArg, port }: Args) {
  const cwd = process.cwd();
  const emailsDirAbs = path.resolve(cwd, emailsDirArg);

  if (!fs.existsSync(emailsDirAbs)) {
    console.error(`✗ Emails directory not found: ${emailsDirArg}`);
    console.error(`  Run "react-email-bridge init" first.`);
    process.exit(1);
  }

  const uiLocation = await resolveUiLocation();

  console.log(`  ◇ Loading preview server from ${uiLocation}`);
  console.log(`  ◇ Watching ${emailsDirArg}/`);
  console.log(`  ◇ Starting on port ${port}\n`);

  const env = {
    ...process.env,
    NODE_OPTIONS:
      (process.env.NODE_OPTIONS ?? '') +
      ' --experimental-vm-modules --disable-warning=ExperimentalWarning',
    REACT_EMAIL_INTERNAL_EMAILS_DIR_RELATIVE_PATH: emailsDirArg,
    REACT_EMAIL_INTERNAL_EMAILS_DIR_ABSOLUTE_PATH: emailsDirAbs,
    REACT_EMAIL_INTERNAL_PREVIEW_SERVER_LOCATION: uiLocation,
    REACT_EMAIL_INTERNAL_USER_PROJECT_LOCATION: cwd,
    NODE_ENV: 'production',
  };

  // We spawn Next directly. Could be inlined via Next's programmatic API but
  // that requires more wiring; spawn is the simplest reliable approach.
  const next = spawn(
    'pnpm',
    ['exec', 'next', 'start', uiLocation, '-p', port],
    {
      cwd: uiLocation,
      env,
      stdio: 'inherit',
    }
  );

  next.on('exit', (code) => process.exit(code ?? 0));

  process.on('SIGINT', () => {
    next.kill('SIGINT');
    process.exit(0);
  });
}
