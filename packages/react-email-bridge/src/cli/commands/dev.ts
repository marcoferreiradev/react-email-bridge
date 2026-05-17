import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { watch } from 'chokidar';
import debounce from 'debounce';
import { createJiti } from 'jiti';
import { addDevDependency } from 'nypm';
import prompts from 'prompts';
import { Server as SocketServer, type Socket } from 'socket.io';
import * as p from '@clack/prompts';
import pc from 'picocolors';

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
      message: 'The preview server requires "react-email-bridge-ui". Install it now?',
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

async function tryListen(
  server: http.Server,
  port: number
): Promise<{ portAlreadyInUse: boolean }> {
  return new Promise((resolve) => {
    server.listen(port, () => resolve({ portAlreadyInUse: false }));
    server.on('error', (e: NodeJS.ErrnoException) => {
      if (e.code === 'EADDRINUSE') resolve({ portAlreadyInUse: true });
    });
  });
}

export async function dev({ dir: emailsDirArg, port: portArg }: Args) {
  const cwd = process.cwd();
  const emailsDirAbs = path.resolve(cwd, emailsDirArg);

  p.intro(pc.bgCyan(pc.black(' react-email-bridge dev ')));

  if (!fs.existsSync(emailsDirAbs)) {
    p.cancel(
      `Emails directory not found: ${pc.cyan(emailsDirArg)}. Run ${pc.bold('react-email-bridge init')} first.`
    );
    process.exit(1);
  }

  const uiLocation = await resolveUiLocation();
  let port = parseInt(portArg, 10);

  // Env vars consumed by the vendored UI app to know where the user's emails live.
  // NODE_ENV is set AFTER the spread so it always wins — the bundled Next app
  // must run in production mode regardless of the caller's NODE_ENV.
  process.env = {
    ...process.env,
    REACT_EMAIL_INTERNAL_EMAILS_DIR_RELATIVE_PATH: emailsDirArg,
    REACT_EMAIL_INTERNAL_EMAILS_DIR_ABSOLUTE_PATH: emailsDirAbs,
    REACT_EMAIL_INTERNAL_PREVIEW_SERVER_LOCATION: uiLocation,
    REACT_EMAIL_INTERNAL_USER_PROJECT_LOCATION: cwd,
    NODE_ENV: 'production',
  };

  // Programmatic Next so we can attach socket.io to the same http.Server.
  // jiti is used to import next from the UI package's deps (Next is large and
  // the user shouldn't have to install it separately).
  const uiJiti = createJiti(uiLocation);
  const nextMod = await uiJiti.import<{
    default: (opts: unknown) => {
      prepare: () => Promise<void>;
      getRequestHandler: () => http.RequestListener;
      close: () => Promise<void>;
    };
  }>('next');
  const next = nextMod.default;

  const app = next({
    dev: false,
    hostname: 'localhost',
    port,
    dir: uiLocation,
    conf: { images: { unoptimized: true } },
  });

  p.log.step(`Watching ${pc.cyan(emailsDirArg + '/')}`);

  const sp = p.spinner();
  sp.start('Loading preview server');
  await app.prepare();
  sp.stop('Preview server ready');
  const handle = app.getRequestHandler();

  const server = http.createServer((req, res) => {
    res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate, no-store');
    handle(req, res);
  });

  // Try to bind; bump port if in use.
  let result = await tryListen(server, port);
  while (result.portAlreadyInUse) {
    p.log.warn(pc.yellow(`Port ${port} in use, trying ${port + 1}`));
    port += 1;
    result = await tryListen(server, port);
  }

  p.outro(
    `${pc.green('✓')} ${pc.bold('Ready')} ${pc.dim('—')} ${pc.cyan(`http://localhost:${port}`)}`
  );

  // ─ Hot reload: chokidar → socket.io → useHotreload in the UI ────────
  let clients: Socket[] = [];
  const io = new SocketServer(server);
  io.on('connection', (client) => {
    clients.push(client);
    client.on('disconnect', () => {
      clients = clients.filter((c) => c !== client);
    });
  });

  let pendingChanges: { event: string; filename: string }[] = [];
  const flush = debounce(() => {
    for (const client of clients) {
      client.emit('reload', pendingChanges);
    }
    pendingChanges = [];
  }, 150);

  const watcher = watch('', { cwd: emailsDirAbs, ignoreInitial: true });
  watcher.on('all', (event, file) => {
    if (!file) return;
    pendingChanges.push({ event, filename: file });
    flush();
  });

  const shutdown = async () => {
    console.log(`\n  ${pc.dim('Stopping…')}`);
    await watcher.close();
    await app.close();
    server.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
