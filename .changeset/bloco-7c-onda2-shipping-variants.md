---
---

feat(examples/vtex-store): Onda 2 — 4 shipping/cancel variant templates (PR C)

Ports 4 templates that build on the foundations of PR B (06-shipped) and
PR B.5 (04-invoiced):

- `order-shipped-cancel-request.tsx` (← 07-shipped-cancel-request.hbs)
- `order-delivered.tsx` (← 10-delivered.hbs, inlines delivered/pickedup
  single-use partials)
- `order-shipping-update.tsx` (← 08-shipping-update.hbs, courier-status
  block + tracking + history table)
- `order-invoiced-cancel-request.tsx` (← 05-invoiced-cancel-request.hbs)

No public API change.
