# ADR 0003: `init` always creates a new project, fetched via giget

## Status

Accepted (2026-05-19)

## Context

Two facts collided in the post-Bloco-10 review:

1. **The README quickstart promised behavior the CLI never implemented.** The
   documented flow is `npx react-email-bridge init my-emails && cd my-emails &&
   npm install && npm run dev`, with an illustrated tree that includes
   `package.json`. The actual `init` command (see prior `init.ts`) only writes
   `emails/welcome.tsx`, `emails/welcome.json`, `react-email-bridge.config.ts`,
   and `tsconfig.json` to the current working directory — no `package.json`, no
   git, no install. Following the README produced a silently broken project
   where `npm install` ran against a directory with no manifest.

2. **Templates other than the default were unreachable without cloning.** ADR
   0001 made `examples/<name>/` the single source for both monorepo dev
   fixtures and `--template` scaffolds, but only `scripts/new-project.mjs`
   (a repo-local script) consumed them. A user installing from npm and
   wanting `examples/vtex-store` had to clone the repo manually — directly
   contradicting the install-from-registry posture of Bloco 10.

The ecosystem split that "create new project" and "add to existing project"
into two CLI patterns:

- **`init` = addon to existing project** — Prisma (`prisma init`), ESLint
  (`eslint --init`), Tailwind (`tailwindcss init`), `tsc --init`. These tools
  plug into a host application that already exists.
