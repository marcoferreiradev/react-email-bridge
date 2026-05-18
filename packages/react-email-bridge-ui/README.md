# react-email-bridge-ui

> 🚧 **You probably want [`react-email-bridge`](https://npmjs.com/package/react-email-bridge) instead.**
>
> This is the live preview server, installed on-demand by the CLI in
> `react-email-bridge`. You never need to install it directly.

Forked from [`@react-email/ui`](https://github.com/resend/react-email)
(Copyright 2024 Plus Five Five, Inc — MIT) to insert Handlebars-aware
rendering + fixture interpolation. License preserved in [LICENSE](./LICENSE).

---

## Development (working on the UI itself)

```sh
pnpm dev:seed   # generate boilerplate emails/ for the dev server
pnpm dev        # next dev for the preview-server UI
```

`pnpm dev` is intended for working on the UI itself, not on email templates.
For the user-facing hot-reload experience (driven by `react-email-bridge dev`),
use the parent package.

Open <http://localhost:3000>.

## License

MIT — both this fork (`react-email-bridge-ui`) and the upstream
`@react-email/ui` it's derived from. Modifications relative to upstream
are documented in `docs/internal/PATCHES.md` of the parent repository;
the fork rebase process is in `docs/internal/VENDORING.md`.
