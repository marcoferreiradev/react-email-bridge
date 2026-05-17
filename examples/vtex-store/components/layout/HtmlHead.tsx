import { Head } from 'react-email';

/**
 * Mirrors `refs/vtex-email-framework/source/templates/partials/html-head.hbs`.
 *
 * Differences from source:
 * - Drops the gulp-injected CSS imports (Tachyons + Bojler) — our port uses
 *   react-email primitives + inline styles, no external stylesheets.
 * - Drops the MS Office conditional comment — react-email's serializer
 *   handles MSO compatibility through different mechanisms.
 * - Keeps the `{{_accountInfo.TradingName}}` marker as the document title so
 *   VTEX Message Center fills in the store's brand at send time.
 */
export function HtmlHead() {
  return (
    <Head>
      <title>{`{{_accountInfo.TradingName}}`}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap"
        rel="stylesheet"
      />
    </Head>
  );
}
