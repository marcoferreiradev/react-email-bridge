---
"react-email-bridge": patch
---

Fix missing README on npmjs.com. The package's `files` array referenced
`README.md` but no such file existed inside `packages/react-email-bridge/`
(only at the repo root), so the published tarball had no README. A new
`prepack` script syncs the root README into the package directory at
pack time; the resulting `packages/react-email-bridge/README.md` is
gitignored to keep the root the single source of truth.
