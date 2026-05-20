---
'react-email-bridge': minor
---

`init` now scaffolds a complete new project (matches what the README
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
