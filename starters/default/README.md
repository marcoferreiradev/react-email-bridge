# my-emails-project

Email templates built with [react-email-bridge](../README.md).

## Setup

```bash
pnpm install
```

`pnpm install` resolves `react-email-bridge` and `react-email-bridge-ui` from `./vendor/*.tgz`.

## Develop

```bash
pnpm dev
```

Opens the preview server (default http://localhost:3737). Edit `emails/*.tsx` or `emails/*.json` — the iframe reloads automatically.

## Export

```bash
pnpm export                  # build every template
react-email-bridge export welcome    # build a single one
```

Output lands in `dist/` (e.g. `dist/welcome.hbs`). Copy-paste into VTEX Message Center / Mandrill / etc.

## Project layout

```
.
├── emails/
│   ├── welcome.tsx           # your template
│   └── welcome.json          # adjacent fixture — used for preview only
├── react-email-bridge.config.ts
├── package.json
├── tsconfig.json
└── vendor/
    ├── react-email-bridge-0.0.1.tgz
    └── react-email-bridge-ui-0.0.1.tgz
```

## Adding a new template

1. Create `emails/<name>.tsx` exporting a default function.
2. Create `emails/<name>.json` with sample data.
3. The sidebar auto-updates; no rebuild needed.

If you forget the `.json`, the preview server shows a banner with a "Create empty fixture" button.

## Custom helpers

If your templates use helpers beyond the defaults (or you want better-looking preview values), register them in `react-email-bridge.config.ts`:

```ts
import { defineConfig } from 'react-email-bridge';

export default defineConfig({
  previewHelpers: {
    formatCurrency: (n) =>
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(Number(n) / 100),
  },
});
```

These run only in preview. The exported `.hbs` is identical regardless — the target platform (VTEX, etc.) supplies the real implementation at send time.
