# react-email-bridge-ui

Live preview server for [`react-email-bridge`](../react-email-bridge). Renders
React Email templates with Handlebars markers preserved, interpolates against
co-located JSON fixtures, and serves the result in an iframe with linter,
spam check, compatibility, and data tabs.

> Installed on demand by `react-email-bridge dev`. Most users never need to
> touch this package directly.

## Fork notice

This package is a fork of [`@react-email/ui`](https://github.com/resend/react-email/tree/main/packages/preview-server)
(Copyright 2024 Plus Five Five, Inc — MIT). The upstream UI is a Next.js App
Router that calls `render()` directly in server actions, with no pluggable
hook between render and iframe. Forking was the only viable path to insert
the Handlebars-aware pipeline + fixture interpolation that `react-email-bridge`
needs.

- **Original license** preserved in [`license.md`](./license.md).
- **What we changed** (patches): documented in [`../../PATCHES.md`](../../PATCHES.md).
- **How we keep the fork in sync** (rebase process): see [`../../VENDORING.md`](../../VENDORING.md).

The fork is MIT-licensed under the umbrella of this monorepo's
[root LICENSE](../../LICENSE).

## Development

This package is normally built and consumed transitively. To work on the
UI itself:

### 1. Seed email templates

```sh
pnpm dev:seed
```

Generates a boilerplate `emails/` directory for the dev server to render.
Not committed to git.

### 2. Run the preview server

```sh
pnpm dev
```

Roughly equivalent to `next dev` for the preview-server UI. It does **not**
support the hot-reload behavior the `react-email-bridge dev` CLI provides —
this mode is intended for working on the UI itself, not on email templates.

### 3. Open in your browser

http://localhost:3000

## License

MIT. See [`license.md`](./license.md) for the upstream attribution and
[the root LICENSE](../../LICENSE) for our copyright over the patched
distribution.
