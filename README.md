# react-email-bridge

> Write transactional emails in **React Email**, export to **HTML + template markers** (Handlebars). Live preview against real data — paste straight into VTEX, Mandrill, Mailchimp, or any platform that interprets `{{variable}}` syntax.

[![npm](https://img.shields.io/npm/v/react-email-bridge.svg)](https://npmjs.com/package/react-email-bridge)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![tests: 111](https://img.shields.io/badge/tests-111-green)](#tests)

---

## Why this exists

VTEX Message Center, Mandrill, Mailchimp, and most transactional-email platforms render templates server-side via **Handlebars** (or a Handlebars-compatible engine). You paste raw HTML with `{{customer.firstName}}`, `{{#each items}}…{{/each}}` markers, and the platform fills them in per send.

The pain: writing and maintaining that HTML by hand is **brutal**.

- Tables for layout (Outlook compat).
- CSS inlining (Gmail strips `<style>` tags).
- Helper soup (`{{formatCurrency value}}`, `{{#compare a '==' b}}`, `{{#group items by="addressId"}}`).
- No componentization. No type safety. No live preview against your real data shape.

**[React Email](https://react.email)** solves authoring brilliantly — you write components, get auto inlined CSS, get table layout for free. But it has **no story for template markers**: its render either produces final HTML or breaks on `{{` characters.

`react-email-bridge` connects the two:

```tsx
<Heading>Olá {`{{customer.firstName}}`}!</Heading>

<Each path="items">
  <Row>
    <Text>{`{{name}}`} — R$ {`{{formatCurrency price}}`}</Text>
  </Row>
</Each>
```

…compiles to clean Handlebars-ready HTML, **previews live with the real engine running against a `.json` fixture**, and exports a `.hbs` file you paste directly into VTEX (or wherever).

---

## What you get

| | |
|---|---|
| ✓ Authoring | Write `.tsx` with React Email components |
| ✓ Markers | Variables, loops, conditionals, sub-expressions, custom helpers — all preserved |
| ✓ Live preview | Real Handlebars + real fixture data, hot reloaded on save |
| ✓ Editor UI | Sidebar, code view (React / HTML / Plain Text / Data), Compatibility/Linter/Spam tabs, dark mode, responsive toggle, Resend send |
| ✓ Export | `pnpm export` → `.hbs` file, CSS inlined, ready to paste |
| ✓ Helper coverage | `handlebars-helpers` (~150 helpers) + VTEX-flavored fakes (`formatCurrency`, `formatDate`, `math`, `group`, `richShippingData`, …) |
| ✓ Fixture story | `<basename>.json` adjacent to the template; banner + one-click creation if missing |

---

## Install

```bash
npm install react-email-bridge
# or
pnpm add react-email-bridge
```

The CLI is bundled. The live preview server (`react-email-bridge-ui`) is fetched on-demand the first time you run `dev` — you don't need to install it explicitly.

---

## Quickstart — minimal project in <60 seconds

```bash
npx react-email-bridge init my-emails
cd my-emails
npm run dev          # http://localhost:3737
```

`init` scaffolds a complete project, runs `<your-package-manager> install`, and initializes a git repo. The package manager is auto-detected from how you invoke the CLI (`npm`, `pnpm`, `yarn`, or `bun`).

```
my-emails/
├── emails/
│   ├── welcome.tsx          # your template
│   └── welcome.json         # fixture used for preview only
├── .npmrc
├── react-email-bridge.config.ts
├── tsconfig.json
└── package.json
```

Open the URL the dev server prints. You'll see:

- **Left sidebar** — list of your `.tsx` templates (auto-discovered from `emails/`).
- **Center iframe** — live preview with Handlebars + fixture data interpolated.
- **Bottom tabs** — Compatibility check, Linter, Spam score, Resend send.
- **Top toggle** — switch to code view (React / HTML / Plain Text / Data).
- **Right edge** — drag to resize for desktop/mobile.

Edit `emails/welcome.tsx` or `emails/welcome.json` — the iframe reloads automatically.

### Want a richer starting point?

Pass `--template vtex-store` for 13 pre-ported VTEX transactional templates + shared partials + Tailwind config:

```bash
npx react-email-bridge init my-vtex-emails --template vtex-store
```

Same flow — no need to clone the repo. Templates are fetched on-demand from GitHub, pinned to your installed CLI version.

### Options

```
npx react-email-bridge init <dir> [options]

  -t, --template <name>   Template to use (default: generic-hbs)
  --skip-install          Skip running <pm> install
  --skip-git              Skip git init + initial commit
```

### Export

```bash
npm run export
```

Writes `dist/welcome.hbs`:

```html
<!DOCTYPE html ...>
…
<h1 style="color:{{theme.primaryColor}}">Welcome, {{customer.firstName}}!</h1>
<p>Your order <strong>#{{orderId}}</strong> is confirmed.</p>
{{#each items}}
  <p>• {{name}} × {{quantity}}</p>
{{/each}}
{{#if trackingUrl}}
  <p><a href="{{trackingUrl}}">Track your order</a></p>
{{else}}
  <p>Tracking will be available soon.</p>
{{/if}}
…
```

Copy-paste into VTEX Message Center's HTML field. VTEX fills the markers per send. Done.

---

## Writing a template

```tsx
import {
  Html, Head, Body, Container, Heading, Text, Link, Section, Row, Column, Img,
} from '@react-email/components';
import { hbs } from 'react-email-bridge';
import { Each, If, Unless, Else, Raw } from 'react-email-bridge/hbs';

export default function OrderConfirmed() {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#fff' }}>
        <Container>
          {/* Variable in a string attribute — write the marker directly */}
          <Img src={`{{logoUrl}}`} alt={`{{accountName}}`} width="180" />

          {/* Variable in style — use hbs() because React rejects non-string style values */}
          <Heading style={{ color: hbs('theme.primaryColor') }}>
            Olá {`{{customer.firstName}}`}!
          </Heading>

          {/* Loop */}
          <Each path="items">
            <Row>
              <Column><Text>{`{{name}}`}</Text></Column>
              <Column><Text>R$ {`{{formatCurrency price}}`}</Text></Column>
            </Row>
          </Each>

          {/* Conditionals */}
          <If path="hasInvoice">
            <Text><Link href={`{{invoiceUrl}}`}>Ver nota fiscal</Link></Text>
            <Else />
            <Text>Nota fiscal em breve.</Text>
          </If>

          {/* Comparator with operator */}
          <If compare={['items.length', '>', '1']}>
            <Text>Você comprou múltiplos itens.</Text>
          </If>

          {/* Negation */}
          <Unless path="cancelled">
            <Text>Pedido ativo.</Text>
          </Unless>

          {/* Escape hatch: any arbitrary HBS via <Raw> */}
          <Raw>{`{{#group items by="category"}}`}</Raw>
            <Text>Categoria {`{{value}}`}:</Text>
            <Each path="items">
              <Text>- {`{{name}}`}</Text>
            </Each>
          <Raw>{`{{/group}}`}</Raw>
        </Container>
      </Body>
    </Html>
  );
}
```

And the fixture `OrderConfirmed.json` for preview:

```json
{
  "theme": { "primaryColor": "#0066ff" },
  "customer": { "firstName": "Marco" },
  "logoUrl": "https://…/logo.png",
  "accountName": "My Store",
  "items": [
    { "name": "Helmet", "price": 19990, "category": "safety" },
    { "name": "Gloves", "price": 8990, "category": "safety" }
  ],
  "hasInvoice": true,
  "invoiceUrl": "https://…/inv/123",
  "cancelled": false
}
```

---

## API

### `react-email-bridge`

```ts
import { render, hbs, defineConfig, type Preset, type BridgeConfig } from 'react-email-bridge';
```

| Export | Purpose |
|---|---|
| `render(element, { inlineCss? })` | Renders a React element to HTML with markers preserved. CSS inlined by default. |
| `hbs(path: string)` | Sentinel for use inside `style` objects. Becomes `{{path}}` in output. |
| `defineConfig({ … })` | Typed helper for `react-email-bridge.config.ts`. |
| `Preset`, `BridgeConfig` | Public types. |

### `react-email-bridge/hbs`

```ts
import { Each, If, Unless, Else, Raw, previewWithFixture } from 'react-email-bridge/hbs';
```

| Component | Emits |
|---|---|
| `<Each path="items">` | `{{#each items}}…{{/each}}` |
| `<Each path="items" as="item">` | `{{#each items as \|item\|}}…{{/each}}` |
| `<If path="x">` | `{{#if x}}…{{/if}}` |
| `<If eq={['a', '"b"']}>` | `{{#eq a "b"}}…{{/eq}}` |
| `<If compare={['a', '==', 'b']}>` | `{{#compare a '==' b}}…{{/compare}}` |
| `<Unless path="x">` | `{{#unless x}}…{{/unless}}` |
| `<Else />` | `{{else}}` (valid in `#if`, `#unless`, `#each`) |
| `<Raw>{\`…\`}</Raw>` | Children emitted as text — escape hatch for any custom HBS |

### Config file

`react-email-bridge.config.ts` is optional and loaded from your project root:

```ts
import { defineConfig } from 'react-email-bridge';

export default defineConfig({
  outputExtension: '.html',           // default '.hbs'
  strict: true,                       // default false — throw on missing vars
  previewHelpers: {
    uppercase: (s) => String(s).toUpperCase(),
  },
});
```

### CLI

| Command | What it does |
|---|---|
| `react-email-bridge init [dir]` | Scaffold `emails/` with one example template + fixture + config |
| `react-email-bridge dev` | Start the live preview server (default port 3737) |
| `react-email-bridge export <name>` | Build one template to `dist/<name>.hbs` |
| `react-email-bridge export --all` | Build every template |

---

## Migration from `vtex-emails` Handlebars

If you have an existing Handlebars-based VTEX email project (e.g. forked from [vtex-email-framework](https://github.com/vtex/vtex-emails)), porting is mechanical:

| Old (`.hbs`) | New (`.tsx`) |
|---|---|
| Raw HTML tables | React Email components (`<Container>`, `<Section>`, `<Row>`, `<Column>`) |
| `{{firstName}}` in text | `{\`{{firstName}}\`}` (template literal in JSX) |
| `{{#each items}}…{{/each}}` | `<Each path="items">…</Each>` |
| `{{#compare a '==' b}}…{{/compare}}` | `<If compare={['a', '==', 'b']}>…</If>` |
| `{{#unless cancelled}}…{{/unless}}` | `<Unless path="cancelled">…</Unless>` |
| `{{#each items}}…{{else}}…{{/each}}` | `<Each…><Else />…</Each>` |
| `{{#group items by="x"}}…{{/group}}` | `<Raw>{\`…\`}</Raw>` |
| Custom helpers (`{{formatCurrency 100}}`) | Same string in JSX — preview runtime ships fakes for the common VTEX set |
| Partials (`{{> logo}}`) | React components (`<Logo />`) — React flattens them at render |
| `data/*.json` fixture per template | `emails/<basename>.json` (1:1 same shape) |
| `yarn dist` to produce final HTML | `react-email-bridge export --all` |

See `examples/vtex-store/` in this repo for a real-world VTEX template port using the densest patterns: `#each orders`, `#richShippingData`, `#group by addressId`, `#group by packageId`, `#math index '+' 1`, `(math @index "%" 2)` sub-expressions.

---

## Examples in this repo

| Folder | Demonstrates |
|---|---|
| `examples/generic-hbs/` | Agnostic baseline — all sugar components, helpers, sub-expressions. Also the source for the default `npx react-email-bridge init` scaffold. |
| `examples/vtex-store/` | 13 real VTEX transactional templates, Tailwind-styled with the Halo design system, shared partials. Also the source for `new-project --template vtex-store`. |

Examples are workspace-bound (`workspace:*` dep on the core) and run as part of CI smoke tests. The same directory tree is what gets copied into a user project when scaffolding — see [ADR-0001](./docs/adr/0001-examples-as-starter-source.md).

---

## Architecture

`react-email-bridge` is a **monorepo** with two npm packages:

```
react-email-bridge/                  # this repo
├── packages/
│   ├── react-email-bridge/          # CLI + core + HBS preset  (~38KB built)
│   └── react-email-bridge-ui/       # Next.js preview server (forked @react-email/ui, MIT)
├── examples/
│   ├── generic-hbs/                 # minimal — also the default scaffold
│   └── vtex-store/                  # 13 VTEX templates — also the vtex-store scaffold
├── scripts/new-project.ts           # author shortcut — thin shim over the published `init`
├── validation/                      # P0 end-to-end stress test (28 asserts)
└── docs/
    ├── adr/                         # architectural decisions
    └── internal/                    # contributor-only docs (DECISIONS, CONTEXT, PATCHES, …)
```

**Pipeline:**

```
TSX  →  @react-email/render  →  substitute hbs() sentinels  →
unescape markers (Plano B)   →  juice CSS inline  →  unescape again
                                            │
                          ┌─────────────────┴──────────────────┐
                          │                                    │
                  Handlebars.compile(html)(fixture)        Write to .hbs
                          │
                       iframe in editor
```

Read [docs/internal/DECISIONS.md](./docs/internal/DECISIONS.md) for the 16 frozen v0.1 design choices (sentinel format, strict mode default, helper registration strategy, …) and [docs/adr/](./docs/adr/) for decisions from v0.2 onwards.

---

## Tests

```bash
pnpm test
```

**111 vitest tests** across 8 files covering:

- Sugar components (`Each`, `If`, `Unless`, `Else`, `Raw`) — output strings.
- Sentinel substitution + marker unescape (Plano B for React entity escaping).
- VTEX-flavored fake helpers (`formatCurrency`, `formatDate`, `math`, `group`, `eval`, `richShippingData`, etc) — input/output pairs.
- `helperMissing` semantics (variable lookup vs unknown helper).
- Preview runtime with config-supplied helper overrides.
- Full `render()` pipeline against every marker context (text, attr, style, sub-expressions, nested blocks).
- CLI commands (`init`, `export`, `export --all`, error paths, config-driven extension).
- End-to-end fixture interpolation (Handlebars + `.json`).

Plus `pnpm validate` runs a stress-test template through the export pipeline with 28 assertions covering every marker context.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local setup, the git-hook gates, the changesets release flow, and the scaffolding workflow for working on the library itself.

---

## Acknowledgments

- [`@react-email/ui`](https://github.com/resend/react-email) — the preview editor (sidebar, code view, compatibility/spam tabs, dark mode, resizable iframe) is a fork of `@react-email/ui` (MIT). All the heavy UI lift is theirs; we patched the rendering pipeline to add Handlebars interpolation against `.json` fixtures.
- [`handlebars-helpers`](https://github.com/helpers/handlebars-helpers) — covers ~150 of the helpers VTEX templates use in the wild.
- [`vtex/vtex-emails`](https://github.com/vtex/vtex-emails) — the reference official framework whose template patterns we cover end-to-end.

---

## License

MIT. See [LICENSE](./LICENSE).

The vendored `@react-email/ui` retains its original MIT copyright (Bu Kinoshita and Zeno Rocha) — preserved in `LICENSE`.
