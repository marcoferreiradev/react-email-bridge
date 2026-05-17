# CONTEXT — `react-email-bridge`

Shared vocabulary of the project. Read first on any new session — every term
below recurs across code, commits, and docs, and using the right word saves
a lot of back-and-forth.

When you explain a concept defined here, just use the term — don't re-derive
it. When a concept recurs in conversation but isn't here, add it (or ask
`/grill-with-docs` to). Don't couple this glossary to implementation details;
include only terms a domain expert would care about.

---

## Pipeline

The end-to-end transformation from `.tsx` source to colable output:

    TSX
      → ReactDOMServer.renderToStaticMarkup
      → substitute hbs() sentinels in style attributes
      → unescapeMarkers (Plano B, first pass)
      → juice (inline CSS)
      → unescapeMarkers (Plano B, second pass — juice re-escapes)
      → output (.hbs for HBS preset)

Used in both **preview** (final step compiles Handlebars against fixture and
renders to iframe) and **export** (final step writes the raw marker output
to disk).

## Marker

A template placeholder such as `{{name}}` or `{{#each items}}…{{/each}}`. The
core does NOT understand markers — it just preserves them as text through
React's serialization. Each preset decides what marker syntax means.

In the HBS preset, markers are Handlebars expressions.

## Sentinel

The alphanumeric identifier `HBSSENTINEL${nanoid(12)}` that `hbs()` returns.
Needed because React's `style` attribute doesn't accept strings — only
objects. The sentinel survives JSX rendering, then gets substituted back to
a real marker (`{{path}}`) in post-processing.

CSS-safe by design: the format avoids characters that `juice`'s CSS parser
or downstream tools would mangle.

## Plano B

The official strategy for surviving React's text-node HTML-escape.
`renderToStaticMarkup` escapes `"`, `'`, `>`, `<`, `&` in text nodes —
breaking block markers like `{{#eq foo "bar"}}` (which become
`{{#eq foo &quot;bar&quot;}}` and fail to parse).

We unescape these characters **only inside marker boundaries**
(`/\{\{[\s\S]*?\}\}/g`), leaving the rest of the document alone.

Originally framed in the briefing as "the fallback to avoid". Validation
(DECISIONS.md D16) revealed it's mandatory. **Two passes** — once before
`juice`, once after, because juice re-escapes during serialization. See
also: [[double-unescape]].

## Preset

A pluggable layer on top of the core that defines:

1. The marker syntax (`{{…}}` for HBS, `{{ x | filter }}` for Liquid)
2. Sugar components (e.g. `<Each>`, `<If>` for HBS)
3. The preview runtime (template engine + helpers for the dev server)
4. The output extension (`.hbs`, `.liquid`, etc.)

v0.1 ships one preset: `react-email-bridge/hbs`. Liquid and Mailchimp are
planned future work.

## Preview runtime

The template engine that runs in the **dev server** (NOT in the export). For
the HBS preset: Handlebars + `handlebars-helpers` + 16 neutral fakes of
VTEX-specific helpers + a `helperMissing` fallback.

The preview runtime never touches the export output — it only renders what
shows up in the iframe.

## Fixture

The `.json` file co-located with a template — `<basename>.tsx` paired with
`<basename>.json`. It's what the preview runtime interpolates against. The
fixture is NOT passed as props to the React component (the component always
receives empty props).

When missing, the dev UI shows a banner with a "Create empty fixture"
button.

## Sugar component

A React component in `/hbs` that emits Handlebars block syntax as text
nodes. `<Each path="items">{children}</Each>` emits
`{{#each items}}…{{/each}}`. No state, no hooks — pure functions.

Sugar components exist because raw `{{#each X}}` + `{{/each}}` as JSX
siblings look ugly and break IDE indentation.

## Raw

The official escape hatch: `<Raw>{`{{#group items by="addressId"}}`}</Raw>`.

For Handlebars patterns not covered by sugar components (`#group`, `#with`,
`#math`, custom helpers, complex sub-expressions). Grep-able by design —
running `rg '<Raw>'` lists every non-sugared HBS in a project, so they're
easy to audit.

## Partial

In `vtex-email-framework`'s Handlebars source, a partial is a sub-template
included via `{{> partial-name}}`. In our React port, partials become
reusable components in `examples/vtex-store/components/`. On render, they
flatten into repeated HTML — VTEX Message Center has no concept of partial.

## Onda

A wave of template porting (Bloco 7 vocabulary). **Onda 1** = the hardest
template first (stress-test the pipeline). **Onda 2** = 4–5 "normal"
templates (patterns established). **Onda 3** = remaining templates (faster,
patterns reused).

## Ground truth

What real VTEX templates use, **not** what VTEX docs claim.

VTEX docs say helpers are a closed set (formatCurrency, formatDate, etc.).
Real templates use `#compare`, `math`, sub-expressions, `@index`, custom
helpers (`eval`, `group`, `richShippingData`). The lib preserves all of
them.

**Always validate against `refs/vtex-email-framework/source/templates/`
before assuming a helper is "supported" or not.**

## Vendoring

We forked `@react-email/ui` into `packages/react-email-bridge-ui/` because
upstream had no plug point between `render` and the iframe (it calls
`render()` directly in Next.js server actions). Each modification in the
fork is documented in PATCHES.md. The rebase process is in VENDORING.md.

## Double unescape

The two passes of `unescapeMarkers` in the pipeline. See [[plano-b]].

---

## Naming conventions

- Variables and functions use the shared vocabulary above (`sentinel`, not
  "placeholder identifier"; `marker`, not "template variable"; `pipeline`,
  not "render flow").
- File names follow the conventions in DECISIONS.md.
- Test files mirror source structure (`src/core/render.ts` →
  `tests/core/render.test.ts`).
