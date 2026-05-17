# PORTING — VTEX Email Framework → `examples/vtex-store/`

Inventory and execution log for the Bloco 7 port of all 13 templates from
`refs/vtex-email-framework/` into React Email + react-email-bridge.

Decisions and rationale that don't fit here live in
[../../CONTEXT.md](../../CONTEXT.md). The PR shape, waves, and locked
conventions are summarized in the parent issue
[#5](https://github.com/marcoferreiradev/react-email-bridge/issues/5).

---

## Source

`refs/vtex-email-framework/source/templates/`:

- 13 templates (`01-confirmed.hbs` … `13-refund.hbs`)
- 35 partials in `partials/` (23 top-level + 12 in `partials/messages/`)
- 13 fixtures in `../data/vtex/<NN-name>.json`
- 3 locales in `../locales/{en-US,es-AR,pt-BR}/i18n.json` — port uses `pt-BR`

The framework's gulp build does two things at build time:

1. Inlines partials via `<!-- partial:partials/X.hbs --><!-- partial -->`
   directives (NOT Handlebars `{{> X}}` syntax).
2. Resolves `((i18n.path))` references against the chosen locale's
   `i18n.json`.

What lands in VTEX Message Center (the framework's `dist/`) is therefore
inlined HTML with localized strings and `{{handlebars}}` runtime markers
preserved. Our port mirrors that output shape:

- Partials become **shared React components** in `components/`.
- `((i18n.*))` references become **inline PT-BR strings** (lifted from
  `locales/pt-BR/i18n.json`).
- `{{handlebars}}` markers stay as JSX text literals or marker-aware
  sugar components (`<Each>`, `<If>`, `<Raw>`, `hbs()` for style attrs).

---

## Template × partial matrix

| Template                       | Lines | Partials | Helpers | Wave    | Status |
|--------------------------------|------:|---------:|--------:|---------|--------|
| 01-confirmed                   |   N/A |       10 |       5 | (v0.1)  | in `order-confirmed.tsx` (refactor in PR A) |
| 04-invoiced                    |   N/A |        6 |       6 | (v0.1)  | in `order-invoiced.tsx` (refactor in PR A) |
| 06-shipped                     |   103 |       12 |       4 | Onda 1  | PR B — stress test |
| 05-invoiced-cancel-request     |    81 |        8 |       5 | Onda 2  | PR C — variant of 04 |
| 07-shipped-cancel-request      |   109 |       14 |       4 | Onda 2  | PR C — variant of 06 |
| 08-shipping-update             |   110 |        8 |       6 | Onda 2  | PR C — variant of 06 |
| 10-delivered                   |   101 |       11 |       4 | Onda 2  | PR C — variant of 06 |
| 02-cancelled                   |    53 |        6 |       4 | Onda 3  | PR D |
| 03-payment-approved            |    55 |        6 |       3 | Onda 3  | PR D |
| 09-replaced                    |    98 |       10 |       5 | Onda 3  | PR D — stand-alone complex |
| 11-let-me-know                 |    47 |        3 |       0 | Onda 3  | PR D |
| 12-abandoned-cart              |    51 |        4 |       0 | Onda 3  | PR D |
| 13-refund                      |    62 |        3 |       4 | Onda 3  | PR D |

Helper counts include only block helpers (`#each`, `#if`, `#compare`,
`#group`, `#math`, `#with`, `#richShippingData`, `#hasSubStr`, `else`).
Inline helpers (`formatCurrency`, `formatDate*`, etc.) appear across
nearly all templates and aren't counted here.

---

## Partial usage frequency (drives PR A extraction)

| Partial                          | Used by N templates | Templates |
|----------------------------------|--------------------:|-----------|
| `html-head`                      | 13 | all |
| `logo`                           | 13 | all |
| `messages/regards`               | 13 | all |
| `messages/order-reference`       |  8 | 02, 03, 04, 05, 06, 07, 08, 10 |
| `package`                        |  6 | 01, 06, 07, 08, 09, 10 |
| `items`                          |  5 | 02, 05, 06, 07, 10 |
| `messages/hi`                    |  4 | 03, 04, 05, 08 |
| `address-delivery-no-title`      |  4 | 06, 07, 08, 10 |
| `address-pickup-no-title`        |  4 | 06, 07, 08, 10 |
| `messages/pickup`                |  3 | 06, 07, 10 |
| `payment`                        |  3 | 01, 03, 09 |
| `totals`                         |  3 | 01, 02, 09 |
| `address-delivery-title`         |  2 | 01, 09 |
| `address-pickup-title`           |  2 | 01, 09 |
| `address-pickup-business-hours`  |  2 | 06, 07 |
| `messages/cant-cancel`           |  2 | 05, 07 |
| `messages/handling`              |  2 | 04, 05 |
| `messages/shipping`              |  2 | 06, 07 |
| `messages/intro`                 |  1 | 01 |
| `messages/intro-replaced`        |  1 | 09 |
| `messages/delivered`             |  1 | 10 |
| `messages/pickedup`              |  1 | 10 |
| `shipping-summary`               |  1 | 01 |
| `abandoned-cart-items`           |  1 | 12 |

Plus partials that are **transitively included** by other partials (e.g.
`address-delivery-title` includes `address-delivery-info`). Those count
under their parent in the matrix above.

### PR A extraction scope (used by ≥2 templates → component)

18 partials become React components in `examples/vtex-store/components/`:

`HtmlHead`, `Logo`, `Regards`, `OrderReference`, `Package`, `Items`, `Hi`,
`AddressDeliveryNoTitle`, `AddressPickupNoTitle`, `Pickup`, `Payment`,
`Totals`, `AddressDeliveryTitle`, `AddressPickupTitle`,
`AddressPickupBusinessHours`, `CantCancel`, `Handling`, `Shipping`.

The 6 single-use partials (`intro`, `intro-replaced`, `delivered`,
`pickedup`, `shipping-summary`, `abandoned-cart-items`) stay inline in
the templates that use them.

---

## Helper usage cross-reference

| Helper             | Used by N templates | Notes |
|--------------------|--------------------:|-------|
| `#compare`         | 10 | with operators `==`, `!=`, `>` |
| `#group ... by="x"`|  8 | hash params; needs `<Raw>` or pass-through |
| `#richShippingData`|  8 | custom VTEX block — handled by preview fake helper |
| `else`             |  9 | in `#compare` and `#if` blocks |
| `#each`            |  6 | with `@index`, `@first`, `@last`, parent paths `../`, `../../` |
| `#if` / `#unless`  |  5 | also `<If>` / `<Unless>` sugar |
| `#math`            |  2 | in 01, 09 — both block form and sub-expression form |
| `#with`            |  1 | in 13 |
| `#hasSubStr`       |  0 | (not in vtex-email-framework; appears in oficina) |

Sub-expressions like `(math @index "%" 2)` appear in 01 and 09. These
need `<Raw>` since sugar components don't compose into parens.

---

## Per-template implementation notes

### Onda 1 — `06-shipped`

**Source**: `refs/vtex-email-framework/source/templates/06-shipped.hbs`
(103 lines)

**Output**: `examples/vtex-store/emails/order-shipped.tsx` +
`examples/vtex-store/emails/order-shipped.json`

**Partials used** (12): all 12 already in the shared-extraction set,
which is intentional — PR B can compose entirely from components built
in PR A.

**Helpers**: `#compare`, `else`, `#group`, `#richShippingData`.

**Special patterns**:

- "Just 1 package" vs "More than 1 package" branch using
  `{{#compare items.length '==' shippingData.logisticsInfo.length}}`.
- Pickup-vs-delivery branch using
  `{{#compare shippingData.logisticsInfo.0.selectedDeliveryChannel '==' 'pickup-in-point'}}`.
- `{{#group items by="packageId"}}` to render per-package item lists.

**Risks**:

- The pickup/delivery branching produces 4 heading variants
  (one/many × pickup/delivery) — sugar-component nesting needs to
  preserve all 4 branches without dropping any.
- `messages/pickup` and `messages/shipping` partials are conditionally
  rendered inside those branches — ensure the React components emit the
  right `{{else}}` placement.

### Onda 2 — variants

- **07-shipped-cancel-request**: 06-shipped + `messages/cant-cancel` overlay.
- **08-shipping-update**: simpler 06-shipped (no full package list).
- **10-delivered**: 06-shipped + `messages/delivered` / `messages/pickedup`.
- **05-invoiced-cancel-request**: 04-invoiced + `messages/cant-cancel`.

These should fall out quickly once Onda 1's partial composition is set.

### Onda 3 — remaining

- **02-cancelled, 03-payment-approved, 11-let-me-know, 12-abandoned-cart,
  13-refund**: simpler templates, low helper count, low partial overlap
  with the shipping family.
- **09-replaced**: stand-alone complex (12 helper blocks including
  `#math` sub-expressions). The plan was to keep it for Onda 3 because
  it doesn't share much with the shipping pattern — handle it as a
  near-fresh-start template.

---

## Fixtures

Each template gets `<basename>.json` adjacent to the `.tsx`, copied
verbatim from `refs/vtex-email-framework/source/data/vtex/<NN-name>.json`.
These are the real fixtures the framework's preview uses — full shape
parity is the goal, so any helper or path that resolves against them at
preview time matches what VTEX Message Center would receive in production.

---

## Out of scope

- Cross-reference with `refs/email-templates-oficina/` (deferred; only
  pulled in if a pattern surfaces during port that vtex-email-framework
  doesn't cover — e.g. `eval`, `isMoreThanOneDay` helpers).
- Visual parity with the original Tachyons + Bojler layout. Port uses
  react-email primitives (`<Container>`, `<Section>`, `<Row>`, `<Column>`).
  Small visual differences expected and accepted.
- Templates that vtex-email-framework doesn't ship but a real store
  might want (e.g. wishlist, review-request). Those land in a future
  starter package, not the example.
