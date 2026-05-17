# react-email-bridge

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
