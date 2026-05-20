# Contributing

Thanks for the interest. Small repo, light process — but a few mandatory
gates because `react-email-bridge` is published to npm and breakage hurts
downstream projects.

## Setup

```bash
git clone git@github.com:marcoferreiradev/react-email-bridge.git
cd react-email-bridge
pnpm install   # husky hooks install automatically via `prepare` script
```

That's it. The post-install `prepare` step (`husky`) wires the git hooks.

## Local gates (git hooks)

Two hooks run automatically — both can be bypassed when you know what you're
doing.

### `pre-commit` (fast, <1s)

Runs `lint-staged` over staged files only:

- `biome check --write` formats + lints staged `.ts` / `.tsx` / `.js` / `.jsx`
  / `.mjs` / `.cjs` / `.json` files.
- Safe fixes apply silently and are re-staged.
- Unfixable lint errors block the commit. Fix them or annotate with
  `// biome-ignore lint/<rule>: <reason>` if the violation is intentional.

Bypass: `git commit --no-verify` (use sparingly — usually for emergency
revert or unrelated docs scratch).

### `pre-push` (slow, ~20s)

Mirrors CI exactly:

```sh
pnpm validate   # P0 pipeline stress test (28 asserts)
pnpm build      # tsdown bundles + typechecks both packages
pnpm test       # vitest (107+ tests)
```

If this passes locally, CI on the PR will pass too (modulo Node version
quirks).

Bypass: `git push --no-verify` for WIP pushes to your own branch when
you already validated locally and just want the remote backup.

## Release flow (changesets)

Every PR that changes published behavior of `react-email-bridge` or
`react-email-bridge-ui` must include a changeset describing the bump.

### How to add one

```bash
pnpm changeset
```

The CLI asks:

1. Which packages changed — pick from the list.
2. Bump type per package — `patch` (bugfix, internal change), `minor`
   (additive feature, no break), `major` (breaking change to public API).
3. Short summary — one or two sentences for the CHANGELOG.

That writes `.changeset/<random-name>.md`. Commit it as part of your PR.

### When you don't need one

Docs, tests, CI tweaks, internal refactors with zero externally-visible
effect. For these:

```bash
pnpm changeset --empty
```

This records that the PR was intentionally non-releasing.

### What happens on merge to main

The `.github/workflows/release.yml` job picks up accumulated changesets
and either creates or updates a `chore: version packages` PR. That PR
bumps the affected `package.json` versions and writes `CHANGELOG.md`.
Merge that PR → versions are official. (Publishing to npm is not wired
yet; will be enabled in Bloco 10 / v0.2.0.)

## Style / lint

Biome owns formatting and linting. Config in `biome.json`:

- Single quotes, 2-space indent, line width 100, semicolons on.
- Recommended lint rules.
- Import organization is OFF — Biome won't reorder your imports.
- The vendored fork at `packages/react-email-bridge-ui/` is ignored so
  upstream rebases stay clean.

Run manually:

```bash
pnpm lint     # check only
pnpm format   # check + apply safe fixes
```

## Issues + PRs

- Issues live in GitHub Issues at `marcoferreiradev/react-email-bridge`.
  Triage labels: `needs-triage`, `needs-info`, `ready-for-agent`,
  `ready-for-human`, `wontfix`. See `docs/internal/agents/triage-labels.md`.
- PRs should reference an issue when one exists.
- One topic per PR. Mixed-scope PRs are hard to review and hard to revert.

## Scaffolding from a populated example

Users get the canonical scaffold via `npx react-email-bridge init` (in the
README). When working on the library itself, the same flow is available
via the author shortcut — useful when you want to exercise the
copy-rewrite path without going through `npx`:

```bash
# Scaffold the VTEX-store example into a sibling directory
pnpm new-project ../my-vtex-emails --template vtex-store

# Or the minimal generic-hbs (matches the default scaffold)
pnpm new-project ../my-generic-emails

# Faster iteration: skip install/git
pnpm new-project ../my-emails --skip-install --skip-git
```

`scripts/new-project.ts` is a thin shim that imports the same `init`
function the published CLI uses. Local mode is auto-detected (the
scaffold module walks up looking for `pnpm-workspace.yaml` +
`examples/<template>/`), so the example is copied from disk rather than
fetched via giget. See [ADR-0003](./docs/adr/0003-init-creates-new-project.md)
for the resolution mechanism and [ADR-0001](./docs/adr/0001-examples-as-starter-source.md)
for the examples-doubling-as-starters layout.

## Tarball smoke (internal)

`pnpm pack-all` builds both packages and writes tarballs to
`dist-tarballs/`. Not part of the user-facing flow (users install from
npm); kept as an internal sanity check for the tarball structure and as
the input to ad-hoc testing if you need to install the built package
into another project locally:

```bash
pnpm pack-all
cd /tmp/some-test-project
npm install /path/to/react-email-bridge/dist-tarballs/react-email-bridge-X.tgz
```
