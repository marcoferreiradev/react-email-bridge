# NOTICE

`react-email-bridge` is licensed under the MIT License — see [LICENSE](./LICENSE).

This project incorporates work from third-party open source software,
acknowledged below. All dependencies listed here are MIT-licensed unless
noted otherwise; full license texts are available in their respective
package directories under `node_modules/`.

## Vendored fork

- **`@react-email/ui`** (Copyright 2024 Plus Five Five, Inc — MIT). Forked
  into `packages/react-email-bridge-ui/`. Original license preserved at
  `packages/react-email-bridge-ui/license.md` and reproduced in the root
  [LICENSE](./LICENSE). Modifications documented in
  [PATCHES.md](./docs/internal/PATCHES.md); rebase process in [VENDORING.md](./docs/internal/VENDORING.md).

## Runtime dependencies (shipped to end users)

### `react-email-bridge` (core + CLI + HBS preset)

- [`react-email`](https://github.com/resend/react-email) — Resend
- [`handlebars`](https://handlebarsjs.com/) — Yehuda Katz & contributors
- [`handlebars-helpers`](https://github.com/helpers/handlebars-helpers) —
  Brian Woodward, Jon Schlinkert
- [`juice`](https://github.com/Automattic/juice) — Automattic
- [`@clack/prompts`](https://github.com/bombshell-dev/clack) — Nate Moore
- [`commander`](https://github.com/tj/commander.js) — TJ Holowaychuk
- [`picocolors`](https://github.com/alexeyraspopov/picocolors) —
  Alexey Raspopov
- [`nanoid`](https://github.com/ai/nanoid) — Andrey Sitnik
- [`chokidar`](https://github.com/paulmillr/chokidar) — Paul Miller
- [`socket.io`](https://github.com/socketio/socket.io) — Guillermo Rauch
- [`esbuild`](https://github.com/evanw/esbuild) — Evan Wallace
- [`jiti`](https://github.com/unjs/jiti) — UnJS
- [`nypm`](https://github.com/unjs/nypm) — UnJS
- [`debounce`](https://github.com/sindresorhus/debounce) — Sindre Sorhus
- [`prompts`](https://github.com/terkelg/prompts) — Terkel Gjervig

### `react-email-bridge-ui` (vendored preview server)

Built on Next.js (MIT, Vercel) and the upstream `@react-email/ui` stack
(Radix UI primitives, TailwindCSS, framer-motion, sonner, prism-react-renderer,
etc.). See `packages/react-email-bridge-ui/package.json` for the full list;
all dependencies are MIT or BSD-compatible.

## Reference repositories (not shipped, used for design ground truth)

The `refs/` directory (gitignored) holds clones of public repositories
consulted during development to validate template-engine compatibility
and VTEX-helper behavior. None of their code is redistributed in this
project's published packages.

- [`resend/react-email`](https://github.com/resend/react-email) — MIT
- [`vtex/vtex-emails`](https://github.com/vtex/vtex-emails) — MIT
- [`vtex/vtex-email-framework`](https://github.com/vtex/vtex-email-framework) — MIT
- `email-templates-oficina` — private real-world reference (used by
  author with permission)

## Patches contributed back upstream

When a fork patch generalizes naturally and could benefit the upstream
project, it is marked as a candidate in [PATCHES.md](./docs/internal/PATCHES.md) and may
be proposed as a pull request to `resend/react-email`. Contributions to
upstream remain MIT under their copyright terms.
