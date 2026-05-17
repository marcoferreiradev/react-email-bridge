---
---

feat(examples/vtex-store): rewrite v0.1 templates faithful to source (PR B.5)

`order-confirmed.tsx` and `order-invoiced.tsx` no longer carry the v0.1
freeform-demo baggage. Both now mirror their source templates
section-by-section, use PR A's shared components, and inline the 4
single-use partials. Fixtures replaced with canonical source versions.
Also promotes `ShippingEstimateRangeTime` to the components barrel.

No public API change.
