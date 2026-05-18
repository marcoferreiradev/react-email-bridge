---
"react-email-bridge": minor
"react-email-bridge-ui": minor
---

First npm release. Bumps both packages from `0.0.x` (pre-publish, vendored
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
