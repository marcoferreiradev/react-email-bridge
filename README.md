# react-email-bridge

> Write transactional emails in **React Email**, export to **HTML + template markers** (Handlebars). Live preview against real data — paste straight into VTEX, Mandrill, Mailchimp, or any platform that interprets `{{variable}}` syntax.

![status: pre-release v0.1](https://img.shields.io/badge/status-pre--release%20v0.1-orange)
![license: MIT](https://img.shields.io/badge/license-MIT-blue)
![tests: 93/93](https://img.shields.io/badge/tests-93%2F93-green)

---

## Why this exists

VTEX Message Center, Mandrill, Mailchimp, and most transactional-email platforms render templates server-side via **Handlebars** (or a Handlebars-compatible engine). You paste raw HTML with `{{customer.firstName}}`, `{{#each items}}…{{/each}}` markers, and the platform fills them in per send.

The pain: writing and maintaining that HTML by hand is **brutal**.

- Tables for layout (Outlook compat).
- CSS inlining (Gmail strips `<style>` tags).
- Helper soup (`{{formatCurrency value}}`, `{{#compare a '==' b}}`, `{{#group items by="addessId"}}`).
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

## Quickstart — start a test template in <2 minutes

Until `react-email-bridge` is published to npm, the workflow uses **local tarballs** produced once from this repo. After that, the `new-project` script bootstraps an isolated project in a single command.

### Step 1 — Clone and build the tarballs (one time)

```bash
git clone <this-repo> react-email-bridge
cd react-email-bridge
pnpm install
pnpm pack-all
```

`pack-all` builds both packages, writes them to `dist-tarballs/`, **and copies them into `starters/*/vendor/`** so the starter is ready to use.

### Step 2 — Bootstrap a new email project (one command)

```bash
pnpm -w run new-project ../my-emails
```

This:

1. Copies `starters/default/` to `../my-emails` (relative to repo, anywhere you want).
2. Runs `pnpm install` inside it. The starter's `package.json` resolves `react-email-bridge` and `react-email-bridge-ui` from `./vendor/*.tgz`.
3. Runs `git init` + initial commit so `git status` works out of the box.

Pick a different starter with `--template`:

```bash
pnpm -w run new-project ../my-vtex-emails --template vtex-full
```

Starters available today:

| Name | What's inside |
|---|---|
| `default` (default if you omit `--template`) | One `welcome.tsx` template + fixture + config + tsconfig. Generic. |
| `vtex-full` | VTEX-tuned package.json + config; empty `emails/`. Pre-ported VTEX templates incoming — see [ROADMAP.md](./ROADMAP.md). |

Use `--skip-install` if you want to inspect first:

```bash
pnpm -w run new-project ../my-emails --skip-install
cd ../my-emails && pnpm install
```

### Step 3 — Start the preview server

```bash
cd ../my-emails
pnpm dev
```

Open the URL it prints (default http://localhost:3737). You'll see:

- **Left sidebar**: list of your `.tsx` templates (auto-discovered from `emails/`).
- **Center iframe**: live preview with Handlebars + fixture data interpolated.
- **Bottom tabs**: Compatibility check, Linter, Spam score, Resend send.
- **Top toggle**: switch to code view (React / HTML / Plain Text / Data).
- **Right side**: drag to resize for desktop/mobile.

Edit `emails/welcome.tsx` or `emails/welcome.json` — the iframe reloads automatically (server-side render + socket.io push).

If you delete `emails/welcome.json`, you'll see a banner with a one-click "Create empty fixture" button.

### Step 4 — Export to paste in VTEX (or Mandrill, etc.)

```bash
pnpm export
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

Copy-paste into VTEX Message Center's HTML field. VTEX will fill the markers per-order. Done.

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
| `react-email-bridge init` | Scaffold `emails/` with one example template + fixture + config |
| `react-email-bridge dev` | Start the live preview server (default port 3737) |
| `react-email-bridge export <name>` | Build one template to `dist/<name>.hbs` |
| `react-email-bridge export --all` | Build every template |

---

## Migration from `vtex-emails` / `oficina` Handlebars

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

See `examples/vtex-store/` for a real-world VTEX template port using the densest patterns: `#each orders`, `#richShippingData`, `#group by addressId`, `#group by packageId`, `#math index '+' 1`, `(math @index "%" 2)` sub-expressions.

---

## Examples in this repo

| Folder | Demonstrates |
|---|---|
| `examples/generic-hbs/` | Agnostic baseline — all sugar components, helpers, sub-expressions |
| `examples/vtex-store/` | Real VTEX fixture (1119 lines from `vtex-email-framework`), templates use full helper stack |

---

## Architecture

`react-email-bridge` is a **monorepo** with two npm packages:

```
react-email-bridge/                  # this repo
├── packages/
│   ├── react-email-bridge/          # CLI + core + HBS preset  (~30KB built)
│   └── react-email-bridge-ui/       # Next.js preview server (forked @react-email/ui, MIT)
├── examples/
├── starters/                        # bootstrap scaffolds (default, vtex-full, ...)
├── validation/
└── DECISIONS.md                     # 16 design decisions rationale
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

Read [DECISIONS.md](./DECISIONS.md) for the 16 design choices and the reasoning behind each one (sentinel format, strict mode default, helper registration strategy, etc.).

---

## Repo scripts

| Command | What it does |
|---|---|
| `pnpm install` | Install workspace deps. |
| `pnpm build` | Build both packages (`react-email-bridge` + `react-email-bridge-ui`). |
| `pnpm test` | Run the full vitest suite. |
| `pnpm validate` | End-to-end stress test of the render pipeline (validation/test-pipeline.tsx). |
| `pnpm pack-all` | Build + pack both packages into `dist-tarballs/` and copy into `starters/*/vendor/`. |
| `pnpm -w run new-project <dir> [--template <name>] [--skip-install]` | Bootstrap a new email project from a starter (default: `default`). |

## Tests

```bash
pnpm test
```

**93 vitest tests** across 7 files covering:

- Sugar components (`Each`, `If`, `Unless`, `Else`, `Raw`) — output strings.
- Sentinel substitution + marker unescape (Plano B for React entity escaping).
- All 16 VTEX-flavored fake helpers (`formatCurrency`, `formatDate`, `math`, `group`, `eval`, `richShippingData`, etc) — input/output pairs.
- `helperMissing` semantics (variable lookup vs unknown helper).
- Preview runtime with config-supplied helper overrides.
- Full `render()` pipeline against every marker context (text, attr, style, sub-expressions, nested blocks).
- CLI commands (`init`, `export`, `export --all`, error paths, config-driven extension).
- End-to-end fixture interpolation (Handlebars + `.json`).

Plus `pnpm validate` runs a stress-test template through the export pipeline with 28 assertions (covering every marker context).

---

## Acknowledgments

- [`@react-email/ui`](https://github.com/resend/react-email) — the preview editor (sidebar, code view, compatibility/spam tabs, dark mode, resizable iframe) is a fork of `@react-email/ui` (MIT). All the heavy UI lift is theirs; we patched the rendering pipeline to add Handlebars interpolation against `.json` fixtures.
- [`handlebars-helpers`](https://github.com/helpers/handlebars-helpers) — covers ~150 of the helpers VTEX templates use in the wild.
- [`vtex/vtex-emails`](https://github.com/vtex/vtex-emails) — the reference oficial framework whose template patterns we cover end-to-end.

---

## License

MIT. See [LICENSE](./LICENSE).

The vendored `@react-email/ui` retains its original MIT copyright (Bu Kinoshita and Zeno Rocha) — preserved in `LICENSE`.