- **`create-X` = new project scaffold** — `create-next-app`, `create-vite`,
  `create-email` (React Email's own scaffolder), `create-astro`. These tools
  *are* the project shape.

`react-email-bridge` is closer to the second pattern: the project shape
(emails/ folder, fixtures alongside templates, config file, dev server) IS
what the library provides. There is no "host application" — the email
project IS the application. The README always treated it that way; the
implementation was a regression.

ADR 0001 alternative #4 considered (and rejected for v0.2) a degit-style
template fetch — `pnpm dlx degit user/repo/examples/vtex-store target`. The
rejection rested on two arguments: "adds a third-party tool" and "bypasses
our own CLI." Both arguments are weaker now. Giget is ~10KB, MIT, used by
nuxi/create-nuxt and create-next-app; the "third-party" weight is
negligible. And it no longer bypasses our CLI — the CLI *uses* giget as
its fetch transport, the same way `create-next-app` uses it under the
hood. The decision below reverses that part of ADR 0001 explicitly.

## Decision

`init` becomes a "create new project" command, end-to-end:

```bash
npx react-email-bridge init <dir> [--template <name>] [--skip-install] [--skip-git]
```

Behavior:

1. **`<dir>` is a required positional.** Must be empty or not exist. Errors
   out otherwise. No interactive prompt fallback (keeps CI/agent invocations
   clean — interactive prompts can be added later if user demand emerges).

2. **Default `--template` is `generic-hbs`.** No flag = same as
   `--template generic-hbs`. Eliminates the divergence between "init" and
   "init with a template" — they're the same operation, the default just
   picks the minimal starter.

3. **Template source resolution:**

   - **Dev mode** (running from within this repo): walks up from
     `import.meta.url` looking for `pnpm-workspace.yaml` AND
     `examples/<template>/`. If found, copies from local disk.
   - **Production mode** (installed from npm): uses `giget` to fetch
     `github:marcoferreiradev/react-email-bridge/examples/<template>#react-email-bridge@<cli-version>`.
     The tag matches the installed CLI version exactly.
   - **Fallback on tag miss (404)**: retries against `main` branch with a
     visible warning ("Tag react-email-bridge@X not yet available, using
     main — scaffold may not match installed CLI version"). Handles the
     post-publish race where the tag hasn't propagated yet.
   - **Network failure**: hard error with a clear message ("Cannot fetch
     template — check your network connection"). No silent local cache.

4. **Package manager auto-detection.** Reads `process.env.npm_config_user_agent`
   (which `npm`, `pnpm`, `yarn`, and `bun` all populate when they invoke
   scripts), parses out the PM name, and runs the matching `<pm> install`.
   Falls back to `npm` if undetectable. Reason: `npx react-email-bridge init`
   invoked via npm should not try to run `pnpm install` in the new project.
   The old `scripts/new-project.mjs` hard-coded pnpm, which broke for
   anyone without pnpm installed globally.

5. **Install and git init default ON.** `--skip-install` and `--skip-git`
   opt out. Matches `create-next-app` defaults.

6. **Shared scaffold module.** The copy-rewrite logic
   (`rewritePackageJson`, `ensureConfig`, `readmeFor`, `initGitRepo`,
   `runWithSpinner`) moves into
   `packages/react-email-bridge/src/cli/utils/scaffold.ts` (TypeScript,
   ships with the package). `scripts/new-project.mjs` becomes a thin shim
   (~30 lines) that imports the same module via `tsx`, preserving the
   `pnpm new-project ../foo` author shortcut. Single source of truth.

7. **Versioning impact.** This is a breaking change to the `init` command
   shape (positional dir replaces `--dir` flag; new-project semantics
   replace add-to-existing semantics). Release as **0.2.0** (minor —
   pre-1.0 semver permits breaking changes on minor bumps). Not a
   patch — the surface change is real, even though it's "fixing a
   regression against the README."

## Consequences

**Easier:**

- README quickstart works end-to-end. `init my-emails && cd my-emails &&
  npm install && npm run dev` becomes the canonical hello-world and
  actually succeeds.
- `vtex-store` and any future template is one flag away from any user,
  no clone required.
- Tarball stays lean — `react-email-bridge` doesn't ship the
  `examples/` tree. Giget fetches on demand. Aligns with the goal of
  keeping the CLI package small (~38 KB built today).
- `scripts/new-project.mjs` and `init.ts` share logic, so a fix in
  scaffold-time customization (e.g. a new file to generate) lands in
  both flows automatically.

**Harder:**

- `init` now requires network on first run in production. Offline
  scaffolding is no longer possible (used to write 4 files from
  bundled strings). Acceptable: the dev server downloads
  `react-email-bridge-ui` over the network on first `dev` anyway, so
  the project already assumes connectivity.
- Tag-pinning means CI infrastructure has to publish the tag before
  the first user can run `init`. The `main` fallback covers the
  race window, but `init` could produce a warning-decorated scaffold
  during that window.
- The change from `init <dir>` (was an option, `--dir <path>`) to
  positional is a real CLI surface break. Anyone scripting against
  the old `--dir` flag breaks at 0.2.0. Acceptable given the prior
  flow was already broken (no `package.json`, no install path).

**Load-bearing assumption:** the GitHub repo stays public and the tag
naming convention from `changesets/action` (`react-email-bridge@X.Y.Z`)
stays stable. If we ever rename the package or move to a different
release tool, the giget specifier must update in lockstep with
publishing logic. Tests should catch a broken specifier by exercising
the production-mode path end-to-end.

## Alternatives considered

1. **Keep `init` as add-to-existing-project, add a separate `create` command.**
   Rejected — fragments the CLI surface and forces the README to teach two
   commands. The current README already treats `init` as create-a-project;
   adding a parallel `create` would just mean nobody uses `init`.

2. **Bundle templates inside the tarball, no network fetch.**
   Rejected — `examples/vtex-store/` alone is ~200 KB of source plus
   fixtures and tailwind config. Bundling all current templates pushes
   the package past 1 MB; bundling all future templates makes the floor
   grow unbounded. The CLI's job is to be small; templates live where
   templates live (GitHub).

3. **Publish each template as its own npm package
   (`@react-email-bridge/template-vtex-store`).**
   Rejected — adds N packages to publish, version, and maintain, each
   needing its own changeset on every iteration. No real upside over
   pulling from GitHub directly.

4. **Use `degit` instead of `giget`.**
   Rejected — `giget` is the modern equivalent (same author lineage),
   smaller, and is already the default in the `create-next-app` and
   nuxi toolchains we model after. Tied technical debt — fewer
   exotic deps.

5. **Reverse ADR 0001 alternative #4 ruling silently (no new ADR).**
   Rejected — the reversal needs to be findable. Future contributors
   reading ADR 0001 should land on a "superseded by 0003" pointer
   instead of being confused by the apparent contradiction.

## Updates to ADR 0001

ADR 0001 alternative #4 ("Use a degit-style template fetch") was rejected
for v0.2 "for now." This ADR formally accepts that approach (via giget,
which is degit's successor) as of 0.2.0. ADR 0001's core decision —
examples as the single source of truth for both dev fixtures and starter
templates — stands unchanged. Only the *transport* from examples →
user changes: previously local copy via `scripts/new-project.mjs` only,
now local copy in dev OR giget fetch in production, sharing the same
post-copy rewrite step.
