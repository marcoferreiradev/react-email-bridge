import { defineConfig } from 'react-email-bridge';

/**
 * Config tuned for VTEX Message Center.
 *
 * Default helpers (`formatCurrency`, `formatDate`, `math`, `group`,
 * `richShippingData`, etc) match the oficina/vtex-email-framework helper
 * set, so most templates render without registering custom helpers.
 *
 * If your VTEX store has private helpers registered server-side, add them
 * to `previewHelpers` so the preview rendering matches production visually.
 * They don't travel with the exported `.hbs` — VTEX provides the real
 * implementation at send time.
 */
export default defineConfig({
  // outputExtension: '.hbs',  // default
  // strict: true,             // turn on while authoring to catch fixture-shape gaps
  // previewHelpers: {
  //   storeBrandColor: (storeId) => storeId === 'prime' ? '#FFD700' : '#000',
  // },
});
