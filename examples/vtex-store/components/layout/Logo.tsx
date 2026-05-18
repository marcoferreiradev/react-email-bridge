import { Img, Section } from 'react-email';
import { placeholder, space } from '../../theme.js';

/**
 * Storefront logo. Uses the centralized `placeholder.logo` URL by default
 * (a placehold.co with "YOUR LOGO" text) so the starter is obviously
 * generic — real consumers replace with their brand asset.
 *
 * Alt text uses the `{{_accountInfo.TradingName}}` marker so VTEX fills
 * in the store name at send time.
 *
 * Modernized in Bloco 11 — original mirrored `partials/logo.hbs`'s
 * hard-coded RedCloud URL; placeholder URL is now centralized in
 * `theme.ts` for easy swap.
 */
export function Logo() {
  return (
    <Section style={{ padding: `${space.md} 0`, textAlign: 'center' }}>
      <Img
        alt={`{{_accountInfo.TradingName}}`}
        src={placeholder.logo}
        style={{ height: '40px', width: 'auto', border: 0, margin: '0 auto' }}
      />
    </Section>
  );
}
