# ADR 0001: Examples are the single source of truth for starters

## Status

Accepted (2026-05-18)

## Context

Before this decision, the repo had two parallel structures with overlapping
intent:

- `examples/<name>/` — workspace-bound packages (`workspace:*` ref to
  `react-email-bridge`, `private: true`), used as dev fixtures and CI
  smoke-test targets. `examples/vtex-store/` accumulated 13 ported VTEX
  templates + shared components over Bloco 7.
- `starters/<name>/` — standalone scaffolds (`file:./vendor/*.tgz` ref,
  `private: true`), copied by `scripts/new-project.mjs`. `starters/vtex-full/`
  was intentionally empty (`emails/` was just a `.gitkeep`) — a placeholder
  from before templates existed.

The duplication became a maintenance hazard: a new template added to
`examples/vtex-store/` would NOT propagate to `starters/vtex-full/`, and the
starter would drift silently. The starter being empty made the divergence
worse — outsider scaffolding `vtex-full` got an empty project while the
example was fully populated.

This decision aligns with the move to publish on npm (Bloco 10): once
consumers install from registry (D-Q11 in the pre-publish review),
the `file:./vendor/*.tgz` rationale for separate starters disappears too.

## Decision

Delete the `starters/` directory entirely. `examples/<name>/` becomes the
single source of truth for both:

1. **Dev fixture** in the monorepo — workspace-bound, `private: true`, runs
   in CI smoke-test step (`pnpm -r --filter examples/* test` style).
2. **Starter source** for `scripts/new-project.mjs --template <name>`.

`new-project.mjs` performs a copy-rewrite on bootstrap:

- Copies `examples/<template>/` contents to the target directory.
- Rewrites the destination `package.json`:
  - `name` → user-provided (default: `my-emails-project`)
  - `private` stays `true` (scaffolded projects are not for publish)
  - `react-email-bridge: workspace:*` → `^<latest published>` (no longer
    `file:./vendor/*.tgz`)
  - Removes `react-email-bridge-ui` from `dependencies` if present (CLI
    installs it on-demand)
- Generates shim files the example doesn't have but a standalone project
  needs:
  - `.npmrc` (allow-build for `esbuild`, `sharp`, `highlight.js`)
  - `tsconfig.json` (standalone, not extending the workspace root)
  - `react-email-bridge.config.ts` (optional stub with `previewHelpers: {}`)
  - `README.md` (user-facing, customized per template)

The example itself retains its workspace-bound shape (`workspace:*`,
no `.npmrc`, no own `tsconfig`) — those are repo-monorepo concerns, not
user-project concerns.

## Consequences

**Easier:**

- A new VTEX template added to `examples/vtex-store/` is immediately
  available via `new-project --template vtex-store` — no second update.
- One CI smoke pipeline validates both that the example renders AND that
  the starter scaffold would produce a working project.
- `starters/` directory disappears from the repo tree, simplifying root
  topology for OSS visitors.

**Harder:**

- `new-project.mjs` grows from a `cp -r` into a copy-rewrite script
  (~30 extra lines). Bugs in the rewrite logic break the scaffolding
  flow silently.
- Examples now serve double-duty; changes that make sense for "dev fixture"
  but break "starter source" (e.g. importing a workspace-internal helper)
  must be caught by review.
- Adding a brand-new template family (e.g. `mailchimp-starter`) means
  adding to `examples/<name>/` with the deliberate intent of it also
  being a starter — the dual purpose must be kept in mind.

**Load-bearing assumption:** the rewrite transformations in
`new-project.mjs` are deterministic and idempotent. If we ever need
per-template customization (e.g. starter-only `.npmrc` flags), the
escape hatch is a `<template>/.starter-overrides.json` file in the
example, consumed by the rewrite step. Not implemented yet — adopt
when the first concrete need appears.

## Alternatives considered

1. **Keep `starters/` as a separate directory, kept in sync manually.**
   Rejected — pre-Bloco 10 evidence shows manual sync fails. The
   `vtex-full` starter was empty while `vtex-store` example had 13 templates.

2. **Auto-generate `starters/` from `examples/` via a build step
   (`scripts/build-starters.mjs`).** Rejected — adds a build step that
   has to run before commit (or in CI) and creates two places to debug.
   The copy-rewrite happens once per scaffold instead of every CI run.

3. **Promote examples to non-private npm packages (`@react-email-bridge/example-vtex-store`).**
   Rejected — adds two more packages to maintain, version, and publish.
   Users who want the templates can scaffold; they don't need an
   installable package.

4. **Use a degit-style template fetch (`pnpm dlx degit user/repo/examples/vtex-store target`).**
   Rejected for v0.2 — works, but adds a dependency on a third-party
   tool and bypasses our own CLI. May reconsider for v0.3 if scaffolding
   logic grows complex. **(Reconsidered and accepted via giget in 0.2.0
   — see [ADR-0003](./0003-init-creates-new-project.md). The
   "bypasses our own CLI" objection no longer applies: giget runs
   inside `init`, the CLI calls it as its fetch transport.)**
