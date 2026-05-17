# my-vtex-emails

VTEX transactional email templates built with [react-email-bridge](../../README.md).

> **Heads up — this starter is intentionally empty in v0.1.**
>
> The 13 templates + partials from [`vtex/vtex-emails`](https://github.com/vtex/vtex-emails) (`01-confirmed`, `02-cancelled`, `03-payment-approved`, …, `13-refund`) are scheduled for porting — see [ROADMAP.md](../../ROADMAP.md). Start writing your own templates in `emails/` and the workflow below already works.

## Setup

```bash
pnpm install
pnpm dev    # opens http://localhost:3737
```

## Write a template

Create `emails/<name>.tsx` + `emails/<name>.json` (fixture). The sidebar auto-discovers new files.

```tsx
// emails/order-confirmed.tsx
import { Html, Body, Container, Heading, Text } from '@react-email/components';
import { hbs } from 'react-email-bridge';
import { Each, If } from 'react-email-bridge/hbs';

export default function OrderConfirmed() {
  return (
    <Html>
      <Body>
        <Container>
          <Heading style={{ color: hbs('storeTheme.primary') }}>
            Olá {`{{clientProfileData.firstName}}`}, seu pedido foi confirmado!
          </Heading>
          <Text>Pedido <strong>#{`{{orderId}}`}</strong></Text>
          <Each path="items">
            <Text>{`{{name}}`} × {`{{quantity}}`}</Text>
          </Each>
        </Container>
      </Body>
    </Html>
  );
}
```

```json
// emails/order-confirmed.json (real VTEX shape)
{
  "storeTheme": { "primary": "#0066ff" },
  "clientProfileData": { "firstName": "Marco" },
  "orderId": "1547670500900-02",
  "items": [
    { "name": "Capacete preto", "quantity": 1 }
  ]
}
```

## Reference fixtures

The `refs/vtex-email-framework/source/data/vtex/*.json` files in this repo (cloned during `pnpm install`) contain the real VTEX payload shapes for every transactional event. Copy + rename them to bootstrap your fixture quickly:

```bash
cp /path/to/react-email-bridge/refs/vtex-email-framework/source/data/vtex/04-invoiced.json emails/order-invoiced.json
```

## Export

```bash
pnpm export
```

Writes `dist/*.hbs`. Copy-paste into VTEX Message Center → HTML field.

## Helpers available out-of-the-box

All `handlebars-helpers` (~150) + the VTEX-flavored fakes that match oficina's helpers:

- `formatCurrency`, `formatCurrencyWithoutDecimals`, `formatUSDCurrency`, `formatPENCurrency`, `multiplyCurrency`
- `formatDate`, `formatTime`, `formatDateTime`, `formatUSDate`, `formatUSDateTime`, `formatDateUtc`, `formatDateNoTimezone`, `addDaysToDate`, `formatNumber`
- `hasSubStr`, `ifCond`, `isMoreThanOneDay`
- `math`, `group`, `eval`, `richShippingData`

If your VTEX store registered custom helpers server-side, add fakes to `react-email-bridge.config.ts → previewHelpers` so the preview renders match production.

## What's coming (see [ROADMAP.md](../../ROADMAP.md))

- Pre-ported templates for the 13 VTEX transactional events
- Pre-built partial components: `<Logo />`, `<HtmlHead />`, `<AddressDeliveryTitle />`, `<Package />`, `<Payment />`, `<ShippingSummary />`, `<Totals />`, message partials
- i18n strategy (today: condicional HBS; v0.2: investigando alternativa)
- Fixture → typed paths inference
