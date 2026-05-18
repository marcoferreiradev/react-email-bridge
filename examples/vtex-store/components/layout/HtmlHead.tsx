import { Head } from 'react-email';
import { Fonts } from './Fonts.js';

/**
 * Standard email <head>. Loads Inter + Geist via `<Fonts />` (used by
 * Tailwind's `font-sans` / `font-geist` classes) and sets the document
 * title to the storefront name via the `{{_accountInfo.TradingName}}`
 * marker.
 *
 * Source mirror: `partials/html-head.hbs`. Drops the gulp-injected CSS
 * imports (Tachyons + Bojler) — Tailwind classes handle styling. Drops
 * the MSO conditional comment — react-email + Tailwind handle MSO
 * compatibility internally.
 */
export function HtmlHead() {
  return (
    <Head>
      <title>{`{{_accountInfo.TradingName}}`}</title>
      <Fonts />
    </Head>
  );
}
