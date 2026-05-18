# react-email-bridge

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
