# react-email-bridge

## 0.2.0

### Minor Changes

- 940e9f0: `init` now scaffolds a complete new project (matches what the README
  always promised), with `--template` support for picking which example to
  start from. See [ADR-0003](../docs/adr/0003-init-creates-new-project.md)
  for the design rationale.

  ```bash
  # Default — minimal generic-hbs starter
  npx react-email-bridge init my-emails

  # VTEX-flavored starter (13 transactional templates + Tailwind)
  npx react-email-bridge init my-vtex --template vtex-store
  ```

  What `init` does now:

  - **Creates a new project** in `<dir>` (must be empty or not exist),
    including `package.json`, `tsconfig.json`, `.npmrc`,
    `react-email-bridge.config.ts`, the user-facing `README.md`, and the
    template's `emails/` folder.
  - **Auto-detects your package manager** from `npm_config_user_agent`
    (npm / pnpm / yarn / bun) and runs `<pm> install` automatically. Pass
    `--skip-install` to opt out.
  - **Initializes a git repo** with an initial commit. Pass `--skip-git`
    to opt out.
  - **Fetches the template via [giget](https://github.com/unjs/giget)**
    pinned to the installed CLI version (tag
    `react-email-bridge@<version>` on GitHub). Falls back to `main` with a
    warning if the tag isn't published yet (post-publish race window).

  **Breaking changes:**

  - `<dir>` is now a required positional argument (was `-d, --dir <path>`
    option, defaulted to `./emails`).
  - `init` refuses to write into a non-empty directory.
  - The inline welcome template + fixture were removed; the same content
    now lives in `examples/generic-hbs/` and is fetched on demand.

  Adds `giget` as a runtime dependency (~10 KB). CLI bundle grew from
  ~10 KB to ~23 KB (gzip ~8 KB).

## 0.1.1

### Patch Changes

- 7863b1d: Fix missing README on npmjs.com. The package's `files` array referenced
  `README.md` but no such file existed inside `packages/react-email-bridge/`
  (only at the repo root), so the published tarball had no README. A new
  `prepack` script syncs the root README into the package directory at
  pack time; the resulting `packages/react-email-bridge/README.md` is
  gitignored to keep the root the single source of truth.

## 0.1.0

### Minor Changes

- daf7d3f: First npm release. Bumps both packages from `0.0.x` (pre-publish, vendored
  via tarballs) to `0.1.0` (registry).

  Headline:

  - **13 VTEX transactional email templates** ported from
    `vtex-email-framework`, ported faithfully to TSX and modernized with the
    Halo-Tailwind design system shared-component shell (Bloco 7 + Bloco 11).
  - **Examples-as-starter** consolidation: `scripts/new-project.mjs` now
    reads from `examples/<name>/`, replacing the previous `starters/`
    directory. See ADR-0001.
  - **Documentation taxonomy** (public / repo-internal / local-only) per
    ADR-0002.
  - **Public release surface ready**: README rewritten for `npx
react-email-bridge init` flow; both packages carry full npm metadata
    (`author`, `repository`, `homepage`, `bugs`, `keywords`); license
    filenames normalized; `prepublishOnly` script guards against stale
    `dist/`; pre-commit hook blocks `.env*` / `.pem` / `.key` from staging.

  This is `0.1.0` (semver-pre-1.0 minor) — the internal Bloco 10 plan
  called it "v0.2.0" but a single minor bump from `0.0.2` lands on `0.1.0`.
  Future minor (`0.2.0`) and patch (`0.1.1`) releases use the standard
  changesets flow.

  See `CHANGELOG.md` for the per-package accumulated detail, and
  `docs/internal/DECISIONS.md` for the v0.1 design rationale that this
  release crystallizes.

### Patch Changes

- a71f218: Publish hygiene pass — no behavior change, but the npm-page metadata
  and pre-publish surface get a polish:

  - Add `author` / `repository` / `homepage` / `bugs` / `keywords` fields
    to both packages so npmjs.com renders a useful sidebar (Q4, Q5).
  - `react-email-bridge-ui`: move `react-email` from devDependencies to
    dependencies (it's used by the runtime preview server, not just dev),
    rename `license.md` → `LICENSE` (uppercase, npm convention), rewrite
    `README.md` as a short "you probably want `react-email-bridge`
    instead" pointer + dev section, add `README.md` to the `files` array.
  - Both packages: add `"prepublishOnly": "pnpm build"` script — guards
    against publishing a stale `dist/` (Q20).

## 0.0.2

### Patch Changes

- 9d2c4ec: chore(deps): pin juice to ~11.1.0 (patch-only)

  Tightens the juice version range from `^11.0.0` (any 11.x.y) to
  `~11.1.0` (only 11.1.x patches). Protects the Plano B double-unescape
  pipeline from silent regressions if juice's entity-encoding behavior
  shifts in a future minor. Real fixes in juice 11.2+ can be picked up
  intentionally via an explicit bump.

  No public API change. Bumps `react-email-bridge` only because its
  package.json's dep range is what consumers actually see on install.
