---
---

Internal: `examples/<name>/` is now the single source of truth for both
in-monorepo dev fixtures and `new-project --template <name>` scaffolds.
`starters/` directory removed; `scripts/new-project.mjs` rewrites the
copied example for standalone use (package.json, .npmrc, tsconfig,
config stub, README). `scripts/distribute-tarballs.mjs` removed (dead
code after the migration). See ADR-0001.

User-visible: `--template default` no longer exists. Use
`--template generic-hbs` (now the default). `--template vtex-full`
becomes `--template vtex-store`.
