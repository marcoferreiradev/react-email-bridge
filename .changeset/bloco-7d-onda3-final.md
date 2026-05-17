---
---

feat(examples/vtex-store): Onda 3 — final 6 templates close Bloco 7 (PR D)

Ports the last 6 VTEX templates:

- `order-cancelled.tsx` (← 02-cancelled.hbs)
- `order-payment-approved.tsx` (← 03-payment-approved.hbs)
- `order-replaced.tsx` (← 09-replaced.hbs, stand-alone complex)
- `back-in-stock.tsx` (← 11-let-me-know.hbs, renamed for clarity)
- `abandoned-cart.tsx` (← 12-abandoned-cart.hbs)
- `order-refund.tsx` (← 13-refund.hbs)

After this PR: 13/13 templates faithful. Bloco 7 closed. Next:
Bloco 11 (modernization) then npm publish v0.2.0.

No public API change.
