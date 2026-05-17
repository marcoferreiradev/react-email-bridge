# `components/`

Shared React components extracted from
`refs/vtex-email-framework/source/templates/partials/`. Each component
mirrors a Handlebars partial in the source — same structure, same
markers preserved, with `((i18n.*))` references resolved against
`pt-BR/i18n.json` and inlined as PT-BR.

Organized by domain:

```
components/
├── layout/   HtmlHead, Logo
├── messages/ Regards, Hi, OrderReference, Pickup, Shipping, CantCancel, Handling
├── address/  AddressDeliveryNoTitle, AddressDeliveryTitle,
│             AddressPickupNoTitle, AddressPickupTitle, AddressPickupBusinessHours
│             (plus internal AddressDeliveryInfo, AddressPickupInfo — building blocks)
└── order/    Items, Package, Payment, Totals
              (plus internal ShippingEstimate{Scheduled,Range,RangeTime,Date} — Package's ETA branches)
```

Templates import from the top-level barrel:

```ts
import { HtmlHead, Logo, Regards, Package, Payment } from '../components';
```

## Single-use partials NOT extracted

Per the policy in `../PORTING.md`, partials used by only one template
stay inline in that template's `.tsx`:

- `messages/intro` (only 01-confirmed)
- `messages/intro-replaced` (only 09-replaced)
- `messages/delivered` / `messages/pickedup` (only 10-delivered)
- `shipping-summary` (only 01-confirmed; plus its 3 transitive
  `shipping-summary-estimate-*` partials)
- `abandoned-cart-items` (only 12-abandoned-cart)
- `order-link` (only 01-confirmed via messages/intro)

Inlining keeps the templates self-documenting at the cost of small
duplication when patterns recur — but they don't, by design.
