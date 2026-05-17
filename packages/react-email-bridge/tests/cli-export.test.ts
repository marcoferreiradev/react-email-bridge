import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import url from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CLI export behaves like a published binary. We test against the built
 * dist/cli/index.mjs (the same artifact users will run). Each test scaffolds
 * a temp project, runs the CLI, and inspects the output file.
 */

const CLI = path.resolve(__dirname, '../dist/cli/index.mjs');

// CLI output uses picocolors; under a TTY-less spawn the bytes still include
// ANSI codes, so substring asserts on emoji+text break unless we normalize.
// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape sequences
const stripAnsi = (s: string) => s.replace(/\[[0-9;]*m/g, '');

// Tests scaffold tmp projects INSIDE the package dir (sibling of node_modules)
// so esbuild's `packages: external` resolution finds react/@react-email/* via
// pnpm's hoisted store. A tmp dir under os.tmpdir() can't resolve those.
const TMP_ROOT = path.resolve(__dirname, '.tmp');

function makeTmpProject() {
  fs.mkdirSync(TMP_ROOT, { recursive: true });
  const dir = fs.mkdtempSync(path.join(TMP_ROOT, 'proj-'));
  fs.mkdirSync(path.join(dir, 'emails'));
  fs.writeFileSync(
    path.join(dir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          jsx: 'react-jsx',
          esModuleInterop: true,
          isolatedModules: true,
        },
      },
      null,
      2
    )
  );
  return dir;
}

function runCli(cwd: string, args: string[]) {
  return spawnSync('node', [CLI, ...args], {
    cwd,
    encoding: 'utf-8',
  });
}

const projects: string[] = [];

afterAll(() => {
  for (const p of projects) {
    fs.rmSync(p, { recursive: true, force: true });
  }
  if (fs.existsSync(TMP_ROOT) && fs.readdirSync(TMP_ROOT).length === 0) {
    fs.rmdirSync(TMP_ROOT);
  }
});

describe('CLI export', () => {
  beforeAll(() => {
    if (!fs.existsSync(CLI)) {
      throw new Error(
        `CLI not built. Run \`pnpm build\` in packages/react-email-bridge first.\nMissing: ${CLI}`
      );
    }
  });

  it('exports a single template with markers preserved', () => {
    const dir = makeTmpProject();
    projects.push(dir);

    fs.writeFileSync(
      path.join(dir, 'emails', 'simple.tsx'),
      `export default function Simple() {
        return <div>Hello {\`{{name}}\`}!</div>;
      }`
    );

    const result = runCli(dir, ['export', 'simple']);
    if (result.status !== 0) {
      console.error('STDOUT:', result.stdout);
      console.error('STDERR:', result.stderr);
    }
    expect(result.status).toBe(0);
    expect(stripAnsi(result.stdout)).toContain('✓ simple');

    const out = fs.readFileSync(path.join(dir, 'dist/simple.hbs'), 'utf-8');
    expect(out).toContain('{{name}}');
    expect(out).toContain('Hello');
  });

  it('exports --all (multiple templates)', () => {
    const dir = makeTmpProject();
    projects.push(dir);

    fs.writeFileSync(
      path.join(dir, 'emails', 'one.tsx'),
      `export default () => <div>{\`{{a}}\`}</div>;`
    );
    fs.writeFileSync(
      path.join(dir, 'emails', 'two.tsx'),
      `export default () => <div>{\`{{b}}\`}</div>;`
    );

    const result = runCli(dir, ['export', '--all']);
    expect(result.status).toBe(0);
    expect(fs.existsSync(path.join(dir, 'dist/one.hbs'))).toBe(true);
    expect(fs.existsSync(path.join(dir, 'dist/two.hbs'))).toBe(true);
  });

  it('fails with helpful error when template missing', () => {
    const dir = makeTmpProject();
    projects.push(dir);
    const result = runCli(dir, ['export', 'does-not-exist']);
    expect(result.status).not.toBe(0);
    expect(result.stdout + result.stderr).toMatch(/file not found/i);
  });

  it('fails when neither --all nor template name passed', () => {
    const dir = makeTmpProject();
    projects.push(dir);
    const result = runCli(dir, ['export']);
    expect(result.status).not.toBe(0);
    expect(result.stdout + result.stderr).toMatch(/Provide a template name or pass --all/);
  });

  it('respects config.outputExtension', () => {
    const dir = makeTmpProject();
    projects.push(dir);

    fs.writeFileSync(
      path.join(dir, 'emails', 'tpl.tsx'),
      `export default () => <div>{\`{{x}}\`}</div>;`
    );
    fs.writeFileSync(
      path.join(dir, 'react-email-bridge.config.ts'),
      `import { defineConfig } from 'react-email-bridge';\nexport default defineConfig({ outputExtension: '.html' });`
    );

    const result = runCli(dir, ['export', 'tpl']);
    expect(result.status).toBe(0);
    expect(fs.existsSync(path.join(dir, 'dist/tpl.html'))).toBe(true);
    expect(fs.existsSync(path.join(dir, 'dist/tpl.hbs'))).toBe(false);
  });

  it('exits with code 1 if at least one template fails', () => {
    const dir = makeTmpProject();
    projects.push(dir);
    fs.writeFileSync(path.join(dir, 'emails', 'ok.tsx'), `export default () => <div>ok</div>;`);
    fs.writeFileSync(
      path.join(dir, 'emails', 'bad.tsx'),
      `export default () => { throw new Error('intentional'); };`
    );
    const result = runCli(dir, ['export', '--all']);
    expect(result.status).toBe(1);
  });
});

describe('CLI init', () => {
  it('scaffolds emails/ + welcome.tsx + welcome.json + config + tsconfig', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'reb-init-'));
    projects.push(dir);

    const result = runCli(dir, ['init']);
    expect(result.status).toBe(0);

    expect(fs.existsSync(path.join(dir, 'emails/welcome.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(dir, 'emails/welcome.json'))).toBe(true);
    expect(fs.existsSync(path.join(dir, 'react-email-bridge.config.ts'))).toBe(true);
    expect(fs.existsSync(path.join(dir, 'tsconfig.json'))).toBe(true);

    const tsx = fs.readFileSync(path.join(dir, 'emails/welcome.tsx'), 'utf-8');
    expect(tsx).toContain("from 'react-email-bridge'");
    expect(tsx).toContain("from 'react-email-bridge/hbs'");
    expect(tsx).toContain('export default');

    const ts = fs.readFileSync(path.join(dir, 'tsconfig.json'), 'utf-8');
    expect(ts).toContain('"jsx": "react-jsx"');
  });

  it('is idempotent (does not overwrite existing files)', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'reb-init-'));
    projects.push(dir);
    fs.mkdirSync(path.join(dir, 'emails'));
    fs.writeFileSync(path.join(dir, 'emails/welcome.tsx'), '// already here');

    const result = runCli(dir, ['init']);
    expect(result.status).toBe(0);

    const tsx = fs.readFileSync(path.join(dir, 'emails/welcome.tsx'), 'utf-8');
    expect(tsx).toBe('// already here');
  });
});
