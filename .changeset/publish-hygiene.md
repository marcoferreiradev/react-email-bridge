---
"react-email-bridge": patch
"react-email-bridge-ui": patch
---

Publish hygiene pass — no behavior change, but the npm-page metadata
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
